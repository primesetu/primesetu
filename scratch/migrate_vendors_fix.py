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

async def migrate_vendors():
    print("Starting targeted migration: vendors -> s9_vendors")
    
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
        ms_cur.execute("SELECT * FROM vendors")
        columns = [column[0].lower() for column in ms_cur.description]
        rows = ms_cur.fetchall()
        print(f"Fetched {len(rows)} rows from MSSQL vendors.")

        # 2. Map to PG schema (s9_vendors)
        # Column mappings (MSSQL -> PG)
        # Nm -> nm
        # SrcTaxType -> srctaxtype
        # ...
        
        pg_records = []
        for row in rows:
            record = dict(zip(columns, row))
            
            clean_record = {
                'id': uuid.uuid4(),
                'store_id': store_id,
                'code': record.get('code'),
                'nm': record.get('nm'),
                'srctaxtype': record.get('srctaxtype'),
                'maillistsrlno': record.get('maillistsrlno'),
                'allowpartposupply': bool(record.get('allowpartposupply')),
                'vendortype': record.get('vendortype'),
                'vendorlst': record.get('vendorlst'),
                'vendorcst': record.get('vendorcst'),
                'commissionpercent': record.get('commissionpercent'),
                'ptfileapplicable': record.get('ptfileapplicable'),
                'ptfilesuffix': record.get('ptfilesuffix'),
                'shopercomp': record.get('shopercomp'),
                'shoperver': record.get('shoperver'),
                'shoperdelimiter': record.get('shoperdelimiter'),
                'shoperenv': record.get('shoperenv'),
                'buyingfactor': record.get('buyingfactor'),
                'sellingfactor': record.get('sellingfactor'),
                'poapplicable': record.get('poapplicable'),
                'wslink': record.get('wslink'),
                'wsusername': record.get('wsusername'),
                'wspassword': record.get('wspassword'),
                'wsssl': record.get('wsssl'),
                'vauid': record.get('vauid'),
                'vactr': record.get('vactr'),
                'vatermid': record.get('vatermid'),
                'vacompcode': record.get('vacompcode')
            }
            pg_records.append(clean_record)

        # 3. Insert into PG
        if pg_records:
            keys = pg_records[0].keys()
            columns_str = ', '.join(f'"{k}"' for k in keys)
            placeholders = ', '.join([f'${i+1}' for i in range(len(keys))])
            
            query = f'INSERT INTO public.s9_vendors ({columns_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'
            
            async with pg_pool.acquire() as pg_conn:
                await pg_conn.execute("DELETE FROM s9_vendors")
                await pg_conn.executemany(query, [tuple(r.values()) for r in pg_records])
                
            print(f"SUCCESS: Migrated {len(pg_records)} records to s9_vendors.")

    except Exception as e:
        print(f"ERROR during migration: {e}")
    finally:
        ms_conn.close()
        await pg_pool.close()

if __name__ == "__main__":
    asyncio.run(migrate_vendors())
