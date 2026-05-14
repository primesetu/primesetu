
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def list_sysparams():
    async with engine.connect() as conn:
        query = text('SELECT "ParamCode", "Descr" FROM shoper9."SysParam" LIMIT 100')
        result = await conn.execute(query)
        for row in result:
            print(f"{row[0]}: {row[1]}")

if __name__ == "__main__":
    asyncio.run(list_sysparams())
