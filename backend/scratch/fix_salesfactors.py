
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def fix_salesfactors():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        res = await session.execute(text("UPDATE shoper9.salesfactors SET custcd = 'DummyCust' WHERE custcd IS NULL AND type IN (6,7)"))
        print(f"Updated {res.rowcount} rows in salesfactors.")
        await session.commit()

if __name__ == "__main__":
    asyncio.run(fix_salesfactors())
