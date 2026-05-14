import asyncio
import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.migration_engine import MigrationEngine
from app.models.sovereign import SmritiStaff
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import engine

async def run_test_migration_x01():
    print("--- [SMRITI-OS] SYNCING SELECTIVE TEST DATA (X01) ---")
    # Using X01 as source
    engine_x01 = MigrationEngine(mssql_db="Shoper9X01")
    
    try:
        # 1. Sync 10 Test Items with Stock 5-25 (Updated range based on actual data)
        print("Migrating 10 Test Items (Stock: 5-25)...")
        await engine_x01.migrate_test_items(limit=10, min_qty=5.0, max_qty=25.0)
        
        # 2. Sync Staff (Salesmen) from X01
        print("Migrating Personnel from X01...")
        # Corrected columns for X01/GKP schema: Code, Nm, ActiveFlag
        data = engine_x01.fetch_from_mssql("SELECT Code, Nm FROM Personnel WHERE ActiveFlag = 1")
        
        async with AsyncSession(engine) as session:
            async with session.begin():
                for row in data:
                    staff = SmritiStaff(
                        code=row['Code'],
                        name=row['Nm'],
                        role='SALESMAN'
                    )
                    await session.merge(staff)
            await session.commit()
        print(f"Synced {len(data)} sales personnel from X01.")
        
        print("--- [SMRITI-OS] TEST DATA SYNC COMPLETED SUCCESSFULLY ---")
    except Exception as e:
        print(f"ERROR: Test Sync failed - {e}")

if __name__ == "__main__":
    asyncio.run(run_test_migration_x01())
