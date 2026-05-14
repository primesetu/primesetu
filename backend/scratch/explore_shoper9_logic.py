
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def explore_shoper9_logic():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    tables_to_check = ['dayendpgms', 'salesfactors', 'poscashtrn', 'sysparamextd', 'genlookupextd', 'itemtrnsummary']
    
    async with async_session() as session:
        print("--- Table Existence Check ---")
        for table in tables_to_check:
            res = await session.execute(text(f"SELECT table_name FROM information_schema.tables WHERE table_name = '{table}' AND table_schema = 'shoper9'"))
            print(f"{table}:", res.first() is not None)
            
        print("\n--- recid 101 (Control Numbers) in genlookup ---")
        res = await session.execute(text("SELECT code, descr, number FROM shoper9.genlookup WHERE recid = 101"))
        print(res.all())

if __name__ == "__main__":
    asyncio.run(explore_shoper9_logic())
