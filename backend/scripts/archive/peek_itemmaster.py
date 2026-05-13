import asyncio
from sqlalchemy import text
from app.database import engine

async def peek():
    async with engine.connect() as conn:
        try:
            res = await conn.execute(text("SELECT * FROM shoper9.itemmaster LIMIT 1"))
            row = res.fetchone()
            if row:
                print(f"Columns: {res.keys()}")
                print(f"Row data: {row._asdict()}")
            else:
                print("No data found in shoper9.itemmaster")
        except Exception as e:
            print(f"Peek failed: {e}")

asyncio.run(peek())
