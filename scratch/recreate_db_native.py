import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from backend.app.models.base import Base
import backend.app.models.legacy_s9  # Ensure all models are loaded
from dotenv import load_dotenv

load_dotenv()

async def recreate_database():
    db_url = os.getenv("DATABASE_URL")
    engine = create_async_engine(db_url)
    
    async with engine.begin() as conn:
        print("🔥 DROPPING ALL TABLES...")
        # We only want to drop tables that are managed by legacy_s9
        # To be safe and clean, let's just drop everything in the public schema if needed,
        # but SQLAlchemy will only drop what's in Base.metadata.
        await conn.run_sync(Base.metadata.drop_all)
        
        print("🏗️ CREATING ALL TABLES (SHOPER 9 NATIVE SCHEMA)...")
        await conn.run_sync(Base.metadata.create_all)
        
    print("✅ Database Reconstruction Complete!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(recreate_database())
