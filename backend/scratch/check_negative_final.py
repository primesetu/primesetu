
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def check_negative_stock():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("Checking SYSPARAM for Negative/Out-of-Stock settings...")
        
        # Broad search for negative and out of stock
        query = "SELECT paramcode, descr, boolean, intg, txt FROM shoper9.sysparam WHERE lower(paramcode) LIKE '%neg%' OR lower(descr) LIKE '%neg%' OR lower(paramcode) LIKE '%out%' OR lower(descr) LIKE '%out%'"
        
        result = await session.execute(text(query))
        params = result.all()
        
        for p in params:
            val = p.boolean if p.boolean is not None else \
                  p.intg if p.intg is not None else \
                  p.txt if p.txt is not None else "N/A"
            print(f"[{p.paramcode}] = {val} | {p.descr}")

if __name__ == "__main__":
    asyncio.run(check_negative_stock())
