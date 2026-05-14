
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def check_all_257():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Search for any stockno containing '257'
        result = await session.execute(text("SELECT stockno, itemdesc FROM shoper9.itemmaster WHERE stockno LIKE '%257%'"))
        items = result.all()
        print(f"Total matching '%257%': {len(items)}")
        for item in items:
            print(f"  - {item}")

if __name__ == "__main__":
    asyncio.run(check_all_257())
