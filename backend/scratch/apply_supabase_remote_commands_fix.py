import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682!%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def apply_supabase_migration():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        print("Applying migration to remote_commands table in Supabase...")
        try:
            # Add confirmed_by_id
            await conn.execute(text("ALTER TABLE remote_commands ADD COLUMN IF NOT EXISTS confirmed_by_id VARCHAR;"))
            # Add confirmed_at
            await conn.execute(text("ALTER TABLE remote_commands ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITHOUT TIME ZONE;"))
            # Add expires_at
            await conn.execute(text("ALTER TABLE remote_commands ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITHOUT TIME ZONE;"))
            print("Migration applied successfully to Supabase.")
        except Exception as e:
            print(f"Error applying migration to Supabase: {e}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(apply_supabase_migration())
