
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def check_sku():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Search for the SKU with trailing space handling
        sku = "0000000000257"
        print(f"Searching for SKU: '{sku}'")
        
        # 1. Exact match
        result = await session.execute(text("SELECT stockno, itemdesc FROM shoper9.itemmaster WHERE stockno = :sku"), {"sku": sku})
        item = result.first()
        print(f"Exact match: {item}")
        
        # 2. Trimmed match
        result = await session.execute(text("SELECT stockno, itemdesc FROM shoper9.itemmaster WHERE trim(stockno) = :sku"), {"sku": sku})
        item = result.first()
        print(f"Trimmed match: {item}")
        
        # 3. Like match
        result = await session.execute(text("SELECT stockno, itemdesc FROM shoper9.itemmaster WHERE stockno LIKE :sku"), {"sku": f"%{sku}%"})
        item = result.first()
        print(f"Like match: {item}")

if __name__ == "__main__":
    asyncio.run(check_sku())
