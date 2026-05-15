import pyodbc
import asyncio
import asyncpg
import os
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def validate_date(dt):
    if not dt: return None
    if isinstance(dt, datetime):
        # PG safe dates: > 1970 usually, but PG supports much earlier.
        # However, 1900-01-01 often causes issues in some drivers.
        if dt.year < 1901: return None
    return dt

async def get_default_store_id():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    store_id = await conn.fetchval("SELECT id FROM stores LIMIT 1")
    await conn.close()
    return store_id

async def migrate_table(table_name, count, store_id, pg_pool):
    print(f"Migrating {table_name} ({count} rows)...")
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
    src_conn = pyodbc.connect(conn_str)
    src_cursor = src_conn.cursor()
    
    try:
        src_cursor.execute(f"SELECT * FROM [{table_name}]")
        columns = [column[0].lower() for column in src_cursor.description]
        
        async with pg_pool.acquire() as pg_conn:
            target_cols_rows = await pg_conn.fetch(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table_name.lower()}'")
            target_cols = {r['column_name'] for r in target_cols_rows}
        
        valid_cols = [c for c in columns if c in target_cols]
        
        batch_size = 1000
        total_migrated = 0
        while True:
            rows = src_cursor.fetchmany(batch_size)
            if not rows: break
            
            records = []
            for row in rows:
                record = dict(zip(columns, row))
                clean_record = {}
                for k in valid_cols:
                    val = record[k]
                    if isinstance(val, datetime):
                        val = validate_date(val)
                    clean_record[k] = val
                
                clean_record['store_id'] = store_id
                records.append(clean_record)
            
            if records:
                keys = records[0].keys()
                columns_str = ', '.join(f'"{k}"' for k in keys)
                placeholders = ', '.join([f'${i+1}' for i in range(len(keys))])
                query = f'INSERT INTO public."{table_name.lower()}" ({columns_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'
                
                async with pg_pool.acquire() as pg_conn:
                    await pg_conn.executemany(query, [tuple(r.values()) for r in records])
                total_migrated += len(records)
        
        print(f"SUCCESS: {table_name} migrated ({total_migrated} rows).")
    except Exception as e:
        print(f"ERROR: {table_name} failed: {str(e)}")
    finally:
        src_conn.close()

async def main():
    store_id = await get_default_store_id()
    print(f"Using Store ID: {store_id}")
    
    # Tables to retry or migrate now
    tables = [
        ("ItemMaster", 22105),
        ("ExportSysparam", 69894),
        ("StkTrnDtls", 86574),
        ("PtInvoiceDtl", 106362),
        ("LogAgentActivity", 131323),
        ("ExportGenLookUp", 155119)
    ]
    
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg_pool = await asyncpg.create_pool(db_url)
    
    for table_name, count in tables:
        await migrate_table(table_name, count, store_id, pg_pool)
    
    await pg_pool.close()

if __name__ == '__main__':
    asyncio.run(main())
