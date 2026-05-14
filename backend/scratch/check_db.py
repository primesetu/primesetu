
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

# Load DB URL from .env
# Simplified for scratch script
DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def check_db():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check if shoper9 schema exists
        result = await session.execute(text("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'shoper9'"))
        schema = result.scalar()
        print(f"Schema shoper9: {schema}")
        
        if schema:
            # Check Itemmaster count
            result = await session.execute(text("SELECT count(*) FROM shoper9.itemmaster"))
            count = result.scalar()
            print(f"Itemmaster count: {count}")
            
            if count > 0:
                # Get a sample item
                result = await session.execute(text("SELECT stockno, itemdesc FROM shoper9.itemmaster LIMIT 1"))
                item = result.first()
                print(f"Sample Item: {item}")

if __name__ == "__main__":
    asyncio.run(check_db())
