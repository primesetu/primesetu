import asyncio
import asyncpg
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

async def migrate_users():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    # 1. Fetch legacy users
    legacy_users = await conn.fetch("SELECT nm, loginid, loginpwd FROM s9sys_vauser")
    store_id = await conn.fetchval("SELECT id FROM stores LIMIT 1")
    
    print(f"Migrating {len(legacy_users)} users...")
    
    for lu in legacy_users:
        email = f"{lu['loginid']}@smriti.os".lower()
        full_name = lu['nm'] or lu['loginid']
        
        # Check if exists
        exists = await conn.fetchval("SELECT id FROM public.users WHERE email = $1", email)
        if not exists:
            # We use a default password for now as Shoper9 hash is proprietary
            # Default: 'smriti123' (In production, user should reset)
            default_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36RQoeG6L6sW8Wyowq7ooVG" 
            
            await conn.execute("""
                INSERT INTO public.users (id, email, hashed_password, full_name, role, is_active, store_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            """, str(uuid.uuid4()), email, default_hash, full_name, 'ADMIN', True, store_id)
            print(f"Provisioned user: {email}")
        else:
            print(f"User {email} already exists.")
            
    await conn.close()

if __name__ == '__main__':
    asyncio.run(migrate_users())
