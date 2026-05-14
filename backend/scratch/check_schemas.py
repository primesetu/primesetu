import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

async def check():
    engine = create_async_engine(settings.local_database_url)
    async with engine.connect() as c:
        res = await c.execute(text("SELECT schema_name FROM information_schema.schemata"))
        schemas = [r[0] for r in res.fetchall()]
        print(f"Available schemas: {schemas}")
        
        res = await c.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='s9'"))
        s9_tables = [r[0] for r in res.fetchall()]
        print(f"s9 tables: {len(s9_tables)}")

        res = await c.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='shoper9'"))
        shoper9_tables = [r[0] for r in res.fetchall()]
        print(f"shoper9 tables: {len(shoper9_tables)}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check())
