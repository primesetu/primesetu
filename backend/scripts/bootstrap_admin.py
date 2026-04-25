import os
import asyncio
from supabase import create_client
from dotenv import load_dotenv
from sqlalchemy import text
from database import engine

load_dotenv()

async def bootstrap():
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not service_key:
        print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
        return

    supabase = create_client(url, service_key)
    
    email = "admin@primesetu.com"
    password = "PrimeSetu@2026"
    
    print(f"--- Bootstrapping Admin User: {email} ---")
    
    try:
        # 1. Create Auth User
        print("1. Creating user in auth.users...")
        try:
            user_response = supabase.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True
            })
            user_id = user_response.user.id
            print(f"   Success! User ID: {user_id}")
        except Exception as e:
            error_msg = str(e).lower()
            if "already" in error_msg or "registered" in error_msg:
                print("   User already exists in Auth. Fetching ID...")
                users = supabase.auth.admin.list_users()
                # In newer versions of supabase-py, list_users returns a list directly or has a users attribute
                user_list = users if isinstance(users, list) else getattr(users, 'users', [])
                user = next((u for u in user_list if u.email == email), None)
                if user:
                    user_id = user.id
                    print(f"   Found User ID: {user_id}")
                else:
                    raise Exception(f"User exists but not found in list: {e}")
            else:
                raise e
        
        # 2. Database Mapping (Store + User)
        print("2. Mapping user to store in public schema...")
        async with engine.begin() as conn:
            # Create Store
            await conn.execute(text("""
                INSERT INTO stores (name, code, address)
                VALUES ('Main Showroom', 'STORE-01', 'Primary Retail Location')
                ON CONFLICT (code) DO NOTHING;
            """))
            
            # Link User
            await conn.execute(text("""
                INSERT INTO users (id, store_id, email, full_name, role)
                VALUES (
                    :user_id,
                    (SELECT id FROM stores WHERE code = 'STORE-01'),
                    :email,
                    'System Administrator',
                    'owner'
                )
                ON CONFLICT (id) DO NOTHING;
            """), {"user_id": user_id, "email": email})
            
        print("   Success! Store and User records linked.")
        print("\n--- BOOTSTRAP COMPLETE ---")
        print(f"Login Email: {email}")
        print(f"Login Pass:  {password}")
        print("---------------------------")
        
    except Exception as e:
        print(f"ERROR during bootstrap: {e}")

if __name__ == "__main__":
    asyncio.run(bootstrap())
