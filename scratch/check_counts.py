import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def check_counts():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg = await asyncpg.connect(db_url)
    
    tables = ['itemmaster', 'stockmaster', 'items', 'item_stock', 'sysparam', 's9_vendors', 'vendors']
    for table in tables:
        try:
            count = await pg.fetchval(f'SELECT count(*) FROM "{table}"')
            print(f"{table}: {count}")
        except Exception:
            print(f"{table}: MISSING")
        
    await pg.close()

if __name__ == "__main__":
    asyncio.run(check_counts())
