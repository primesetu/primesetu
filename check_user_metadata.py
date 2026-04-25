import os
import asyncio
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

def check_admin():
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(url, service_key)
    
    email = "admin@primesetu.com"
    
    users = supabase.auth.admin.list_users()
    user_list = users if isinstance(users, list) else getattr(users, 'users', [])
    user = next((u for u in user_list if u.email == email), None)
    
    if user:
        print(f"User ID: {user.id}")
        print(f"User Metadata: {user.user_metadata}")
        print(f"App Metadata: {user.app_metadata}")
    else:
        print("User not found in auth.users")

if __name__ == "__main__":
    check_admin()
