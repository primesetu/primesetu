import asyncio
import asyncpg
import os
import uuid
import json
from dotenv import load_dotenv

load_dotenv()

async def create_initial_store():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    store_id = str(uuid.uuid4())
    store_code = "X01"
    store_name = "SMRITI Main Showroom"
    
    print(f"Creating Initial Store: {store_name} ({store_code})")
    
    await conn.execute("""
        INSERT INTO public.stores (id, name, code, type, is_active, hierarchy_role, buying_factor, selling_factor, metadata)
        VALUES ($1, $2, $3, 'Retail', true, 'standalone', 1.0, 1.0, $4)
    """, store_id, store_name, store_code, json.dumps({}))
    
    # Also create a default user
    user_id = uuid.uuid4()
    print(f"Creating Admin User for Store: {store_id}")
    await conn.execute("""
        INSERT INTO public.users (id, store_id, email, full_name, role, active)
        VALUES ($1, $2, 'admin@smriti.os', 'System Admin', 'OWNER', true)
    """, user_id, store_id)
    
    print("Initial setup complete.")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(create_initial_store())
