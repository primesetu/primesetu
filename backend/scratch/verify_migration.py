
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def verify():
    async with engine.connect() as conn:
        r = await conn.execute(text("SELECT COUNT(*) FROM shoper9.vamenu"))
        print(f"VAMENU Count: {r.scalar()}")
        r2 = await conn.execute(text("SELECT COUNT(*) FROM shoper9.vamenushortcut"))
        print(f"Shortcuts Count: {r2.scalar()}")

if __name__ == "__main__":
    asyncio.run(verify())
