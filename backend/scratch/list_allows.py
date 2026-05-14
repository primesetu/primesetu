
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def list_all_allows():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        res = await session.execute(text("SELECT paramcode, descr, boolean FROM shoper9.sysparam WHERE lower(paramcode) LIKE 'allow%'"))
        params = res.all()
        for p in params:
            print(f"[{p.paramcode}] = {p.boolean} | {p.descr}")

if __name__ == "__main__":
    asyncio.run(list_all_allows())
