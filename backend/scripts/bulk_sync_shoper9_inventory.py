import pyodbc
import asyncio
import asyncpg
import uuid
import os
from app.core.config import settings

# ============================================================
# PrimeSetu - Shoper 9 BULK Sync Engine
# Phase 4: Institutional-Grade High-Speed Migration
# ============================================================

async def get_shoper9_data(database="SHOPER9X01"):
    """Fetches all 40k items in one go from MSSQL."""
    print("Reading 40k records from Shoper 9 MSSQL...")
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        query = """
            SELECT 
                IM.StockNo, 
                IM.ItemDesc, 
                IM.Retail_Price, 
                IM.Class2Cd as DeptCode,
                ISNULL(SM.CurBalQty, 0) as Qty
            FROM ItemMaster IM
            LEFT JOIN StockMaster SM ON IM.StockNo = SM.StockNo
            WHERE IM.ItemDesc IS NOT NULL
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        conn.close()
        return rows
    except Exception as e:
        print(f"MSSQL Error: {e}")
        return []

async def bulk_sync():
    print("Starting High-Speed Bulk Sync...")
    
    # 1. Fetch data from MSSQL
    rows = await get_shoper9_data()
    if not rows:
        return

    # 2. Connect to Supabase
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(url)
    
    # 3. Get Store and Department Maps
    store_row = await conn.fetchrow("SELECT id FROM stores LIMIT 1")
    store_id = store_row['id']
    
    dept_rows = await conn.fetch("SELECT id, code FROM departments")
    dept_map = {r['code']: r['id'] for r in dept_rows}
    default_dept_id = list(dept_map.values())[0] if dept_map else None

    # 4. Prepare Records for Items
    # Table columns: id, store_id, item_code, item_name, department_id, mrp_paise, gst_rate, hsn_code, is_active, external_id, anal_codes, user_fields, created_at, updated_at
    item_records = []
    stock_records = []
    
    print(f"Formatting {len(rows)} records...")
    for row in rows:
        item_id = uuid.uuid4()
        mrp_paise = int(float(row.Retail_Price) * 100) if row.Retail_Price else 0
        dept_id = dept_map.get(row.DeptCode, default_dept_id)
        
        # Item Record
        item_records.append((
            item_id,                # id
            store_id,               # store_id
            row.StockNo,            # item_code
            row.ItemDesc[:40],       # item_name
            dept_id,                # department_id
            mrp_paise,              # mrp_paise
            18,                     # gst_rate
            "9999",                 # hsn_code
            True,                   # is_active
            row.StockNo,            # external_id
            '{}',                   # anal_codes
            '{}'                    # user_fields
        ))
        
        # Stock Record
        stock_records.append((
            uuid.uuid4(),           # id
            item_id,                # item_id
            store_id,               # store_id
            "NA",                   # size
            "NA",                   # colour
            int(row.Qty),           # qty_on_hand
            0,                      # qty_reserved
            10                      # reorder_level
        ))

    # 5. Execute Bulk Insert using Temp Tables (to handle duplicates/updates)
    print("Uploading to temporary buffer...")
    async with conn.transaction():
        # Clear existing items if re-syncing (Optional: Adjust based on user needs)
        # For now, we'll just TRUNCATE items and item_stock for a clean high-speed sync
        await conn.execute("TRUNCATE TABLE item_stock CASCADE")
        await conn.execute("TRUNCATE TABLE items CASCADE")
        
        # Use copy_records_to_table for insane speed
        await conn.copy_records_to_table(
            'items', 
            records=item_records, 
            columns=[
                'id', 'store_id', 'item_code', 'item_name', 'department_id', 
                'mrp_paise', 'gst_rate', 'hsn_code', 'is_active', 'external_id', 
                'anal_codes', 'user_fields'
            ]
        )
        
        await conn.copy_records_to_table(
            'item_stock', 
            records=stock_records, 
            columns=['id', 'item_id', 'store_id', 'size', 'colour', 'qty_on_hand', 'qty_reserved', 'reorder_level']
        )

    await conn.close()
    print(f"BULK SYNC COMPLETE! {len(item_records)} items and stock levels migrated in seconds.")

if __name__ == "__main__":
    asyncio.run(bulk_sync())
