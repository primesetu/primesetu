import asyncio
from sqlalchemy import text
from app.database import engine

async def check_data():
    async with engine.connect() as conn:
        print("Checking tables in public schema...")
        res = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
        tables = [row[0] for row in res.fetchall()]
        print("Tables found:", tables)
        
        for table in tables:
            try:
                count_res = await conn.execute(text(f'SELECT COUNT(*) FROM "{table}"'))
                count = count_res.scalar()
                if count > 0:
                    print(f"Table '{table}' has {count} rows.")
            except Exception as e:
                print(f"Could not count '{table}': {e}")

asyncio.run(check_data())
