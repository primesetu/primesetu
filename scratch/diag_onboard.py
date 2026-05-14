import asyncio
import os
import sys
from dotenv import load_dotenv
import httpx

# Load .env
load_dotenv(dotenv_path='backend/.env')

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models import Store, User

async def test_onboard():
    payload = {
        "store_name": "Test Prime Store 2",
        "store_code": "TPS02",
        "address": "123 Sovereign Street, Mumbai",
        "gstin": "27AAAAA0000A1Z5",
        "phone": "9876543210",
        "state_code": "27",
        "admin_email": "tester2@primesetu.io",
        "admin_password": "TestPassword123",
        "admin_full_name": "Test Admin 2"
    }
    
    print(f"Connecting to: {settings.database_url}")
    print(f"Supabase URL: {settings.supabase_url}")
    
    async with AsyncSessionLocal() as db:
        # 1. Create store
        new_store = Store(
            name=payload["store_name"],
            code=payload["store_code"],
            address=payload["address"],
            state_code=payload["state_code"]
        )
        db.add(new_store)
        await db.flush()
        store_id = new_store.id
        print(f"Store created with ID: {store_id}")
        
        # 2. Create user in Supabase
        async with httpx.AsyncClient() as client:
            url = f"{settings.supabase_url}/auth/v1/admin/users"
            headers = {
                "apikey": settings.supabase_service_role_key,
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "Content-Type": "application/json"
            }
            body = {
                "email": payload["admin_email"],
                "password": payload["admin_password"],
                "email_confirm": True,
                "user_metadata": {
                    "store_id": str(store_id),
                    "role": "admin",
                    "full_name": payload["admin_full_name"]
                }
            }
            print(f"Calling Supabase: {url}")
            response = await client.post(url, headers=headers, json=body)
            
            if response.status_code != 200:
                print(f"Supabase Error: {response.status_code} - {response.text}")
                await db.rollback()
                return
            
            user_data = response.json()
            auth_user_id = user_data["id"]
            print(f"User created in Supabase with ID: {auth_user_id}")
            
        # 3. Create user in DB
        new_user = User(
            id=auth_user_id,
            store_id=store_id,
            email=payload["admin_email"],
            full_name=payload["admin_full_name"],
            role="admin"
        )
        db.add(new_user)
        await db.commit()
        print("Success!")

if __name__ == "__main__":
    asyncio.run(test_onboard())
