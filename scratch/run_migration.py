import asyncio
import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.migration_engine import MigrationEngine

async def run_initial_migration():
    print("--- [SMRITI-OS] STARTING SOVEREIGN MIGRATION (X01) ---")
    engine = MigrationEngine(mssql_db="Shoper9X01")
    
    try:
        await engine.migrate_params()
        await engine.migrate_ad()
        await engine.migrate_lookup_map()
        print("--- [SMRITI-OS] INITIAL MIGRATION COMPLETED SUCCESSFULLY ---")
    except Exception as e:
        print(f"ERROR: Migration failed - {e}")

if __name__ == "__main__":
    asyncio.run(run_initial_migration())
