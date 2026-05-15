import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    cols = await conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'ptinvoicehdr'")
    print("Columns in ptinvoicehdr:")
    for c in cols:
        print(f"- {c['column_name']}")
    
    rows = await conn.fetch("SELECT * FROM ptinvoicehdr LIMIT 5")
    print(f"\nSample data:")
    for r in rows:
        print(r)
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
