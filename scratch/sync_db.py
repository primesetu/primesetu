
import asyncio
from sqlalchemy import text
from backend.app.core.database import engine
import backend.app.main  # Apply monkeypatch
from backend.app.models.base import Base

async def sync_db():
    async with engine.begin() as conn:
        print("Dropping all existing tables...")
        # Get all tables in public schema
        result = await conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'"))
        tables = [row[0] for row in result]
        
        for table in tables:
            print(f"Dropping table {table}...")
            await conn.execute(text(f"DROP TABLE IF EXISTS \"{table}\" CASCADE"))
            
        print("Creating all tables from SQLAlchemy models...")
        await conn.run_sync(Base.metadata.create_all)
        print("Done!")

if __name__ == "__main__":
    asyncio.run(sync_db())
