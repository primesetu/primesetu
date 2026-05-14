
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def find_mask():
    async with engine.connect() as conn:
        q = text("""
            SELECT trntype, columnname, dispcap, dispvisible, disppos 
            FROM shoper9.acceptdisplaydtls 
            WHERE trntype IN (1, 100, 101) -- Common sales types
            ORDER BY trntype, disppos
        """)
        r = await conn.execute(q)
        for row in r:
            print(f"Type {row[0]}: {row[1]} ({row[2]}) -> Visible: {row[3]}, Pos: {row[4]}")

if __name__ == "__main__":
    asyncio.run(find_mask())
