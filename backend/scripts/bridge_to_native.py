import asyncio
import asyncpg
import os
import uuid
from decimal import Decimal
from dotenv import load_dotenv

load_dotenv()

async def bridge_data():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    store_id = await conn.fetchval("SELECT id FROM stores LIMIT 1")
    if not store_id:
        print("Error: No store found.")
        return

    print(f"Bridging Legacy Data to SMRITI-OS Native Models for Store: {store_id}")

    # 1. Ensure Default Department exists
    dept_id = await conn.fetchval("SELECT id FROM departments WHERE code = 'GEN' LIMIT 1")
    if not dept_id:
        dept_id = str(uuid.uuid4())
        await conn.execute("""
            INSERT INTO public.departments (id, store_id, name, code, level)
            VALUES ($1, $2, 'General', 'GEN', 1)
        """, dept_id, store_id)
    else:
        dept_id = str(dept_id)

    # 2. Clear Native Tables
    print("Cleaning native tables...")
    await conn.execute("TRUNCATE public.item_stock CASCADE")
    await conn.execute("TRUNCATE public.item_price_levels CASCADE")
    await conn.execute("TRUNCATE public.items CASCADE")

    # 3. Bridge Items
    print("Mapping itemmaster -> items...")
    legacy_items = await conn.fetch("SELECT stockno, itemdesc, retail_price, vauid FROM public.itemmaster")
    
    native_records = []
    for item in legacy_items:
        mrp_paise = int(Decimal(str(item['retail_price'] or 0)) * 100)
        rec_id = None
        vauid_raw = str(item['vauid'] or "")
        if vauid_raw.isdigit(): rec_id = int(vauid_raw)

        native_records.append((
            str(uuid.uuid4()), store_id, item['stockno'], str(item['itemdesc'] or "Unknown")[:40],
            'Pcs', dept_id, mrp_paise, mrp_paise, 18, '0000', True, rec_id
        ))

    await conn.executemany("""
        INSERT INTO public.items (id, store_id, item_code, item_name, uom, department_id, mrp_paise, cost_paise, gst_rate, hsn_code, is_active, shoper_recid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    """, native_records)
    print(f"Successfully bridged {len(native_records)} items.")

    # 4. Bridge Stock
    print("Mapping stockmaster -> item_stock...")
    item_map = {r['item_code']: r['id'] for r in await conn.fetch("SELECT item_code, id FROM public.items")}
    legacy_stock = await conn.fetch("SELECT stockno, curbalqty FROM public.stockmaster")
    
    stock_records = []
    for s in legacy_stock:
        item_id = item_map.get(s['stockno'])
        if item_id:
            stock_records.append((
                str(uuid.uuid4()), store_id, str(item_id), 'None', 'None', 
                int(float(s['curbalqty'] or 0)), 0, 10 # reorder_level
            ))

    await conn.executemany("""
        INSERT INTO public.item_stock (id, store_id, item_id, size, colour, qty_on_hand, qty_reserved, reorder_level)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    """, stock_records)
    print(f"Successfully bridged {len(stock_records)} stock records.")

    await conn.close()

if __name__ == '__main__':
    asyncio.run(bridge_data())
