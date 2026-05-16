import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def fix():
    async with AsyncSessionLocal() as db:
        print("Adding 'tenant_id' to 'users' table...")
        try:
            await db.execute(text("ALTER TABLE users ADD COLUMN tenant_id VARCHAR DEFAULT 'SYSTEM'"))
            await db.execute(text("CREATE INDEX ix_users_tenant_id ON users (tenant_id)"))
            await db.commit()
            print("Successfully updated 'users' table.")
        except Exception as e:
            print(f"Error: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(fix())
