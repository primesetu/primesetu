import asyncio
import os
import sys

sys.path.append(os.getcwd())

from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def execute_fixes():
    try:
        engine = create_async_engine(settings.local_database_url)
        async with engine.begin() as conn:
            print("1. Dropping old index if exists...")
            await conn.execute(text("DROP INDEX IF EXISTS idx_sync_queue_status"))
            
            print("2. Creating new updated index (status, next_retry, id)...")
            await conn.execute(text("CREATE INDEX idx_sync_queue_status ON smriti_sync_queue (status, next_retry, id)"))
            
            print("3. Ensuring columns have correct defaults...")
            await conn.execute(text("ALTER TABLE smriti_sync_queue ALTER COLUMN pk_column SET DEFAULT 'id'"))
            await conn.execute(text("ALTER TABLE smriti_sync_queue ALTER COLUMN next_retry SET DEFAULT NOW()"))
            
            print("Done! All fixes applied successfully.")
            
        await engine.dispose()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(execute_fixes())
