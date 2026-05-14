import asyncio
import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.migration_engine import MigrationEngine
from app.core.database import engine
from sqlalchemy import text

async def run_gkp_migration():
    print("--- [SMRITI-OS] STARTING FRESH SOVEREIGN MIGRATION (GKP) ---")
    
    # Clean Slate Logic
    async with engine.begin() as conn:
        print("Cleaning old Sovereign tables...")
        await conn.execute(text("TRUNCATE TABLE smriti_param, smriti_ad, smriti_lookup_map RESTART IDENTITY CASCADE"))
    
    # GKP Migration
    engine_gkp = MigrationEngine(mssql_db="Shoper9GKP")
    
    try:
        await engine_gkp.migrate_params()
        await engine_gkp.migrate_ad()
        await engine_gkp.migrate_lookup_map()
        print("--- [SMRITI-OS] FRESH GKP MIGRATION COMPLETED SUCCESSFULLY ---")
    except Exception as e:
        print(f"ERROR: GKP Migration failed - {e}")

if __name__ == "__main__":
    asyncio.run(run_gkp_migration())
