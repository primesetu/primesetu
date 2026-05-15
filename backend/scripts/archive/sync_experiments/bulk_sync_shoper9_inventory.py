import pyodbc
import asyncio
import asyncpg
import uuid
import os
import json
from datetime import datetime, date
from decimal import Decimal
from app.core.config import settings

# ============================================================
# SMRITI-OS - Shoper 9 BULK Sync Engine
# Phase 4: Institutional-Grade High-Speed Migration
# ============================================================

def custom_serializer(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Type {type(obj)} not serializable")

async def get_shoper9_data(database="SHOPER9WH1"):
    """Fetches all 40k items in one go from MSSQL including all columns."""
    print("Reading all columns for 40k records from Shoper 9 MSSQL...")
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        query = """
            SELECT 
                IM.*,
                ISNULL(SM.CurBalQty, 0) as CurBalQty
            FROM ItemMaster IM
            LEFT JOIN StockMaster SM ON IM.StockNo = SM.StockNo
            WHERE IM.ItemDesc IS NOT NULL
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

async def bulk_sync():
    print("Starting High-Speed Bulk Sync (All Fields Mapping)...")
    
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
    item_records = []
    stock_records = []
    
    print(f"Formatting {len(rows)} records and mapping 127 columns into JSONB...")
    for row in rows:
        item_id = uuid.uuid4()
        raw_price = row.get('Retail_Price')
        mrp_paise = int(float(raw_price) * 100) if raw_price else 0
        dept_id = dept_map.get(row.get('Class2Cd'), default_dept_id)
        
        anal_codes = {}
        user_fields = {}
        
        # Categorize all remaining fields dynamically
        for k, v in row.items():
            if v is None or str(v).strip() == '':
                continue
            
            # Skip core fields that are statically mapped
            if k in ['StockNo', 'ItemDesc', 'Retail_Price', 'Class2Cd', 'CurBalQty']:
                continue
                
            # Direct mapping to AnalCodes
            if k.startswith('AnalCode'):
                anal_codes[k] = v
            else:
                user_fields[k] = v
        
        # Item Record
        item_records.append((
            item_id,                # id
            store_id,               # store_id
            row.get('StockNo'),     # item_code
            row.get('ItemDesc', '')[:40], # item_name
            dept_id,                # department_id
            mrp_paise,              # mrp_paise
            18,                     # gst_rate
            "9999",                 # hsn_code
            True,                   # is_active
            row.get('StockNo'),     # external_id
            json.dumps(anal_codes, default=custom_serializer),  # anal_codes JSONB
            json.dumps(user_fields, default=custom_serializer)  # user_fields JSONB
        ))
        
        # Stock Record
        stock_records.append((
            uuid.uuid4(),           # id
            item_id,                # item_id
            store_id,               # store_id
            "NA",                   # size
            "NA",                   # colour
            int(row.get('CurBalQty', 0)), # qty_on_hand
            0,                      # qty_reserved
            10                      # reorder_level
        ))

    # 5. Execute Bulk Insert using Temp Tables
    print("Uploading to temporary buffer...")
    async with conn.transaction():
        await conn.execute("TRUNCATE TABLE item_stock CASCADE")
        await conn.execute("TRUNCATE TABLE items CASCADE")
        
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
    print(f"BULK SYNC COMPLETE! {len(item_records)} items with full JSONB metadata migrated in seconds.")

if __name__ == "__main__":
    asyncio.run(bulk_sync())

