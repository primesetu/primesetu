import asyncio
import asyncpg
import pyodbc
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def validate_date(dt):
    if not dt: return None
    if isinstance(dt, datetime):
        if dt.year < 1901: return None
    return dt

async def migrate_stockledger():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg_pool = await asyncpg.create_pool(db_url)
    store_id = await pg_pool.fetchval("SELECT id FROM stores LIMIT 1")
    
    table_name = "stockledger"
    print(f"Migrating {table_name} (519,531 rows)...")
    
    src_conn = pyodbc.connect('DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;')
    src_cursor = src_conn.cursor()
    
    try:
        src_cursor.execute(f"SELECT * FROM {table_name}")
        columns = [column[0].lower() for column in src_cursor.description]
        
        async with pg_pool.acquire() as pg_conn:
            target_cols_rows = await pg_conn.fetch(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table_name}'")
            target_cols = {r['column_name'] for r in target_cols_rows}
        
        valid_cols = [c for c in columns if c in target_cols and c != 'id']
        
        batch_size = 5000
        total = 0
        while True:
            rows = src_cursor.fetchmany(batch_size)
            if not rows: break
            
            records = []
            for row in rows:
                record = dict(zip(columns, row))
                clean_record = {k: (validate_date(record[k]) if isinstance(record[k], datetime) else record[k]) for k in valid_cols}
                clean_record['store_id'] = store_id
                records.append(tuple(clean_record.values()))
            
            keys = [f'"{k}"' for k in valid_cols] + ['"store_id"']
            query = f'INSERT INTO public."{table_name}" ({", ".join(keys)}) VALUES ({", ".join([f"${i+1}" for i in range(len(keys))])}) ON CONFLICT DO NOTHING'
            
            async with pg_pool.acquire() as pg_conn:
                await pg_conn.executemany(query, records)
            total += len(records)
            if total % 25000 == 0: print(f"Progress: {total} rows...")
            
        print(f"SUCCESS: {table_name} migrated ({total} rows).")
    finally:
        src_conn.close()
        await pg_pool.close()

if __name__ == '__main__':
    asyncio.run(migrate_stockledger())
