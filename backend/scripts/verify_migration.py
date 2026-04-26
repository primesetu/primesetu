import asyncio
import asyncpg
from app.core.config import settings

async def verify_all():
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(url)
    
    print("=" * 60)
    print("PRIMESETU - SHOPER 9 MIGRATION VERIFICATION REPORT")
    print("=" * 60)
    
    # 1. Identity Verification
    stores = await conn.fetch("SELECT id, name, code FROM stores")
    print(f"\n[1] STORES ({len(stores)}):")
    for s in stores:
        print(f"  - {s['name']} (ID: {s['id']}, Code: {s['code']})")
        
    users = await conn.fetch("SELECT email, full_name, role FROM users")
    print(f"\n[2] USERS ({len(users)}):")
    for u in users:
        print(f"  - {u['full_name']} ({u['email']}) - Role: {u['role']}")
        
    # 2. Inventory Verification
    item_count = await conn.fetchval("SELECT count(*) FROM items")
    stock_count = await conn.fetchval("SELECT count(*) FROM item_stock")
    total_qty = await conn.fetchval("SELECT sum(qty_on_hand) FROM item_stock")
    print(f"\n[3] INVENTORY:")
    print(f"  - Total Items Migrated: {item_count}")
    print(f"  - Stock Records: {stock_count}")
    print(f"  - Total Stock Quantity: {total_qty}")
    
    # Sample check for items without stock
    no_stock = await conn.fetchval("SELECT count(*) FROM items WHERE id NOT IN (SELECT item_id FROM item_stock)")
    print(f"  - Items without Stock Records: {no_stock}")
    
    # 3. Sales Verification
    txn_count = await conn.fetchval("SELECT count(*) FROM transactions")
    txn_item_count = await conn.fetchval("SELECT count(*) FROM transaction_items")
    total_sales_paise = await conn.fetchval("SELECT sum(net_payable) FROM transactions")
    print(f"\n[4] SALES HISTORY:")
    print(f"  - Total Bills Migrated: {txn_count}")
    print(f"  - Total Line Items: {txn_item_count}")
    print(f"  - Total Sales Value: Rs. {total_sales_paise/100 if total_sales_paise else 0:,.2f}")
    
    # 4. Integrity Checks
    # Check for orphaned transaction items
    orphaned_items = await conn.fetchval("SELECT count(*) FROM transaction_items WHERE product_id NOT IN (SELECT id FROM items)")
    print(f"\n[5] INTEGRITY CHECKS:")
    print(f"  - Orphaned Sales Items (No Product Match): {orphaned_items}")
    
    # Check for transactions without store_id match
    invalid_stores = await conn.fetchval("SELECT count(*) FROM transactions WHERE store_id NOT IN (SELECT id FROM stores)")
    print(f"  - Transactions with Invalid Store ID: {invalid_stores}")
    
    print("\n" + "=" * 60)
    print("VERIFICATION COMPLETE")
    print("=" * 60)
    
    await conn.close()

if __name__ == "__main__":
    asyncio.run(verify_all())
