import asyncio
import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.core.database import engine, Base
from app.services.offline_sync import offline_sync_engine
from app.core.config import settings

async def debug_startup():
    print(f"Testing startup events. Storage Mode: {settings.storage_mode}")
    
    try:
        print("1. Testing Base.metadata.create_all...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("SUCCESS: Database metadata created.")

        if settings.storage_mode == "LOCAL_POSTGRES":
            print("2. Testing offline_sync_engine.initialize()...")
            await offline_sync_engine.initialize()
            print("SUCCESS: Sync engine initialized.")
            
            print("3. Testing offline_sync_engine.start()...")
            await offline_sync_engine.start()
            print("SUCCESS: Sync engine started.")
            
            await asyncio.sleep(1)
            await offline_sync_engine.stop()
            print("✓ Sync engine stopped.")
        
        print("\nAll startup events completed successfully.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(debug_startup())
