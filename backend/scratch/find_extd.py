
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def find_extd():
    async with engine.connect() as conn:
        q = text("""
            SELECT paramcode, optcode, val 
            FROM shoper9.sysparamextd 
            LIMIT 100
        """)
        r = await conn.execute(q)
        for row in r:
            print(f"{row[0]} ({row[1]}): {row[2]}")

if __name__ == "__main__":
    asyncio.run(find_extd())
