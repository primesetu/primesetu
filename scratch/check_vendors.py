import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def check_vendors():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg = await asyncpg.connect(db_url)
    
    exists = await pg.fetchval("SELECT count(*) FROM information_schema.tables WHERE table_name = 'vendors'")
    print(f"Vendors table exists in information_schema: {exists}")
    
    if exists:
        count = await pg.fetchval("SELECT count(*) FROM vendors")
        print(f"Vendors count: {count}")
    else:
        print("Vendors table DOES NOT EXIST in PG.")
        
    await pg.close()

if __name__ == "__main__":
    asyncio.run(check_vendors())
