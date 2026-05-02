import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.models.base import Base
import app.models.legacy_s9  # Ensure all models are loaded
from dotenv import load_dotenv

load_dotenv()

async def recreate_database():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL not found in .env")
        return
        
    engine = create_async_engine(db_url)
    
    async with engine.begin() as conn:
        print("WIPING DATABASE (CASCADE)...")
        # Wipe everything
        await conn.execute(text("DROP SCHEMA IF EXISTS shoper9 CASCADE"))
        await conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE"))
        
        print("RECREATING SCHEMAS...")
        await conn.execute(text("CREATE SCHEMA public"))
        await conn.execute(text("CREATE SCHEMA shoper9"))
        
        # Ensure extensions are available
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""))
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
        
        print("CREATING ALL TABLES (SMRITI-OS + SHOPER 9)...")
        await conn.run_sync(Base.metadata.create_all)
        
    print("Database Reconstruction Complete!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(recreate_database())
