import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    tables = await conn.fetch("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'")
    print("Tables in public schema:")
    for t in sorted([t['tablename'] for t in tables]):
        print(f"- {t}")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
