
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def find_types():
    async with engine.connect() as conn:
        q = text("""
            SELECT trntype, columnname, dispcap 
            FROM shoper9.acceptdisplaydtls 
            WHERE columnname ILIKE '%Stock%' 
               OR columnname ILIKE '%Qty%'
            LIMIT 50
        """)
        r = await conn.execute(q)
        for row in r:
            print(f"Type {row[0]}: {row[1]} ({row[2]})")

if __name__ == "__main__":
    asyncio.run(find_types())
