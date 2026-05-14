
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def search_loyalty_tables():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        res = await session.execute(text("SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%loyalty%' AND table_schema = 'shoper9'"))
        print("Loyalty related tables:", [r[0] for r in res.all()])

if __name__ == "__main__":
    asyncio.run(search_loyalty_tables())
