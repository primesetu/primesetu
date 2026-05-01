import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    cols = await conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'stockmaster'")
    print("Columns in stockmaster:")
    for c in cols:
        print(f"- {c['column_name']}")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
