import asyncio
import httpx
from database import engine
from sqlalchemy import text

async def debug_billing():
    print("=== PrimeSetu Billing Deep Debug ===")
    BASE_URL = "http://localhost:8000/api/v1"

    # 1. Start Backend if not running (assumed running for this test)
    # 2. Get a test product
    print("\n[1/4] Fetching test product...")
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT id, sku, name, stock_qty, mrp FROM inventory WHERE stock_qty > 0 LIMIT 1"))
        product = res.first()
        if not product:
            print("[FAIL] No stock available for testing.")
            return
        
        p_id, p_sku, p_name, p_qty, p_mrp = product
        print(f"Target: {p_name} ({p_sku}) | Current Stock: {p_qty} | Price: {p_mrp}")

    # 3. Simulate POST /bills
    print("\n[2/4] Simulating Bill Creation (POST /api/v1/bills)...")
    test_qty = 2
    payload = {
        "customer_name": "Debug Tester",
        "items": [
            {"product_id": p_id, "qty": test_qty, "unit_price": p_mrp}
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(f"{BASE_URL}/bills", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                bill_no = data["bill_number"]
                print(f"[OK] Bill Created: {bill_no} | Total: {data['total']}")
            else:
                print(f"[FAIL] HTTP {resp.status_code}: {resp.text}")
                return
        except Exception as e:
            print(f"[FAIL] Connection Error: {e}")
            return

    # 4. Verify Inventory Deduction
    print("\n[3/4] Verifying Atomic Inventory Deduction...")
    async with engine.connect() as conn:
        res = await conn.execute(text(f"SELECT stock_qty FROM inventory WHERE id = {p_id}"))
        new_qty = res.scalar()
        expected_qty = p_qty - test_qty
        if new_qty == expected_qty:
            print(f"[OK] Stock correctly reduced: {p_qty} -> {new_qty} (Diff: {test_qty})")
        else:
            print(f"[FAIL] Stock Mismatch! Found: {new_qty}, Expected: {expected_qty}")

    # 5. Verify Bill Persistence
    print("\n[4/4] Verifying Bill Persistence & Items...")
    async with engine.connect() as conn:
        res = await conn.execute(text(f"SELECT id, total_amount FROM bills WHERE bill_number = '{bill_no}'"))
        bill_row = res.first()
        if bill_row:
            print(f"[OK] Bill record found in DB. Total: {bill_row[1]}")
            
            res = await conn.execute(text(f"SELECT qty, unit_price FROM bill_items WHERE bill_id = {bill_row[0]}"))
            items = res.all()
            if items and items[0][0] == test_qty:
                print(f"[OK] Bill Item correctly mapped: {items[0][0]} units @ {items[0][1]}")
            else:
                print("[FAIL] Bill Item missing or incorrect.")
        else:
            print("[FAIL] Bill record not found in DB.")

if __name__ == "__main__":
    asyncio.run(debug_billing())
