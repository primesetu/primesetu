import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def check_schema():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg = await asyncpg.connect(db_url)
    
    res = await pg.fetch("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name IN ('ptinvoicehdr', 'ptinvoicedtl', 'items', 'item_stock')")
    for r in res:
        print(f"Table: {r['table_name']}, Schema: {r['table_schema']}")
        
    await pg.close()

if __name__ == "__main__":
    asyncio.run(check_schema())
