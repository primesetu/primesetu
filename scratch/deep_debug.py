import asyncio
from database import engine
from sqlalchemy import text

async def run_debug():
    print("=== PrimeSetu Deep Debug Console ===")
    
    # 1. Check Connectivity
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            print("[OK] Database Connection: OK")
    except Exception as e:
        print(f"[FAIL] Database Connection: FAILED ({e})")
        return

    # 2. Table Audit
    tables = ['stores', 'users', 'inventory', 'bills', 'bill_items', 'schemes', 'alerts']
    print("\n--- Table Audit ---")
    for t in tables:
        try:
            async with engine.connect() as conn:
                count = await conn.scalar(text(f"SELECT COUNT(*) FROM {t}"))
                print(f"[{t:12}] Records: {count}")
        except Exception as e:
            # Check if it's "relation does not exist"
            if "does not exist" in str(e):
                print(f"[{t:12}] MISSING TABLE")
            else:
                print(f"[{t:12}] Error: {str(e)[:100]}")

    # 3. Product Sample
    print("\n--- Product Sample (Inventory) ---")
    try:
        async with engine.connect() as conn:
            res = await conn.execute(text("SELECT sku, name, stock_qty FROM inventory LIMIT 3"))
            rows = res.all()
            if not rows:
                print("No products found in inventory.")
            for row in rows:
                print(f"SKU: {row[0]:10} | Name: {row[1]:20} | Stock: {row[2]}")
    except Exception as e:
        print(f"[ERROR] Inventory Sample: {e}")

    # 4. Auth & Session Context
    print("\n--- Auth & Store Context ---")
    try:
        async with engine.connect() as conn:
            res = await conn.execute(text("SELECT name, code FROM stores LIMIT 1"))
            store = res.first()
            if store:
                print(f"Active Store: {store[0]} ({store[1]})")
            
            res = await conn.execute(text("SELECT email, role FROM users LIMIT 5"))
            users = res.all()
            for u in users:
                print(f"User: {u[0]:25} | Role: {u[1]}")
    except Exception as e:
        print(f"[ERROR] Auth Sample: {e}")

if __name__ == "__main__":
    asyncio.run(run_debug())
