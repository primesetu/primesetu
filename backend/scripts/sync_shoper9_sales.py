import pyodbc
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.base import Transaction, TransactionItem, Item, Store
from sqlalchemy import select
from datetime import datetime
import uuid
from typing import Dict

# ============================================================
# PrimeSetu - Shoper 9 Sales History Sync Engine
# Phase 6: Bringing Sales Records into the Sovereign Cloud
# ============================================================

async def get_store_id() -> str:
    async with AsyncSessionLocal() as session:
        stmt = select(Store).limit(1)
        result = await session.execute(stmt)
        store = result.scalar_one()
        return store.id

async def get_item_map() -> Dict[str, uuid.UUID]:
    """Creates a map of Shoper 9 StockNo to PrimeSetu Item UUIDs."""
    async with AsyncSessionLocal() as session:
        print("Caching 40k items... (Please wait)")
        stmt = select(Item.id, Item.external_id)
        result = await session.execute(stmt)
        items = result.all()
        return {str(item.external_id).strip(): item.id for item in items}

def get_shoper9_sales(database="SHOPER9X01"):
    """Fetches sales headers and details from Shoper 9 StkTrn tables."""
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        # 1. Fetch Sales Headers from StkTrnHdr
        # TrnType 1300 = Sale
        query_hdr = """
            SELECT 
                TrnCtrlNo, 
                DocNo, 
                DocDt, 
                NetDocValue
            FROM StkTrnHdr
            WHERE TrnType = 1300
        """
        cursor.execute(query_hdr)
        headers = cursor.fetchall()
        
        sales_data = []
        for h in headers:
            # 2. Fetch Line Items for this sale from StkTrnDtls
            query_dtls = """
                SELECT 
                    StockNo, 
                    DocQty, 
                    DocEntRate, 
                    DocEntNetValue
                FROM StkTrnDtls
                WHERE TrnType = 1300 AND TrnCtrlNo = ?
            """
            cursor.execute(query_dtls, h.TrnCtrlNo)
            items = cursor.fetchall()
            
            sales_data.append({
                "ctrl_no": h.TrnCtrlNo,
                "doc_no": str(h.DocNo).strip(),
                "date": h.DocDt,
                "net_amt": h.NetDocValue,
                "items": items
            })
            
        conn.close()
        return sales_data
    except Exception as e:
        print(f"MSSQL Sales Error: {e}")
        return []

async def sync_sales():
    print("Starting Shoper 9 Sales Sync...")
    
    store_id = await get_store_id()
    item_map = await get_item_map()
    sales = get_shoper9_sales()
    
    if not sales:
        print("No sales records found in Shoper 9.")
        return

    async with AsyncSessionLocal() as session:
        sync_count = 0
        for sale in sales:
            doc_no_str = sale["doc_no"]
            
            # Check if transaction exists by external_id (DocNo)
            stmt = select(Transaction).where(Transaction.external_id == doc_no_str)
            result = await session.execute(stmt)
            existing_txn = result.scalar_one_or_none()
            
            if not existing_txn:
                total_paise = int(float(sale["net_amt"]) * 100) if sale["net_amt"] else 0
                
                new_txn = Transaction(
                    id=uuid.uuid4(),
                    store_id=store_id,
                    external_id=doc_no_str,
                    bill_no=doc_no_str,
                    type="Sales",
                    subtotal=total_paise,
                    net_payable=total_paise,
                    status="Finalized",
                    created_at=sale["date"]
                )
                session.add(new_txn)
                await session.flush() # Get the txn ID
                
                # Add Line Items
                for itm in sale["items"]:
                    stock_no_str = str(itm.StockNo).strip()
                    item_uuid = item_map.get(stock_no_str)
                    if not item_uuid:
                        continue 
                        
                    unit_paise = int(float(itm.DocEntRate) * 100) if itm.DocEntRate else 0
                    total_paise_item = int(float(itm.DocEntNetValue) * 100) if itm.DocEntNetValue else 0
                    
                    new_item = TransactionItem(
                        id=uuid.uuid4(),
                        transaction_id=new_txn.id,
                        product_id=item_uuid,
                        qty=float(itm.DocQty),
                        mrp=unit_paise,
                        net_amount=total_paise_item
                    )
                    session.add(new_item)
                
                sync_count += 1
                if sync_count % 50 == 0:
                    print(f"Synced {sync_count} bills...")
                    await session.commit()
            
        await session.commit()
        print(f"Sales Sync Complete. {sync_count} new bills migrated.")

if __name__ == "__main__":
    asyncio.run(sync_sales())
