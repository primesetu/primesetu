import sys
import os
import asyncio

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.core.database import engine
from app.models.base import Base
import app.models.sovereign  # Ensure models are registered

async def create_sovereign_tables():
    print("--- [SMRITI-OS] SOVEREIGN TABLE INITIALIZATION (ASYNC) ---")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("SUCCESS: All SMRITI_ tables have been created in the Sovereign Database.")

if __name__ == "__main__":
    asyncio.run(create_sovereign_tables())
