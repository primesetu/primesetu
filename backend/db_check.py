import asyncio
import sys
import os
sys.path.append(os.getcwd())

from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def check():
    try:
        async with AsyncSessionLocal() as db:
            res = await db.execute(text('SELECT count(*) FROM s9.itemmaster'))
            count = res.scalar()
            print(f"ROWS_COUNT:{count}")
            
            res_tenant = await db.execute(text('SELECT tenant_id, count(*) FROM s9.itemmaster GROUP BY tenant_id'))
            for row in res_tenant:
                print(f"TENANT:{row[0]} COUNT:{row[1]}")
    except Exception as e:
        print(f"ERROR:{e}")

if __name__ == "__main__":
    asyncio.run(check())
