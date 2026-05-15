"""
SMRITI-OS - Complete Migration Audit
Compares: MSSQL (Shoper9) vs PostgreSQL (SMRITI-OS)
"""
import asyncio
import asyncpg
import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

MSSQL_CONN = "DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;"
MSSQL_SYS  = "DRIVER={SQL Server};SERVER=.;DATABASE=tspsysdb9;Trusted_Connection=yes;"

async def run():
    # ── Connect Postgres ──────────────────────────────────────────────────────
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg = await asyncpg.connect(db_url)
    store_id = await pg.fetchval("SELECT id FROM stores LIMIT 1")

    # ── Get all PG tables ─────────────────────────────────────────────────────
    pg_tables = await pg.fetch(
        "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    )
    pg_table_set = set(t['tablename'] for t in pg_tables)

    # ── Connect MSSQL (Retail DB) ─────────────────────────────────────────────
    mssql = pyodbc.connect(MSSQL_CONN)
    cur = mssql.cursor()
    cur.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME")
    mssql_retail_tables = [t[0].lower() for t in cur.fetchall()]

    # ── Connect MSSQL (System DB) ─────────────────────────────────────────────
    mssql_sys = pyodbc.connect(MSSQL_SYS)
    cur_sys = mssql_sys.cursor()
    cur_sys.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME")
    mssql_sys_tables = [t[0].lower() for t in cur_sys.fetchall()]

    print("\n" + "=" * 65)
    print("  SMRITI-OS :: COMPLETE MIGRATION AUDIT REPORT")
    print("=" * 65)

    # ── Section 1: MSSQL Retail tables ───────────────────────────────────────
    print(f"\n[RETAIL DB] SHOPER9WH1 :: {len(mssql_retail_tables)} tables in MSSQL")
    print("-" * 65)
    print(f"  {'TABLE NAME':<35} {'MSSQL ROWS':>10}  {'PG STATUS':>15}")
    print("-" * 65)

    retail_in_pg = 0
    retail_not_in_pg = []

    for tbl in mssql_retail_tables:
        cur.execute(f"SELECT COUNT(*) FROM [{tbl}]")
        mssql_count = cur.fetchone()[0]

        # Check if table is in PG (direct name or with prefix)
        in_pg = tbl in pg_table_set
        if in_pg:
            pg_count = await pg.fetchval(f'SELECT COUNT(*) FROM "{tbl}"')
            status = f"MIGRATED ({pg_count:,})"
            retail_in_pg += 1
        else:
            status = "NOT IN PG"
            retail_not_in_pg.append((tbl, mssql_count))

        marker = "  " if in_pg else "!!"
        print(f"  {marker} {tbl:<35} {mssql_count:>10,}  {status:>15}")

    # ── Section 2: MSSQL System tables ────────────────────────────────────────
    print(f"\n[SYSTEM DB] tspsysdb9 :: {len(mssql_sys_tables)} tables in MSSQL")
    print("-" * 65)
    print(f"  {'TABLE NAME':<35} {'MSSQL ROWS':>10}  {'PG STATUS':>15}")
    print("-" * 65)

    sys_in_pg = 0
    sys_not_in_pg = []

    for tbl in mssql_sys_tables:
        cur_sys.execute(f"SELECT COUNT(*) FROM [{tbl}]")
        mssql_count = cur_sys.fetchone()[0]

        pg_name = f"s9sys_{tbl}"
        in_pg = pg_name in pg_table_set
        if in_pg:
            pg_count = await pg.fetchval(f'SELECT COUNT(*) FROM "{pg_name}"')
            status = f"MIGRATED ({pg_count:,})"
            sys_in_pg += 1
        else:
            status = "NOT IN PG"
            sys_not_in_pg.append((tbl, mssql_count))

        marker = "  " if in_pg else "!!"
        print(f"  {marker} {tbl:<35} {mssql_count:>10,}  {status:>15}")

    # ── Section 3: Summary ────────────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("  MIGRATION SUMMARY")
    print("=" * 65)
    print(f"  Retail DB  : {retail_in_pg}/{len(mssql_retail_tables)} tables in PostgreSQL")
    print(f"  System DB  : {sys_in_pg}/{len(mssql_sys_tables)} tables in PostgreSQL")

    # Key data counts
    print(f"\n  [KEY DATA COUNTS IN SMRITI-OS]")
    key_checks = [
        ("Items (SKUs)",       "SELECT COUNT(*) FROM items WHERE store_id = $1"),
        ("Item Stock",         "SELECT COUNT(*) FROM item_stock WHERE store_id = $1"),
        ("Purchase Bills",     "SELECT COUNT(*) FROM ptinvoicehdr WHERE store_id = $1"),
        ("Purchase Lines",     "SELECT COUNT(*) FROM ptinvoicedtl WHERE store_id = $1"),
        ("Partners",           "SELECT COUNT(*) FROM partners"),
        ("Transactions",       "SELECT COUNT(*) FROM transactions WHERE store_id = $1"),
        ("System Users",       "SELECT COUNT(*) FROM s9sys_vauser"),
        ("System Config",      "SELECT COUNT(*) FROM s9sys_vasecurityconfig"),
        ("Report Configs",     "SELECT COUNT(*) FROM s9sys_reportconfigs"),
    ]
    for label, q in key_checks:
        try:
            count = await pg.fetchval(q, store_id) if '$1' in q else await pg.fetchval(q)
            print(f"    {label:<30} {count or 0:>10,}")
        except Exception as e:
            print(f"    {label:<30} ERROR: {e}")

    if retail_not_in_pg:
        print(f"\n  [TABLES NOT YET IN POSTGRES - Retail]")
        for tbl, cnt in sorted(retail_not_in_pg, key=lambda x: -x[1])[:20]:
            print(f"    !! {tbl:<35} {cnt:>8,} rows")

    if sys_not_in_pg:
        print(f"\n  [TABLES NOT YET IN POSTGRES - System]")
        for tbl, cnt in sorted(sys_not_in_pg, key=lambda x: -x[1])[:10]:
            print(f"    !! {tbl:<35} {cnt:>8,} rows")

    print("\n" + "=" * 65)
    await pg.close()
    mssql.close()
    mssql_sys.close()

if __name__ == '__main__':
    asyncio.run(run())
