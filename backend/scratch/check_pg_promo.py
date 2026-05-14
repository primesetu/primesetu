import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    print("--- Checking Staff/Promo tables in PG ---")
    tables = ['personnel', 'promomnheader', 'promomnitemlvldiscdtls', 'promomnbilllvldiscdtls']
    
    for t in tables:
        res = await conn.fetchval(f"SELECT count(*) FROM pg_catalog.pg_tables WHERE tablename = '{t}' AND schemaname = 'shoper9'")
        print(f"Table {t}: {'EXISTS' if res > 0 else 'MISSING'}")
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
