import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def check_schema():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT trntype, columnname, dispcap, dispvisible, disppos FROM shoper9.acceptdisplaydtls WHERE trntype = 1200 ORDER BY disppos"))
        rows = result.all()
        for row in rows:
            print(row)

if __name__ == "__main__":
    asyncio.run(check_schema())
