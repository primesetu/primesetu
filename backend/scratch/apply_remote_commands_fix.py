import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:MSba108682!%40@127.0.0.1:5434/smriti_local"

async def apply_migration():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        print("Applying migration to remote_commands table...")
        try:
            # Add confirmed_by_id
            await conn.execute(text("ALTER TABLE remote_commands ADD COLUMN IF NOT EXISTS confirmed_by_id VARCHAR;"))
            # Add confirmed_at
            await conn.execute(text("ALTER TABLE remote_commands ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITHOUT TIME ZONE;"))
            # Add expires_at
            await conn.execute(text("ALTER TABLE remote_commands ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITHOUT TIME ZONE;"))
            print("Migration applied successfully.")
        except Exception as e:
            print(f"Error applying migration: {e}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(apply_migration())
