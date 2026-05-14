import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    print("--- Personnel with Store IDs ---")
    rows = await conn.fetch("SELECT code, nm, vacompcode, activeflag, allowinbilling FROM shoper9.personnel WHERE activeflag = 1")
    for r in rows:
        print(f"Code: {r['code']}, Name: {r['nm']}, Store: {r['vacompcode']}")
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
