import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.models.sovereign import Base

async def init_db():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    async with engine.begin() as conn:
        print("Creating tables if they don't exist...")
        await conn.run_sync(Base.metadata.create_all)
    print("Database initialization complete.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db())
