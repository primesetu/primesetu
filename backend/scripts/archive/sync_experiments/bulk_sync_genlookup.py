import pyodbc
import asyncio
import asyncpg
import uuid
from app.core.config import settings

# ============================================================
# SMRITI-OS - Shoper 9 BULK Sync Engine
# Phase 5: General Lookups & Translations (GenLookUp)
# ============================================================

async def get_shoper9_lookups(database="SHOPER9WH1"):
    """Fetches GenLookUp records from MSSQL."""
    print("Reading GenLookUp from Shoper 9 MSSQL...")
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        # 1. Fetch Headers (Recid = 0)
        cursor.execute("SELECT Code, Descr FROM GenLookUp WHERE Recid = 0")
        headers = {int(row.Code): row.Descr for row in cursor.fetchall()}
        
        # 2. Fetch Data Rows (Recid > 0)
        cursor.execute("SELECT Recid, Code, Descr, Number FROM GenLookUp WHERE Recid > 0")
        rows = cursor.fetchall()
        
        data = []
        for row in rows:
            category_name = headers.get(row.Recid, f"Unknown_{row.Recid}")
            data.append({
                "category": category_name,
                "code": row.Code,
                "label": row.Descr,
                "shoper_recid": row.Recid,
                "sort_order": row.Number or 0
            })
            
        conn.close()
        return data
    except Exception as e:
        print(f"MSSQL Error: {e}")
        return []

async def bulk_sync_lookups():
    print("Starting High-Speed Bulk Sync for General Lookups...")
    
    # 1. Fetch data from MSSQL
    lookups = await get_shoper9_lookups()
    if not lookups:
        print("No lookups found.")
        return

    # 2. Connect to Supabase
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(url)
    
    # 3. Get Store ID
    store_row = await conn.fetchrow("SELECT id FROM stores LIMIT 1")
    store_id = store_row['id'] if store_row else None

    # 4. Prepare Records
    records = []
    print(f"Formatting {len(lookups)} lookup records...")
    for item in lookups:
        label = item['label'] if item['label'] else item['code']
        records.append((
            uuid.uuid4(),           # id
            store_id,               # store_id
            item['category'],       # category
            item['code'],           # code
            label,                  # label
            item['sort_order'],     # sort_order
            True,                   # is_active
            item['shoper_recid'],   # shoper_recid
            None                    # meta
        ))

    # 5. Execute Bulk Insert
    print("Uploading to SMRITI-OS (Supabase)...")
    async with conn.transaction():
        # Clean existing shoper-synced lookups
        await conn.execute("DELETE FROM general_lookup WHERE shoper_recid IS NOT NULL")
        
        await conn.copy_records_to_table(
            'general_lookup', 
            records=records, 
            columns=[
                'id', 'store_id', 'category', 'code', 'label', 
                'sort_order', 'is_active', 'shoper_recid', 'meta'
            ]
        )

    await conn.close()
    print(f"BULK SYNC COMPLETE! {len(records)} lookup definitions migrated.")

if __name__ == "__main__":
    asyncio.run(bulk_sync_lookups())
