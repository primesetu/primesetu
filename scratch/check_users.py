import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import select
from app.models import User

async def check():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User))
        users = res.scalars().all()
        for u in users:
            print(f"ID: {u.id}")
            print(f"Email: {u.email}")
            print(f"Role: {u.role}")
            print(f"Store: {u.store_id}")
            print(f"Prefs: {u.preferences}")
            print(f"Prefs Type: {type(u.preferences)}")
            print("-" * 20)

if __name__ == "__main__":
    asyncio.run(check())
