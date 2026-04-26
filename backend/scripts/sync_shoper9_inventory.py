import pyodbc
import asyncio
import uuid
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.base import Item, ItemStock, Store, Department
from typing import Dict

# ============================================================
# PrimeSetu - Shoper 9 Inventory Sync Engine
# Phase 3: Moving Products & Stock into the Sovereign Cloud
# ============================================================

async def get_store_id() -> str:
    async with AsyncSessionLocal() as session:
        stmt = select(Store).limit(1)
        result = await session.execute(stmt)
        store = result.scalar_one()
        return store.id

async def get_department_map() -> Dict[str, uuid.UUID]:
    """Creates a map of Shoper 9 Dept Codes to PrimeSetu UUIDs."""
    async with AsyncSessionLocal() as session:
        stmt = select(Department)
        result = await session.execute(stmt)
        deps = result.scalars().all()
        return {dep.code: dep.id for dep in deps}

def get_shoper9_inventory(database="SHOPER9X01"):
    """Fetches items and their current balance from Shoper 9."""
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        # Joining ItemMaster with StockMaster for live quantity
        # Note: Shoper 9 stores prices as decimal, we convert to Paise
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

async def sync_inventory():
    print("Starting Shoper 9 Inventory Sync...")
    
    store_id = await get_store_id()
    dept_map = await get_department_map()
    shoper_items = get_shoper9_inventory()
    
    if not shoper_items:
        print("No inventory found in Shoper 9.")
        return

    async with AsyncSessionLocal() as session:
        for row in shoper_items:
            # Check if item exists by external_id (StockNo)
            stmt = select(Item).where(Item.external_id == row.StockNo)
            result = await session.execute(stmt)
            existing_item = result.scalar_one_or_none()
            
            # Map Department
            dept_id = dept_map.get(row.DeptCode)
            if not dept_id:
                # Fallback to a default department if not found
                continue

            mrp_paise = int(float(row.Retail_Price) * 100) if row.Retail_Price else 0

            if not existing_item:
                print(f"Adding New Item: {row.ItemDesc} ({row.StockNo})")
                new_item = Item(
                    store_id=store_id,
                    external_id=row.StockNo,
                    item_code=row.StockNo, # Using StockNo as ItemCode too
                    item_name=row.ItemDesc[:40],
                    department_id=dept_id,
                    mrp_paise=mrp_paise,
                    gst_rate=18, # Defaulting to 18%, can be refined later
                    hsn_code="9999", # Placeholder
                    is_active=True
                )
                session.add(new_item)
                await session.flush() # Get the new UUID
                item_id = new_item.id
            else:
                item_id = existing_item.id
                # Update MRP if changed
                existing_item.mrp_paise = mrp_paise

            # Update Stock level
            stmt_stock = select(ItemStock).where(ItemStock.item_id == item_id)
            res_stock = await session.execute(stmt_stock)
            stock_entry = res_stock.scalar_one_or_none()
            
            qty = int(row.Qty)
            if not stock_entry:
                new_stock = ItemStock(
                    item_id=item_id,
                    store_id=store_id,
                    size="NA", # Shoper 9 stores size in StockMaster usually, but keeping it simple
                    colour="NA",
                    qty_on_hand=qty
                )
                session.add(new_stock)
            else:
                stock_entry.qty_on_hand = qty
        
        await session.commit()
        print("Inventory Sync Complete. PrimeSetu is now live with Shoper 9 stock data.")

if __name__ == "__main__":
    asyncio.run(sync_inventory())
