
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def list_top_30():
    async with engine.connect() as conn:
        q = text("""
            SELECT columnname, dispcap 
            FROM shoper9.acceptdisplaydtls 
            WHERE trntype = 2100 
            ORDER BY disppos
            LIMIT 40
        """)
        r = await conn.execute(q)
        for row in r:
            print(f"{row[0]} ({row[1]})")

if __name__ == "__main__":
    asyncio.run(list_top_30())
