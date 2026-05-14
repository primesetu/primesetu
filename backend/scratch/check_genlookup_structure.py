
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def check_genlookup_structure():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Search for code 22200
        print("Searching for code 22200 (Reasons for Transfer Out)...")
        res = await session.execute(text("SELECT * FROM shoper9.genlookup WHERE code LIKE '222%'"))
        rows = res.all()
        for r in rows:
            print(r)
        
        # Search for something that looks like a value, e.g. "CASH" or "CARD"
        print("\nSearching for potential payment related descriptions...")
        res = await session.execute(text("SELECT * FROM shoper9.genlookup WHERE lower(descr) LIKE '%cash%' OR lower(descr) LIKE '%card%' LIMIT 10"))
        rows = res.all()
        for r in rows:
            print(r)

if __name__ == "__main__":
    asyncio.run(check_genlookup_structure())
