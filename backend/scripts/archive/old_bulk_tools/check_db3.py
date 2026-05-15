import asyncio
from sqlalchemy import text
from database import engine

async def check():
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"))
        print("Public tables:")
        for row in res:
            print(row[0])

if __name__ == "__main__":
    asyncio.run(check())
