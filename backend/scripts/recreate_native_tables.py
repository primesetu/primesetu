import asyncio
from app.core.database import engine, Base
import app.models.base # Ensure all models are imported
import app.models.security
import app.models.reporting
import app.models.legacy_s9

async def recreate_tables():
    print("Recreating SMRITI-OS Native Tables...")
    async with engine.begin() as conn:
        # We only want to create tables that don't exist
        # But since we just dropped them, we can just run create_all
        await conn.run_sync(Base.metadata.create_all)
    print("Success: Native tables recreated.")

if __name__ == '__main__':
    asyncio.run(recreate_tables())
