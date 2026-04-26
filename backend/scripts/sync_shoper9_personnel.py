import pyodbc
import asyncio
import asyncpg
import uuid
import os
from app.core.config import settings

# ============================================================
# PrimeSetu - Shoper 9 Personnel Sync Engine (V2)
# Phase 8: Migrating Sales Staff to the Sovereign Cloud
# ============================================================

async def get_shoper9_personnel(database="SHOPER9X01"):
    """Fetches all active personnel from Shoper 9."""
    print("Reading personnel from Shoper 9 MSSQL...")
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        query = "SELECT Code, Nm, Type, ActiveFlag FROM Personnel"
        cursor.execute(query)
        rows = cursor.fetchall()
        conn.close()
        return rows
    except Exception as e:
        print(f"MSSQL Personnel Error: {e}")
        return []

async def sync_personnel():
    print("Starting Personnel Migration...")
    
    # 1. Fetch from Shoper 9
    rows = await get_shoper9_personnel()
    if not rows:
        return
        
    # 2. Connect to Supabase
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(url)
    
    personnel_records = []
    for row in rows:
        # Table: partners
        # Columns: id, type, code, name, credit_limit, loyalty_points, is_active, external_id
        personnel_records.append((
            uuid.uuid4(),               # id
            'Salesperson',              # type
            str(row.Code).strip(),       # code
            str(row.Nm).strip()[:100],   # name
            0.0,                        # credit_limit
            0,                          # loyalty_points
            bool(row.ActiveFlag),       # is_active
            str(row.Code).strip()        # external_id
        ))
        
    # 3. Bulk Insert
    print(f"Uploading {len(personnel_records)} personnel to Supabase...")
    
    async with conn.transaction():
        # Clean up previous if any
        await conn.execute("DELETE FROM partners WHERE type = 'Salesperson'")
        
        await conn.copy_records_to_table(
            'partners',
            records=personnel_records,
            columns=['id', 'type', 'code', 'name', 'credit_limit', 'loyalty_points', 'is_active', 'external_id']
        )
        
    await conn.close()
    print(f"PERSONNEL SYNC COMPLETE! {len(personnel_records)} staff members migrated.")

if __name__ == "__main__":
    asyncio.run(sync_personnel())
