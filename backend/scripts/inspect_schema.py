import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    cols = await conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'partners'")
    print("partners columns:", [c['column_name'] for c in cols])

    cols2 = await conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'purchase_orders'")
    print("purchase_orders columns:", [c['column_name'] for c in cols2])
    
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
