import asyncio
import sys
import os
import uuid

# Add parent directory to path to allow importing app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import AsyncSessionLocal
from app.models import User, Store
from sqlalchemy import select

async def bridge():
    # YOUR USER ID FROM LOGS
    user_id_str = 'e7a010e3-0b3d-4b3b-99f5-7e92d54475c8'
    user_id = uuid.UUID(user_id_str)
    
    print(f"--- Bridging User: {user_id_str} ---")
    
    async with AsyncSessionLocal() as db:
        # 1. Get the main showroom store
        res = await db.execute(select(Store).limit(1))
        store = res.scalar_one_or_none()
        
        if not store:
            print("❌ No store found in database. Run bootstrap first.")
            return

        # 2. Check if user already exists
        res = await db.execute(select(User).where(User.id == user_id))
        user = res.scalar_one_or_none()
        
        if user:
            print(f"✅ User already linked to store: {user.store_id}")
            return

        # 3. Create the user link
        new_user = User(
            id=user_id,
            store_id=store.id,
            email="developer@smriti.os", 
            full_name="System Developer",
            role="admin",
            active=True
        )
        db.add(new_user)
        await db.commit()
        print(f"🚀 Success! Linked {user_id} to Store: {store.name} ({store.id})")

if __name__ == "__main__":
    asyncio.run(bridge())
