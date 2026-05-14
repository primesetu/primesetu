import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def mini_audit():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg = await asyncpg.connect(db_url)
    
    store_id = await pg.fetchval("SELECT id FROM stores LIMIT 1")
    print(f"Auditing for Store ID: {store_id}")
    
    key_checks = [
        ("Items (SKUs)",       "SELECT COUNT(*) FROM items WHERE store_id = $1"),
        ("Item Stock",         "SELECT COUNT(*) FROM item_stock WHERE store_id = $1"),
        ("Purchase Bills",     "SELECT COUNT(*) FROM ptinvoicehdr WHERE store_id = $1"),
        ("Purchase Lines",     "SELECT COUNT(*) FROM ptinvoicedtl WHERE store_id = $1"),
        ("Vendors (Partners)", "SELECT COUNT(*) FROM s9_vendors WHERE store_id = $1"),
        ("System Config",      "SELECT COUNT(*) FROM s9sys_vasecurityconfig"),
        ("System Params",      "SELECT COUNT(*) FROM sysparam WHERE store_id = $1"),
    ]
    
    print(f"\n{'ENTITY':<25} {'COUNT':>10}")
    print("-" * 35)
    
    for label, q in key_checks:
        try:
            count = await pg.fetchval(q, store_id) if '$1' in q else await pg.fetchval(q)
            print(f"{label:<25} {count or 0:>10,}")
        except Exception as e:
            print(f"{label:<25} ERROR: {e}")
            
    await pg.close()

if __name__ == "__main__":
    asyncio.run(mini_audit())
