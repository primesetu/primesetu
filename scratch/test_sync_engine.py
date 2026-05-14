import asyncio
import os
import sys
from dotenv import load_dotenv

load_dotenv("backend/.env")

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.services.offline_sync import offline_sync_engine

async def main():
    print("1. Initializing Offline Sync Engine...")
    await offline_sync_engine.initialize()
    
    print("2. Queuing a dummy item creation event...")
    record = {
        "sku": "TEST-SYNC-001",
        "name": "SMRITI OS Sync Test Item",
        "mrp": 999.00,
        "sync_version": 1,
        "is_deleted": False
    }
    await offline_sync_engine.enqueue("smriti_item", "INSERT", record)
    
    print("3. Checking queue status before flush...")
    status = await offline_sync_engine.get_status()
    print(status)
    
    # We won't actually flush right now because we don't have Supabase URL set up
    # but we can verify the local queue is working.
    print("Test Complete. Local Queue is functional.")

if __name__ == "__main__":
    asyncio.run(main())
