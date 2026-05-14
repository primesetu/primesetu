import asyncio
import sys
import os
sys.path.append(os.getcwd())

from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def check():
    try:
        async with AsyncSessionLocal() as db:
            res = await db.execute(text('SELECT MIN(dateinsert), MAX(dateinsert) FROM s9.itemmaster'))
            min_d, max_d = res.one()
            print(f"MIN_DATE:{min_d} MAX_DATE:{max_d}")
    except Exception as e:
        print(f"ERROR:{e}")

if __name__ == "__main__":
    asyncio.run(check())
