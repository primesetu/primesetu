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
            res = await conn.execute(text("""
                SELECT column_name, data_type, column_default, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'smriti_sync_queue'
                ORDER BY ordinal_position
            """))
            rows = res.fetchall()
            for r in rows:
                print(f"{r[0]}: {r[1]}, default: {r[2]}, nullable: {r[3]}")
        await engine.dispose()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check())
