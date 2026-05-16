
import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def check_sysparams():
    async with AsyncSessionLocal() as db:
        sql = text("SELECT param_code, value_txt FROM sysparam WHERE param_code LIKE '%Caption%'")
        res = await db.execute(sql)
        for row in res.all():
            print(f"{row[0]}: {row[1]}")

if __name__ == "__main__":
    asyncio.run(check_sysparams())
