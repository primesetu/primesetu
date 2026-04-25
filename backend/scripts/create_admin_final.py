import os
import asyncio
from supabase import create_client
from dotenv import load_dotenv
from sqlalchemy import text
from database import engine
import uuid

load_dotenv()

async def bootstrap():
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(url, service_key)
    
    email = "admin@primesetu.com"
    password = "PrimeSetu@2026"
    
    try:
        # Create or fetch Auth user
        try:
            user_response = supabase.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True
            })
            user_id = user_response.user.id
            print(f"Created Auth User ID: {user_id}")
        except Exception as e:
            if "already" in str(e).lower() or "registered" in str(e).lower():
                users = supabase.auth.admin.list_users()
                user_list = users if isinstance(users, list) else getattr(users, 'users', [])
                user = next((u for u in user_list if u.email == email), None)
                if user:
                    user_id = user.id
                    print(f"Found Auth User ID: {user_id}")
                else:
                    raise Exception("User not found")
            else:
                raise e

        # Database Mapping
        async with engine.begin() as conn:
            # Check if store exists
            res = await conn.execute(text("SELECT id FROM stores WHERE code = 'STORE-01'"))
            store_row = res.fetchone()
            
            if store_row:
                store_id = store_row[0]
            else:
                store_id = str(uuid.uuid4())
                await conn.execute(text("""
                    INSERT INTO stores (id, name, code, address, is_active, type)
                    VALUES (:id, 'Main Showroom', 'STORE-01', 'Primary Retail Location', true, 'HQ')
                """), {"id": store_id})
                
            # Insert User
            await conn.execute(text("""
                INSERT INTO users (id, store_id, email, full_name, role, active)
                VALUES (:id, :store_id, :email, 'System Administrator', 'owner', true)
                ON CONFLICT (id) DO UPDATE SET role = 'owner', active = true;
            """), {"id": user_id, "store_id": store_id, "email": email})
            
        print("Successfully created Admin with Full Access!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(bootstrap())
