import asyncio
from sqlalchemy import text
from database import engine

async def check():
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users';"))
        print("Public users columns:")
        for row in res:
            print(row[0], row[1])
            
        res = await conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles';"))
        print("Public profiles columns:")
        for row in res:
            print(row[0], row[1])

if __name__ == "__main__":
    asyncio.run(check())
