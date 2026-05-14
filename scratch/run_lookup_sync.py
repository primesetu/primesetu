import asyncio
import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.migration_engine import MigrationEngine

async def run_lookup_migration():
    print("--- [SMRITI-OS] SYNCING LOOKUP MASTER (GKP) ---")
    engine_gkp = MigrationEngine(mssql_db="Shoper9GKP")
    
    try:
        await engine_gkp.migrate_lookups()
        print("--- [SMRITI-OS] LOOKUP SYNC COMPLETED ---")
    except Exception as e:
        print(f"ERROR: Lookup Sync failed - {e}")

if __name__ == "__main__":
    asyncio.run(run_lookup_migration())
