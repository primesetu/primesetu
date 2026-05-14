import asyncio
import os
import sys
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def check():
    session = AsyncSessionLocal()
    res = await session.execute(text('SELECT * FROM s9sys_sissysparam LIMIT 2'))
    rows = res.fetchall()
    print("Columns:", res.keys())
    for row in rows:
        print(row)
    await session.close()

if __name__ == "__main__":
    asyncio.run(check())
