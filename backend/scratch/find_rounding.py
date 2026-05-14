
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def find_rounding():
    async with engine.connect() as conn:
        q = text("""
            SELECT paramcode, descr, txt, intg, boolean 
            FROM shoper9.sysparam 
            WHERE descr ILIKE '%round%' 
               OR paramcode ILIKE '%RND%'
            LIMIT 50
        """)
        r = await conn.execute(q)
        for row in r:
            val = row[2] if row[2] else (row[3] if row[3] is not None else row[4])
            print(f"{row[0]}: {row[1]} -> {val}")

if __name__ == "__main__":
    asyncio.run(find_rounding())
