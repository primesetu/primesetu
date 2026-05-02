import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# ============================================================
# SMRITI-OS - Inventory Purge Engine
# Purpose: Keep only SKUs with active stock (curbalqty > 0)
# ============================================================

load_dotenv()

async def purge_inventory():
    print("Starting Inventory Purge (Keeping only active stock)...")
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    
    try:
        conn = await asyncpg.connect(db_url)
        await conn.execute("SET search_path TO shoper9, public")
        
        # 1. Identify SKUs to keep (those with any positive balance)
        print("Identifying active SKUs...")
        active_skus = await conn.fetch("SELECT DISTINCT stockno FROM stockmaster WHERE curbalqty > 0")
        active_list = [r['stockno'] for r in active_skus]
        print(f"Found {len(active_list)} SKUs with active stock.")
        
        if not active_list:
            print("WARNING: No active stock found! Aborting purge to prevent data loss.")
            await conn.close()
            return

        async with conn.transaction():
            # 2. Delete from Stockmaster (Inactive records)
            print("Purging inactive records from Stockmaster...")
            delete_stock = await conn.execute("DELETE FROM stockmaster WHERE curbalqty <= 0")
            print(f"Removed from Stockmaster: {delete_stock}")
            
            # 3. Delete from Itemmaster (SKUs without any stock)
            print("Purging inactive SKUs from Itemmaster...")
            # We use a subquery to find stocknos that no longer exist in our (now cleaned) stockmaster
            delete_items = await conn.execute("""
                DELETE FROM itemmaster 
                WHERE stockno NOT IN (SELECT stockno FROM stockmaster)
            """)
            print(f"Removed from Itemmaster: {delete_items}")
            
            # 4. Optional: Clean up extended tables if they exist
            # (stockmasterextd, itemmasterextd, etc.)
            await conn.execute("DELETE FROM stockmasterextd WHERE stockno NOT IN (SELECT stockno FROM stockmaster)")
            
        # 5. Final Count
        new_item_count = await conn.fetchval("SELECT count(*) FROM itemmaster")
        print(f"Purge Complete. Remaining items in Itemmaster: {new_item_count}")
        
        await conn.close()
        
    except Exception as e:
        print(f"Purge Error: {e}")

if __name__ == '__main__':
    asyncio.run(purge_inventory())
