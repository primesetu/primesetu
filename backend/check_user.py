import asyncio
from app.core.database import AsyncSessionLocal
from app.models import User
from sqlalchemy import select
import uuid

async def check():
    async with AsyncSessionLocal() as db:
        from app.models import Store
        # Check specific user
        uid_str = 'e7a010e3-0b3d-4b3b-99f5-7e92d54475c8'
        uid = uuid.UUID(uid_str)
        res = await db.execute(select(User).where(User.id == uid))
        user = res.scalar_one_or_none()
        if user:
            print(f"FOUND USER: {user.id} | {user.email} | {user.store_id} | {user.role}")
        else:
            print(f"NOT FOUND USER: {uid_str}")
            
        # List stores
        res = await db.execute(select(Store))
        stores = res.scalars().all()
        print("\nAvailable stores:")
        for s in stores:
            print(f"{s.id} | {s.name}")

        # List all users
        res = await db.execute(select(User))
        all_users = res.scalars().all()
        print("\nAll users in DB:")
        for u in all_users:
            print(f"{u.id} | {u.email} | {u.store_id}")

if __name__ == "__main__":
    asyncio.run(check())
