import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def check():
    async with AsyncSessionLocal() as db:
        res = await db.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"))
        columns = [r[0] for r in res.all()]
        print("Columns in 'users' table:")
        for c in columns:
            print(f"- {c}")

if __name__ == "__main__":
    asyncio.run(check())
