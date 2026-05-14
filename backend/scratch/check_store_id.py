import asyncio
from app.core.database import engine
from sqlalchemy import text

async def main():
    async with engine.connect() as c:
        res = await c.execute(text("SELECT distinct store_id FROM shoper9.acceptdisplaydtls"))
        for row in res:
            print(row)

if __name__ == '__main__':
    asyncio.run(main())
