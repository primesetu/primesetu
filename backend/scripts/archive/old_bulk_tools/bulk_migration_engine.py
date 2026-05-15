import pyodbc
import asyncio
import asyncpg
import os
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

async def get_default_store_id():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    store_id = await conn.fetchval("SELECT id FROM stores LIMIT 1")
    await conn.close()
    return store_id

def get_mssql_tables_with_data():
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'")
    tables = [row.TABLE_NAME for row in cursor.fetchall()]
    
    active_tables = []
    for t in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM [{t}]")
            count = cursor.fetchone()[0]
            if count > 0:
                active_tables.append((t, count))
        except:
            continue
            
    conn.close()
    # Sort by count ascending to migrate small tables first
    return sorted(active_tables, key=lambda x: x[1])

async def migrate_table(table_name, count, store_id, pg_pool):
    print(f"Migrating {table_name} ({count} rows)...")
    
    # Source connection
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
    src_conn = pyodbc.connect(conn_str)
    src_cursor = src_conn.cursor()
    
    try:
        src_cursor.execute(f"SELECT * FROM [{table_name}]")
        columns = [column[0].lower() for column in src_cursor.description]
        
        # Target columns check
        async with pg_pool.acquire() as pg_conn:
            target_cols_rows = await pg_conn.fetch(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table_name.lower()}'")
            target_cols = {r['column_name'] for r in target_cols_rows}
        
        # Identify common columns
        valid_cols = [c for c in columns if c in target_cols]
        
        batch_size = 1000
        while True:
            rows = src_cursor.fetchmany(batch_size)
            if not rows:
                break
            
            records = []
            for row in rows:
                record = dict(zip(columns, row))
                # Build target record
                clean_record = {k: record[k] for k in valid_cols}
                clean_record['store_id'] = store_id
                
                # Handle types
                for k, v in clean_record.items():
                    if isinstance(v, datetime):
                        # Ensure timezone awareness if needed
                        pass
                records.append(clean_record)
            
            # Bulk Insert into PG
            if records:
                keys = records[0].keys()
                columns_str = ', '.join(keys)
                placeholders = ', '.join([f'${i+1}' for i in range(len(keys))])
                
                query = f'INSERT INTO public."{table_name.lower()}" ({columns_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'
                
                async with pg_pool.acquire() as pg_conn:
                    await pg_conn.executemany(query, [tuple(r.values()) for r in records])
        
        print(f"SUCCESS: {table_name} migrated.")
    except Exception as e:
        print(f"ERROR: {table_name} failed: {str(e)}")
    finally:
        src_conn.close()

async def main():
    store_id = await get_default_store_id()
    if not store_id:
        print("No store found in SMRITI-OS. Please create a store first.")
        return
        
    print(f"Using Store ID: {store_id}")
    active_tables = get_mssql_tables_with_data()
    
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg_pool = await asyncpg.create_pool(db_url)
    
    for table_name, count in active_tables:
        # Skip extremely large tables for the first pass or handle them specially
        if count > 50000:
            print(f"Skipping large table {table_name} ({count} rows) for next phase.")
            continue
        await migrate_table(table_name, count, store_id, pg_pool)
    
    await pg_pool.close()

if __name__ == '__main__':
    asyncio.run(main())
