import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    users = await conn.fetch("SELECT email, full_name, role FROM public.users")
    print("Current SMRITI-OS Users:")
    for u in users:
        print(f"- {u['email']} ({u['full_name']}) - Role: {u['role']}")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
