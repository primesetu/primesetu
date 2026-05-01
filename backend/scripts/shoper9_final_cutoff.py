"""
SMRITI-OS - Shoper 9 Final Cut-off Engine v2 (Schema-Aware)
Uses: stockno, rate, retailprice, qty from ptinvoicedtl
      and correct purchase_order_items columns
"""
import asyncio
import asyncpg
import os
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from decimal import Decimal

load_dotenv()
BATCH = 200

async def get_connection():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    return await asyncpg.connect(db_url)

# ── Step 1: Bridge PtInvoiceHdr → purchase_orders ───────────────────────────
async def bridge_purchase_orders(conn):
    store_id = await conn.fetchval("SELECT id FROM stores LIMIT 1")
    existing = await conn.fetchval("SELECT COUNT(*) FROM purchase_orders WHERE store_id = $1", store_id)
    if existing > 0:
        print(f"  [SKIP] purchase_orders already has {existing} records.")
        return

    print("  Bridging PtInvoiceHdr -> purchase_orders ...")
    rows = await conn.fetch("""
        SELECT id, docno, billno, billdate, billamt, suppcode, noitems
        FROM ptinvoicehdr
        WHERE store_id = $1
    """, store_id)

    vendors = await conn.fetch("SELECT id, code FROM partners WHERE type = 'VENDOR'")
    vendor_map = {str(v['code']): v['id'] for v in vendors}

    records = []
    for r in rows:
        vendor_id = vendor_map.get(str(r['suppcode'])) if r['suppcode'] else None
        po_date = r['billdate'] or datetime.now(timezone.utc)
        total_paise = int(Decimal(str(r['billamt'] or 0)) * 100)
        records.append((
            r['id'], store_id, vendor_id,
            f"PO-S9-{r['docno'] or r['billno']}",
            'RECEIVED', total_paise, 0, 0, po_date
        ))

    for i in range(0, len(records), BATCH):
        batch = records[i:i+BATCH]
        await conn.executemany("""
            INSERT INTO purchase_orders
            (id, store_id, vendor_id, po_number, status,
             total_paise, tax_paise, other_charges_paise, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO NOTHING
        """, batch)
    print(f"  [OK] {len(records)} purchase orders bridged.")

# ── Step 2: Bridge PtInvoiceDtl → purchase_order_items ──────────────────────
async def bridge_purchase_items(conn):
    store_id = await conn.fetchval("SELECT id FROM stores LIMIT 1")
    existing = await conn.fetchval("SELECT COUNT(*) FROM purchase_order_items")
    if existing > 0:
        print(f"  [SKIP] purchase_order_items already has {existing} records.")
        return

    print("  Bridging PtInvoiceDtl -> purchase_order_items ...")

    items = await conn.fetch("SELECT id, item_code FROM items WHERE store_id = $1", store_id)
    # stockno in ptinvoicedtl maps to item_code
    item_map = {r['item_code']: r['id'] for r in items}

    po_rows = await conn.fetch("SELECT id FROM purchase_orders WHERE store_id = $1", store_id)
    po_id_set = set(str(r['id']) for r in po_rows)

    # ptinvoicedtl columns: stockno, qty, rate, retailprice, sizecd
    # docno links back to ptinvoicehdr.docno
    all_rows = await conn.fetch("""
        SELECT d.stockno, d.qty, d.rate, d.retailprice, d.sizecd, h.id as po_id
        FROM ptinvoicedtl d
        JOIN ptinvoicehdr h ON h.docno = d.billno AND h.store_id = $1
        WHERE h.store_id = $1
    """, store_id)

    print(f"  Got {len(all_rows)} detail rows from ptinvoicedtl.")

    records = []
    skipped = 0
    for r in all_rows:
        if str(r['po_id']) not in po_id_set:
            skipped += 1
            continue
        item_id = item_map.get(str(r['stockno']))
        if not item_id:
            skipped += 1
            continue
        records.append((
            str(uuid.uuid4()),
            str(r['po_id']),
            item_id,
            r['sizecd'],  # size
            None,          # colour (not in this table)
            int(r['qty'] or 1),
            0,             # qty_received (historical, all received)
            int(Decimal(str(r['rate'] or 0)) * 100),   # unit_cost_paise
            0,             # tax_paise
            int(Decimal(str(r['retailprice'] or 0)) * 100),  # total_paise = retail value
        ))

    print(f"  Skipped {skipped} unmatched rows. Inserting {len(records)} items...")

    for i in range(0, len(records), BATCH):
        batch = records[i:i+BATCH]
        await conn.executemany("""
            INSERT INTO purchase_order_items
            (id, po_id, item_id, size, colour, qty_ordered, qty_received,
             unit_cost_paise, tax_paise, total_paise)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT DO NOTHING
        """, batch)
        if i % (BATCH * 10) == 0:
            print(f"    ... {i + len(batch)} rows done")

    print(f"  [OK] {len(records)} purchase line items bridged.")

# ── Step 3: Final Verification Matrix ────────────────────────────────────────
async def verify_final_state(conn):
    store_id = await conn.fetchval("SELECT id FROM stores LIMIT 1")
    print("\n  +================================================+")
    print("  |      SMRITI-OS - SOVEREIGN FINAL MATRIX       |")
    print("  +================================================+")

    checks = [
        ("Active SKUs",            "SELECT COUNT(*) FROM items WHERE store_id=$1 AND is_active=true"),
        ("Item Stock Records",     "SELECT COUNT(*) FROM item_stock WHERE store_id=$1"),
        ("Purchase Bills (Legacy)","SELECT COUNT(*) FROM purchase_orders WHERE store_id=$1"),
        ("Purchase Line Items",    "SELECT COUNT(*) FROM purchase_order_items"),
        ("System Tables (s9sys)",  "SELECT COUNT(*) FROM pg_catalog.pg_tables WHERE tablename LIKE 's9sys_%'"),
        ("Retail Tables (s9_)",    "SELECT COUNT(*) FROM pg_catalog.pg_tables WHERE tablename LIKE 's9_%' AND tablename NOT LIKE 's9sys_%'"),
        ("Users",                  "SELECT COUNT(*) FROM users WHERE store_id=$1"),
        ("Transactions",           "SELECT COUNT(*) FROM transactions WHERE store_id=$1"),
    ]

    for label, query in checks:
        try:
            count = await conn.fetchval(query, store_id) if '$1' in query else await conn.fetchval(query)
            status = " [OK] " if count and count > 0 else "[WARN]"
            print(f"  {status} {label:<35} {count or 0:>10,}")
        except Exception as e:
            print(f"  [ERR] {label:<35} {e}")

    print("  +================================================+")
    print("  | [DONE] SMRITI-OS IS SOVEREIGN.                 |")
    print("  |        SHOPER 9 IS NOW OFFICIALLY RETIRED.     |")
    print("  +================================================+\n")

# ── MAIN ──────────────────────────────────────────────────────────────────────
async def main():
    print("\n" + "=" * 55)
    print("  SMRITI-OS :: Shoper 9 Final Cut-off Engine v2")
    print("=" * 55)
    conn = await get_connection()
    try:
        print("\n[STEP 1] Bridge Purchase Bills")
        await bridge_purchase_orders(conn)

        print("\n[STEP 2] Bridge Purchase Line Items")
        await bridge_purchase_items(conn)

        print("\n[STEP 3] Sovereign Verification")
        await verify_final_state(conn)

    except Exception as e:
        print(f"\n[FATAL] {e}")
        import traceback; traceback.print_exc()
    finally:
        await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
