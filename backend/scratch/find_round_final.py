
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def find_round():
    async with engine.connect() as conn:
        q = text("""
            SELECT paramcode, descr, txt, intg, boolean 
            FROM shoper9.sysparam 
            WHERE descr ILIKE '%Round%'
        """)
        r = await conn.execute(q)
        for row in r:
            val = row[2] if row[2] else (row[3] if row[3] is not None else row[4])
            print(f"{row[0]}: {row[1]} -> {val}")

if __name__ == "__main__":
    asyncio.run(find_round())
