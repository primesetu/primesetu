import asyncio
from sqlalchemy import text
from app.database import engine

async def list_tables():
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='shoper9'"))
        tables = [r[0] for r in res.fetchall()]
        print(f"Cloud shoper9 tables: {tables}")

if __name__ == "__main__":
    asyncio.run(list_tables())
