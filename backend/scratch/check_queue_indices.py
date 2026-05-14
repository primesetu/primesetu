import asyncio
import os
import sys

sys.path.append(os.getcwd())

from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check():
    try:
        engine = create_async_engine(settings.local_database_url)
        async with engine.connect() as conn:
            res = await conn.execute(text("SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'smriti_sync_queue'"))
            rows = res.fetchall()
            for r in rows:
                print(f"Index: {r[0]}, Def: {r[1]}")
        await engine.dispose()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check())
