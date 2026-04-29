# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

import pyodbc
import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.models.base import Store, Department, Item, Partner
from app.migration.mappers import ShoperMapper

# MSSQL CONFIG
MSSQL_CONN_STR = "Driver={SQL Server};Server=localhost;Database=Shoper9CSW;Trusted_Connection=yes;"

async def get_default_ids(session: AsyncSession):
    """Ensures a default store and department exist"""
    # Get or create Store
    result = await session.execute(select(Store).limit(1))
    store = result.scalar_one_or_none()
    if not store:
        store = Store(id="STORE001", name="Main Store", code="MAIN")
        session.add(store)
        await session.flush()
    
    # Get or create Department
    result = await session.execute(select(Department).limit(1))
    dept = result.scalar_one_or_none()
    if not dept:
        dept = Department(store_id=store.id, name="General")
        session.add(dept)
        await session.flush()
        
    return store.id, dept.id

async def run_migration():
    """Main Migration Pulse"""
    print("🚀 Initializing Shoper9 -> SMRITI-OS Migration...")
    
    async with AsyncSessionLocal() as pg_session:
        store_id, dept_id = await get_default_ids(pg_session)
        
        try:
            mssql_conn = pyodbc.connect(MSSQL_CONN_STR)
            cursor = mssql_conn.cursor()
            
            # 1. Migrate Items
            print("📦 Migrating Items...")
            cursor.execute("SELECT StockNo, Descr, MRP, PurchRate FROM Items")
            rows = cursor.fetchall()
            for row in rows:
                # Check if item exists
                existing = await pg_session.execute(select(Item).where(Item.external_id == row.StockNo))
                if not existing.scalar_one_or_none():
                    item = ShoperMapper.map_item(row, store_id, dept_id)
                    pg_session.add(item)
            
            await pg_session.commit()
            print(f"✅ Successfully migrated {len(rows)} items.")
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            await pg_session.rollback()
        finally:
            mssql_conn.close()

if __name__ == "__main__":
    asyncio.run(run_migration())
