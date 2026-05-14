
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def check_sfield():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        sku = "0000000000257"
        # Search in sfield1
        result = await session.execute(text("SELECT stockno, sfield1, itemdesc FROM shoper9.itemmaster WHERE sfield1 = :sku"), {"sku": sku})
        item = result.first()
        print(f"Sfield1 match: {item}")
        
        # Search in any column for this value
        result = await session.execute(text("SELECT stockno, itemdesc FROM shoper9.itemmaster WHERE :sku IN (stockno, sfield1, sfield2, sfield3)"), {"sku": sku})
        item = result.first()
        print(f"Global match: {item}")

if __name__ == "__main__":
    asyncio.run(check_sfield())
