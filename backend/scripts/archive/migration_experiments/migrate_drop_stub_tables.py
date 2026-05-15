"""
SMRITI-OS Migration: Drop Legacy Stub Tables
=============================================
Drops all public-schema tables that are:
1. Empty and have FK -> items.id (replaced by shoper9.itemmaster)
2. Empty feature tables replaced by shoper9.stktrnhdr/dtls
3. Empty s9sys_* system tables that belong to shoper9 schema

Safe to run multiple times (uses IF EXISTS).
Protocol: SMRITI-OS DB Sovereign Protocol v1.0
"""

import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv()

# Tables to drop in dependency order (children first, then parents)
DROP_ORDER = [
    # --- Step 1: FK dependents on items ---
    "grn_items",
    "purchase_order_items",
    "sales_slip_items",
    "inventory_audit_items",
    "stock_ledger",
    "stock_transaction_items",
    "stock_audit_ledger",
    "stock_balance_summary",
    "warehouse_item_extensions",
    "warehouse_physical_stock_taking",
    "item_price_levels",
    "item_barcodes",
    # --- Step 2: Parent stub tables ---
    "item_stock",
    "items",
    # --- Step 3: Now-redundant transaction tables ---
    "sales_slips",
    "stock_transactions",
    # --- Step 4: PO/GRN tables (shoper9 is source of truth) ---
    "purchase_orders",
    "grns",
    # --- Step 5: Empty feature tables ---
    "tally_configs",
    "tally_export_logs",
    "tally_ledger_maps",
    "size_groups",
    "seasons",
    "saved_reports",
    "store_traffic",
    "store_operation_logs",
    "sync_packets",
    "ui_field_configs",
    "tax_masters",
    "tax_rules",
    "till_hardware",
    "schemes",
    "segment_results",
    "system_settings",
]

# s9sys_* tables (Shoper9 internal system tables incorrectly in public schema)
S9SYS_TABLES = [
    "s9sys_siscolumninfo",
    "s9sys_siscolumninfosuper",
    "s9sys_sisdbobjectinfo",
    "s9sys_sisfkinfo",
    "s9sys_sisfunctionsinfo",
    "s9sys_siskeyinfo",
    "s9sys_sislookup",
    "s9sys_sisquerylookup",
    "s9sys_sisqueryparam",
    "s9sys_sissysparam",
    "s9sys_sistableinfo",
    "s9sys_sistablerelation",
    "s9sys_sistablerelationdetails",
    "s9sys_sistasklist",
    "s9sys_sistasklisthistory",
    "s9sys_sistransactioninfo",
    "s9sys_sistransactiontemplatesinfo",
    "s9sys_siswrapper",
    "s9sys_tmpchkfordbconsistencytab",
    "s9sys_tmpshortcuttablesuper",
    "s9sys_trace_xe_action_map",
    "s9sys_trace_xe_event_map",
    "s9sys_vacompany",
    "s9sys_vacompwisemnuopt",
    "s9sys_vacompwiseuserpriority",
    "s9sys_vacontexthelpdtls",
    "s9sys_vadeviceids",
    "s9sys_vagenlookup",
    "s9sys_vagroup",
    "s9sys_vagrouprestrict",
    "s9sys_vagroupwiseuserlist",
    "s9sys_valoghistory",
    "s9sys_vamenu",
    "s9sys_vamenushortcut",
    "s9sys_vanode",
    "s9sys_vanodedtls",
    "s9sys_vanodeextd",
    "s9sys_vanoderestrict",
    "s9sys_vapasswordhistory",
    "s9sys_vapatchdtls",
    "s9sys_varestrictinfo",
    "s9sys_varestrictmnu",
    "s9sys_varestrictmnuconfig",
    "s9sys_vasecurityconfig",
    "s9sys_vauser",
    "s9sys_vauserextdinfo",
    "s9sys_vausg",
    "s9sys_vavertable",
]

async def migrate():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    print("SMRITI-OS: Dropping legacy stub tables...")
    print("=" * 60)
    
    dropped = 0
    skipped = 0
    
    all_tables = DROP_ORDER + S9SYS_TABLES
    
    for table in all_tables:
        # Check if table exists
        exists = await conn.fetchval("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = $1
            )
        """, table)
        
        if not exists:
            print(f"  SKIP (not found): {table}")
            skipped += 1
            continue
        
        # Check row count before dropping
        cnt = await conn.fetchval(f'SELECT count(*) FROM public."{table}"')
        if cnt and cnt > 0:
            print(f"  SKIP (has {cnt} rows): {table} -- MANUAL REVIEW REQUIRED")
            skipped += 1
            continue
        
        try:
            await conn.execute(f'DROP TABLE IF EXISTS public."{table}" CASCADE')
            print(f"  DROPPED: {table}")
            dropped += 1
        except Exception as e:
            print(f"  ERROR dropping {table}: {e}")
            skipped += 1
    
    print("=" * 60)
    print(f"Done. Dropped: {dropped} | Skipped: {skipped}")
    
    await conn.close()

if __name__ == '__main__':
    asyncio.run(migrate())
