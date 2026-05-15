import pyodbc
import asyncio
import asyncpg
import uuid
import json
from datetime import datetime
from app.core.config import settings

# ============================================================
# SMRITI-OS - Shoper 9 BULK Sync Engine
# Phase 4.1: Warehouse Forensic Audits (TRNStockAudit)
# ============================================================

async def get_shoper9_audits(database="SHOPER9WH1", limit=None):
    """Fetches TRNStockAudit records from MSSQL."""
    print("Reading records from TRNStockAudit in Shoper 9 MSSQL...")
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        limit_clause = f"TOP {limit}" if limit else ""
        query = f"""
            SELECT {limit_clause}
                StockNo,
                SMCurBalQty,
                DocQty,
                PhyQtyIn,
                PhyQtyOut,
                DateInsert
            FROM TRNStockAudit
            WHERE StockNo IS NOT NULL
        """
        cursor.execute(query)
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        
        data = []
        for row in rows:
            data.append(dict(zip(columns, row)))
            
        conn.close()
        return data
    except Exception as e:
        print(f"MSSQL Error: {e}")
        return []

async def bulk_sync_audits():
    print("Starting High-Speed Bulk Sync for Warehouse Audits...")
    
    # 1. Fetch data from MSSQL
    rows = await get_shoper9_audits()
    if not rows:
        return

    # 2. Connect to Supabase
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(url)
    
    # 3. Patch Schema (Make txn_id nullable if it isn't already)
    try:
        await conn.execute("ALTER TABLE stock_audit_ledger ALTER COLUMN txn_id DROP NOT NULL")
    except Exception as e:
        pass # Might already be nullable
    
    # 4. Get Store and Item Maps
    store_row = await conn.fetchrow("SELECT id FROM stores LIMIT 1")
    store_id = store_row['id']
    
    item_rows = await conn.fetch("SELECT id, external_id FROM items")
    item_map = {r['external_id']: r['id'] for r in item_rows if r['external_id']}

    # 5. Prepare Records
    audit_records = []
    
    print(f"Formatting {len(rows)} audit records...")
    skipped = 0
    for row in rows:
        item_id = item_map.get(row.get('StockNo'))
        if not item_id:
            skipped += 1
            continue
            
        # Forensic Mathematics from Shoper 9
        # Prev = SMCurBalQty
        # Change = PhyQtyIn - PhyQtyOut (or DocQty depending on TrnType)
        # New = Prev + Change
        prev_qty = int(row.get('SMCurBalQty') or 0)
        
        phy_in = int(row.get('PhyQtyIn') or 0)
        phy_out = int(row.get('PhyQtyOut') or 0)
        
        if phy_in > 0:
            change_qty = phy_in
        elif phy_out > 0:
            change_qty = -phy_out
        else:
            change_qty = int(row.get('DocQty') or 0)
            
        new_qty = prev_qty + change_qty
        
        date_insert = row.get('DateInsert') or datetime.now()
        
        # Record
        audit_records.append((
            uuid.uuid4(),           # id
            store_id,               # store_id
            item_id,                # item_id
            None,                   # txn_id (NULL since historical)
            prev_qty,               # prev_qty
            change_qty,             # change_qty
            new_qty,                # new_qty
            date_insert             # created_at
        ))

    # 6. Execute Bulk Insert using Temp Tables
    print("Uploading to temporary buffer...")
    async with conn.transaction():
        await conn.execute("TRUNCATE TABLE stock_audit_ledger CASCADE")
        
        await conn.copy_records_to_table(
            'stock_audit_ledger', 
            records=audit_records, 
            columns=[
                'id', 'store_id', 'item_id', 'txn_id', 
                'prev_qty', 'change_qty', 'new_qty', 'created_at'
            ]
        )

    await conn.close()
    print(f"BULK SYNC COMPLETE! {len(audit_records)} forensic audit records migrated. (Skipped {skipped} unknown items)")

if __name__ == "__main__":
    asyncio.run(bulk_sync_audits())
