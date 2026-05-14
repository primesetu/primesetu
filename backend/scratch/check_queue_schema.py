import asyncio
import os
import sys

# Add the backend directory to sys.path to import app
sys.path.append(os.getcwd())

from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check():
    try:
        engine = create_async_engine(settings.local_database_url)
        async with engine.connect() as conn:
            res = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'smriti_sync_queue'"))
            columns = [r[0] for r in res.fetchall()]
            print(f"Columns: {columns}")
        await engine.dispose()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check())
