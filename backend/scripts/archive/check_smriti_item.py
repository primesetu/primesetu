import asyncio
from sqlalchemy import text
from app.database import engine

async def check():
    async with engine.connect() as conn:
        try:
            res = await conn.execute(text("SELECT COUNT(*) FROM public.smriti_item"))
            print(f"smriti_item count: {res.scalar()}")
        except Exception as e:
            print(f"smriti_item check failed: {e}")

asyncio.run(check())
