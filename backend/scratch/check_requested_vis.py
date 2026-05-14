
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check_vis():
    async with engine.connect() as conn:
        q = text("""
            SELECT columnname, dispcap, dispvisible 
            FROM shoper9.acceptdisplaydtls 
            WHERE trntype = 2100 
              AND columnname IN ('AC1', 'AC2', 'Sizecd', 'SalesStaff')
        """)
        r = await conn.execute(q)
        for row in r:
            print(f"{row[0]} ({row[1]}) -> Visible: {row[2]}")

if __name__ == "__main__":
    asyncio.run(check_vis())
