import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    cols = await conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 's9sys_vauser'")
    print("Columns in s9sys_vauser:")
    for c in cols:
        print(f"- {c['column_name']}")
    
    users = await conn.fetch("SELECT * FROM s9sys_vauser")
    print(f"\nTotal users found: {len(users)}")
    for u in users:
        print(f"- {u['nm']} (ID: {u['id']})")
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
