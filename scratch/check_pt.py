import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def check_pt():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg = await asyncpg.connect(db_url)
    
    correct_id = 'ae8f347e-baa6-4455-b6e7-22b3220ee464'
    
    total = await pg.fetchval("SELECT count(*) FROM ptinvoicehdr")
    mismatched = await pg.fetchval(f"SELECT count(*) FROM ptinvoicehdr WHERE store_id != '{correct_id}'")
    matched = await pg.fetchval(f"SELECT count(*) FROM ptinvoicehdr WHERE store_id = '{correct_id}'")
    
    print(f"ptinvoicehdr: Total={total}, Matched={matched}, Mismatched={mismatched}")
    
    # Check a sample store_id from ptinvoicehdr
    if total > 0:
        sample = await pg.fetchval("SELECT store_id FROM ptinvoicehdr LIMIT 1")
        print(f"Sample Store ID: '{sample}'")
        
    await pg.close()

if __name__ == "__main__":
    asyncio.run(check_pt())
