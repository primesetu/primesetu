import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    print("--- Searching for specific tables in PG shoper9 schema ---")
    tables = ['customers', 'saletrnhdr', 'poscashtrn', 'posmodedatadtls']
    
    for t in tables:
        res = await conn.fetchval(f"SELECT count(*) FROM pg_catalog.pg_tables WHERE tablename = '{t}' AND schemaname = 'shoper9'")
        print(f"Table {t}: {'EXISTS' if res > 0 else 'MISSING'}")
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
