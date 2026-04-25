import os
import asyncio
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

def update_admin():
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(url, service_key)
    
    email = "admin@primesetu.com"
    
    users = supabase.auth.admin.list_users()
    user_list = users if isinstance(users, list) else getattr(users, 'users', [])
    user = next((u for u in user_list if u.email == email), None)
    
    if user:
        # Update user metadata
        response = supabase.auth.admin.update_user_by_id(
            user.id,
            {"user_metadata": {"role": "OWNER"}}
        )
        print("Updated auth.users user_metadata to role: OWNER")
    else:
        print("User not found in auth.users")

if __name__ == "__main__":
    update_admin()
