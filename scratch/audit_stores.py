import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def check_stores():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg = await asyncpg.connect(db_url)
    
    print("--- Store ID Audit ---")
    stores = await pg.fetch("SELECT id, name FROM stores")
    print(f"Native Stores: {[(s['id'], s['name']) for s in stores]}")
    
    tables = ['ptinvoicehdr', 'ptinvoicedtl', 'itemmaster', 'stockmaster', 's9_vendors', 'sysparam']
    for table in tables:
        try:
            ids = await pg.fetch(f'SELECT distinct store_id FROM "{table}"')
            print(f"{table} Store IDs: {[r['store_id'] for r in ids]}")
        except Exception as e:
            print(f"{table}: ERROR ({e})")
        
    await pg.close()

if __name__ == "__main__":
    asyncio.run(check_stores())
