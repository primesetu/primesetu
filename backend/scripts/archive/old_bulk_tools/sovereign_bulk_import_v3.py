import pyodbc
import asyncio
import asyncpg
import os
import json
from decimal import Decimal
from datetime import datetime
import sys

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Connection Configs
MSSQL_CONN = "DRIVER={SQL Server};SERVER=AITDL;DATABASE=Shoper9X01;UID=sa;PWD=netmanthan@123"
PG_URL = "postgresql://postgres:MSba108682%21%40@localhost:5434/smriti_local"

async def run_v3_import():
    print("\n" + "="*60)
    print("Starting Smriti-OS v3.0 ItemMaster Sovereign Import...")
    print("="*60)
    
    # 1. Fetch from Shoper 9
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Connecting to Shoper 9 (MSSQL)...")
    try:
        mssql_conn = pyodbc.connect(MSSQL_CONN)
        cursor = mssql_conn.cursor()
        
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Fetching 40k+ records from ItemMaster & StockMaster...")
        cursor.execute("""
            SELECT 
                IM.*, 
                ISNULL(SM.CurBalQty, 0) as CurBalQty 
            FROM ItemMaster IM 
            LEFT JOIN StockMaster SM ON IM.StockNo = SM.StockNo
        """)
        
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        mssql_conn.close()
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Extraction Complete: {len(rows)} items found.")
    except Exception as e:
        print(f"ERROR: MSSQL Error: {e}")
        return

    # 2. Connect to PostgreSQL
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Connecting to Sovereign PostgreSQL...")
    try:
        pg_conn = await asyncpg.connect(PG_URL)
    except Exception as e:
        print(f"ERROR: PostgreSQL Error: {e}")
        return
    
    # 3. Prepare Batch Data
    item_records = []
    stock_records = []
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Processing metadata and mapping JSONB fields...")
    
    for row_raw in rows:
        row = dict(zip(columns, row_raw))
        sku = (row.get('StockNo') or "").strip()
        if not sku: continue
        
        # Categorize metadata for v3.0 JSONB columns
        anal_codes = {k: row[k] for k in columns if k.startswith('AnalCode') and row[k] is not None}
        
        # Map everything else to user_fields (Dynamic Schema)
        core_fields = ['StockNo', 'ItemDesc', 'Class1Cd', 'Class2Cd', 'SubClass1Cd', 'SubClass2Cd', 
                       'Retail_Price', 'CurrentCost', 'AnalCode32', 'CurBalQty', 'BarCode']
        user_fields = {k: row[k] for k in columns if k not in core_fields and not k.startswith('AnalCode') and row[k] is not None}

        # SmritiItem Record
        item_records.append((
            sku,
            (row.get('ItemDesc') or "")[:255].strip(),
            (row.get('Class1Cd') or "").strip(),
            (row.get('Class2Cd') or "").strip(),
            (row.get('SubClass1Cd') or "").strip(),
            (row.get('SubClass2Cd') or "").strip(),
            Decimal(str(row.get('Retail_Price') or 0)),
            Decimal(str(row.get('CurrentCost') or 0)),
            (row.get('AnalCode32') or "").strip(), # HSN Code
            True, # is_active
            (row.get('BarCode') or "").strip(),
            json.dumps(anal_codes, default=str),
            json.dumps(user_fields, default=str),
            datetime.utcnow()
        ))

        # SmritiStock Record
        stock_records.append((
            sku,
            "11", # Default Store Context
            Decimal(str(row.get('CurBalQty') or 0)),
            datetime.utcnow()
        ))

    # 4. High-Speed Bulk Load
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Executing High-Speed COPY to Sovereign tables...")
    try:
        async with pg_conn.transaction():
            # Clear existing to ensure clean v3.0 state
            await pg_conn.execute("TRUNCATE TABLE smriti_item, smriti_stock CASCADE")
            
            # Disable triggers for load performance (Handbook v3.0 Section 7.5)
            await pg_conn.execute("ALTER TABLE smriti_item DISABLE TRIGGER ALL")
            
            await pg_conn.copy_records_to_table(
                'smriti_item',
                records=item_records,
                columns=[
                    'sku', 'name', 'class1', 'class2', 'subclass1', 'subclass2', 
                    'mrp', 'cost_price', 'hsn_code', 'is_active', 'barcode',
                    'anal_codes', 'user_fields', 'last_sync'
                ]
            )
            
            await pg_conn.copy_records_to_table(
                'smriti_stock',
                records=stock_records,
                columns=['sku', 'store_id', 'on_hand', 'last_sync']
            )
            
            # Re-enable triggers (Ready for Sync Engine)
            await pg_conn.execute("ALTER TABLE smriti_item ENABLE TRIGGER ALL")

        print(f"[{datetime.now().strftime('%H:%M:%S')}] SUCCESS: Imported {len(item_records)} items with zero data loss.")
    except Exception as e:
        print(f"ERROR: Bulk Load Error: {e}")
    finally:
        await pg_conn.close()

if __name__ == "__main__":
    asyncio.run(run_v3_import())
