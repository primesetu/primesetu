
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check():
    async with engine.connect() as conn:
        try:
            res = await conn.execute(text("SELECT COUNT(*) FROM s9.class12combo"))
            print(f"class12combo count: {res.scalar()}")
        except Exception as e:
            print(f"Error checking class12combo: {e}")
            
        try:
            res = await conn.execute(text("SELECT COUNT(*) FROM s9.genlookup"))
            print(f"genlookup count: {res.scalar()}")
        except Exception as e:
            print(f"Error checking genlookup: {e}")

if __name__ == "__main__":
    asyncio.run(check())
