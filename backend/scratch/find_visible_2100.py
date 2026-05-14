
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def find_visible():
    async with engine.connect() as conn:
        q = text("""
            SELECT columnname, dispcap, dispwidth 
            FROM shoper9.acceptdisplaydtls 
            WHERE trntype = 2100 AND dispvisible = true 
            ORDER BY disppos
        """)
        r = await conn.execute(q)
        for row in r:
            print(f"{row[0]} ({row[1]}) Width: {row[2]}")

if __name__ == "__main__":
    asyncio.run(find_visible())
