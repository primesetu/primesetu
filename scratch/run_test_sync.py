import asyncio
import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.migration_engine import MigrationEngine

async def run_test_migration():
    print("--- [SMRITI-OS] SYNCING SELECTIVE TEST DATA (GKP) ---")
    engine_gkp = MigrationEngine(mssql_db="Shoper9GKP")
    
    try:
        # 1. Sync 10 Test Items with Stock 50-100
        await engine_gkp.migrate_test_items(limit=10, min_qty=50.0, max_qty=100.0)
        
        # 2. Sync Staff (Salesmen)
        await engine_gkp.migrate_staff()
        
        print("--- [SMRITI-OS] TEST DATA SYNC COMPLETED ---")
    except Exception as e:
        print(f"ERROR: Test Sync failed - {e}")

if __name__ == "__main__":
    asyncio.run(run_test_migration())
