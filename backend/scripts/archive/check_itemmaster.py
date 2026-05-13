import asyncio
from sqlalchemy import text
from app.database import engine

async def check_itemmaster():
    async with engine.connect() as conn:
        print("Checking itemmaster tables in all schemas...")
        
        # Find all tables with 'itemmaster' in their name
        res = await conn.execute(text("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name ILIKE '%itemmaster%' OR table_name ILIKE '%items%'"))
        tables = res.fetchall()
        
        for schema, table in tables:
            try:
                count_res = await conn.execute(text(f'SELECT COUNT(*) FROM "{schema}"."{table}"'))
                count = count_res.scalar()
                print(f"[{schema}.{table}] has {count} rows.")
            except Exception as e:
                print(f"Could not count '{schema}.{table}': {e}")

asyncio.run(check_itemmaster())
