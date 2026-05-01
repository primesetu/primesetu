import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def check():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    rows = await conn.fetch("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
    for r in rows:
        print(r['tablename'])
    await conn.close()

if __name__ == '__main__':
    asyncio.run(check())
