import pyodbc
import asyncio
import asyncpg
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

async def get_default_store_id():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    store_id = await conn.fetchval("SELECT id FROM stores LIMIT 1")
    await conn.close()
    return store_id

async def migrate_sysparam():
    print("Starting targeted migration: sysparam")
    
    store_id = await get_default_store_id()
    if not store_id:
        print("Error: No store found.")
        return

    # MSSQL Connection
    mssql_conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
    try:
        ms_conn = pyodbc.connect(mssql_conn_str)
        ms_cur = ms_conn.cursor()
    except Exception as e:
        print(f"Error connecting to MSSQL: {e}")
        return

    # PG Connection
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg_pool = await asyncpg.create_pool(db_url)

    try:
        # 1. Fetch from MSSQL
        ms_cur.execute("SELECT * FROM sysparam")
        columns = [column[0].lower() for column in ms_cur.description]
        rows = ms_cur.fetchall()
        print(f"Fetched {len(rows)} rows from MSSQL sysparam.")

        # 2. Map to PG schema
        # PG columns: ['id', 'store_id', 'descr', 'paramcode', 'boolean', 'intg', 'txt', 'dt', 'sng', 'cur', 'opt', 'vauid', 'vactr', 'vatermid', 'vacompcode']
        # MSSQL columns: ['id', 'descr', 'paramcode', 'boolean', 'intg', 'txt', 'dt', 'sng', 'cur', 'opt', 'vauid', 'vactr', 'vatermid', 'vacompcode']
        
        pg_records = []
        for row in rows:
            record = dict(zip(columns, row))
            
            # Create a clean record for PG
            clean_record = {
                'id': str(uuid.uuid4()), # Generate new UUID for PG primary key
                'store_id': store_id,
                'descr': record.get('descr'),
                'paramcode': record.get('paramcode'),
                'boolean': record.get('boolean'),
                'intg': record.get('intg'),
                'txt': record.get('txt'),
                'dt': record.get('dt'),
                'sng': float(record.get('sng')) if record.get('sng') is not None else 0.0,
                'cur': record.get('cur'),
                'opt': record.get('opt'),
                'vauid': record.get('vauid'),
                'vactr': record.get('vactr'),
                'vatermid': record.get('vatermid'),
                'vacompcode': record.get('vacompcode')
            }
            
            # Fix date if invalid
            if clean_record['dt'] and clean_record['dt'].year < 1901:
                clean_record['dt'] = None
                
            pg_records.append(clean_record)

        # 3. Insert into PG
        if pg_records:
            keys = pg_records[0].keys()
            columns_str = ', '.join(f'"{k}"' for k in keys)
            placeholders = ', '.join([f'${i+1}' for i in range(len(keys))])
            
            query = f'INSERT INTO public.sysparam ({columns_str}) VALUES ({placeholders})'
            
            async with pg_pool.acquire() as pg_conn:
                # Clear existing empty rows just in case (though it's 0)
                await pg_conn.execute("DELETE FROM sysparam")
                
                # Execute bulk insert
                await pg_conn.executemany(query, [tuple(r.values()) for r in pg_records])
                
            print(f"SUCCESS: Migrated {len(pg_records)} records to SMRITI-OS sysparam.")

    except Exception as e:
        print(f"ERROR during migration: {e}")
        import traceback
        traceback.print_exc()
    finally:
        ms_conn.close()
        await pg_pool.close()

if __name__ == "__main__":
    asyncio.run(migrate_sysparam())
