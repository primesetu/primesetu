import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def cleanup_sys():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    rows = await conn.fetch("SELECT tablename FROM pg_catalog.pg_tables WHERE tablename LIKE 's9sys_%'")
    for row in rows:
        print(f"Dropping {row['tablename']}...")
        await conn.execute(f"DROP TABLE IF EXISTS public.{row['tablename']} CASCADE")
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(cleanup_sys())
