import asyncio
import os
import sys
from dotenv import load_dotenv

# Load .env from current directory
load_dotenv()

# Add backend to path
sys.path.append(os.getcwd())

from app.core.database import AsyncSessionLocal
from app.models.base import Store, User
from sqlalchemy import select

async def check():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Store).where(Store.code == 'TPS01'))
        store = res.scalar_one_or_none()
        print(f"Store: {store.name if store else 'NOT FOUND'}")
        
        res_user = await db.execute(select(User).where(User.email == 'tester@primesetu.io'))
        user = res_user.scalar_one_or_none()
        print(f"User: {user.email if user else 'NOT FOUND'}")

if __name__ == "__main__":
    asyncio.run(check())
