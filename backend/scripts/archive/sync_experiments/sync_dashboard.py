import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def sync_dashboard():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    store_id = await conn.fetchval("SELECT id FROM stores LIMIT 1")
    
    print("Sovereign Dashboard Sync initiated...")
    
    # 1. Update SKU Count
    sku_count = await conn.fetchval("SELECT count(*) FROM items WHERE store_id = $1 AND is_active = true", store_id)
    print(f"Active SKUs: {sku_count}")
    
    # 2. Update Low Stock Alerts
    low_stock = await conn.fetchval("SELECT count(*) FROM item_stock WHERE store_id = $1 AND qty_on_hand < reorder_level", store_id)
    print(f"Low Stock Alerts: {low_stock}")
    
    # 3. Import Legacy Invoices into Transactions
    print("Mapping legacy invoices to transactions...")
    invoices = await conn.fetch("SELECT invno, invdt, netamt, vauid FROM ptinvoicehdr LIMIT 100") # Limit for now
    
    # Check if they are already bridged
    tx_count = await conn.fetchval("SELECT count(*) FROM transactions WHERE store_id = $1", store_id)
    
    if tx_count == 0:
        tx_records = []
        import uuid
        for inv in invoices:
            tx_records.append((
                str(uuid.uuid4()),
                store_id,
                f"LEGACY-{inv['invno']}",
                inv['netamt'] * 100, # convert to paise
                'Cash', # Default paymode
                'Finalized',
                inv['invdt']
            ))
            
        await conn.executemany("""
            INSERT INTO public.transactions (id, store_id, bill_no, net_payable, payment_mode, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """, tx_records)
        print(f"Successfully bridged {len(tx_records)} legacy transactions.")
    else:
        print("Transactions already bridged.")

    await conn.close()

if __name__ == '__main__':
    asyncio.run(sync_dashboard())
