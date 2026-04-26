import asyncio
from app.core.database import engine
from sqlalchemy import text

async def main():
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND column_name LIKE '%id'"))
        for row in res.fetchall():
            print(f"{row[0]}.{row[1]}: {row[2]}")

asyncio.run(main())
