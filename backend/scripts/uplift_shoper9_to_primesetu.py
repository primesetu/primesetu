import pyodbc
import asyncio
import uuid
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine
from app.models.base import Department, Store
from typing import Optional

# ============================================================
# PrimeSetu - Shoper 9 "Uplift" Engine
# Phase 2: Transforming Legacy Lookups into Future-Ready Trees
# ============================================================

async def get_store_id() -> uuid.UUID:
    """Helper to get the primary store ID."""
    async with AsyncSessionLocal() as session:
        stmt = select(Store).limit(1)
        result = await session.execute(stmt)
        store = result.scalar_one_or_none()
        if not store:
            # Create a default store if none exists (Sovereign fallback)
            store = Store(name="Main Store", code="S001")
            session.add(store)
            await session.commit()
            await session.refresh(store)
        return store.id

def get_shoper9_departments(database="SHOPER9X01"):
    """Fetches flat departments from Shoper 9 GenLookUp."""
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        # Recid 2 = Departments in Shoper 9 DNA
        cursor.execute("SELECT Code, Descr FROM GenLookUp WHERE Recid = 2")
        rows = cursor.fetchall()
        conn.close()
        return [{"code": row.Code, "name": row.Descr} for row in rows]
    except Exception as e:
        print(f"MSSQL Error: {e}")
        return []

async def uplift_departments():
    print("Starting Shoper 9 Department Uplift...")
    
    try:
        store_id = await get_store_id()
    except Exception as e:
        print(f"Error getting store_id: {e}")
        return

    shoper_deps = get_shoper9_departments()
    
    if not shoper_deps:
        print("No departments found in Shoper 9.")
        return

    async with AsyncSessionLocal() as session:
        for dep in shoper_deps:
            # Check if already exists
            stmt = select(Department).where(Department.code == dep["code"])
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if not existing:
                print(f"Uplifting: {dep['name']} ({dep['code']})")
                
                # Logic for "Uplifting" to Hierarchy:
                # If a code has a dash (e.g. 'M-SHIRT'), we could treat 'M' as parent.
                # For now, we uplift as Top Level (Level 1).
                new_dep = Department(
                    store_id=store_id,
                    name=dep["name"],
                    code=dep["code"],
                    level=1,
                    parent_id=None
                )
                session.add(new_dep)
        
        await session.commit()
        print("Uplift Complete. Shoper 9 Departments are now PrimeSetu Future-Ready entities.")

if __name__ == "__main__":
    asyncio.run(uplift_departments())
