
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check_2100():
    async with engine.connect() as conn:
        q = text("""
            SELECT columnname, dispcap, dispvisible, disppos, dispwidth 
            FROM shoper9.acceptdisplaydtls 
            WHERE trntype = 2100 
            ORDER BY disppos
        """)
        r = await conn.execute(q)
        for row in r:
            print(f"{row[0]} ({row[1]}) -> Visible: {row[2]}, Pos: {row[3]}, Width: {row[4]}")

if __name__ == "__main__":
    asyncio.run(check_2100())
