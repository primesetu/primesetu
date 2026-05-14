import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    print("--- AcceptDisplayDtls Columns ---")
    cols = await conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'acceptdisplaydtls' AND table_schema = 'shoper9'")
    for c in cols:
        print(c['column_name'])
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
