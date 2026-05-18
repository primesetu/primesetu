"""
SMRITI-OS - Shoper9 vs PostgreSQL PK Comparison & Migration
============================================================
1. Fetches ALL table PKs from AITDL SHOPER9X01 (MSSQL)
2. Fetches ALL table PKs from SMRITI PostgreSQL s9 schema
3. Compares them - finds mismatches
4. Generates migration SQL to align SMRITI PKs with Shoper9
   (keeping tenant_id in PK as SMRITI enhancement)
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import pyodbc
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

AITDL_CONN = 'DRIVER={SQL Server};SERVER=AITDL;DATABASE=SHOPER9X01;UID=sa;PWD=netmanthan@123;'
PG_URL     = 'postgresql+asyncpg://postgres:MSba108682%21%40@127.0.0.1:5434/smriti_local'
SCHEMA     = 's9'
OUT_SQL    = 'scratch/migration_shoper9_pk_parity.sql'

# ── STEP 1: Get Shoper9 PKs from MSSQL ────────────────────────────────────────
def get_shoper9_pks():
    print("\n[MSSQL] Connecting to AITDL SHOPER9X01...")
    try:
        conn = pyodbc.connect(AITDL_CONN, timeout=8)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                tc.TABLE_NAME,
                kcu.COLUMN_NAME,
                kcu.ORDINAL_POSITION
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
                ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
            WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
              AND tc.TABLE_SCHEMA    = 'dbo'
            ORDER BY tc.TABLE_NAME, kcu.ORDINAL_POSITION
        """)
        rows = cursor.fetchall()
        conn.close()

        # Group by table
        pks = {}
        for table, col, pos in rows:
            table_lower = table.lower()
            if table_lower not in pks:
                pks[table_lower] = []
            pks[table_lower].append(col.lower())

        print(f"[MSSQL] Found PKs for {len(pks)} tables")
        return pks
    except Exception as e:
        print(f"[ERROR] MSSQL connection failed: {e}")
        return {}

# ── STEP 2: Get SMRITI PostgreSQL PKs ─────────────────────────────────────────
async def get_pg_pks(conn):
    r = await conn.execute(text(f"""
        SELECT
            tc.table_name,
            kcu.column_name,
            kcu.ordinal_position
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
           AND tc.table_schema    = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema    = '{SCHEMA}'
        ORDER BY tc.table_name, kcu.ordinal_position
    """))
    rows = r.fetchall()

    pks = {}
    for table, col, pos in rows:
        if table not in pks:
            pks[table] = []
        pks[table].append(col)
    print(f"[PGSQL] Found PKs for {len(pks)} tables")
    return pks


async def main():
    # ── Get data ──────────────────────────────────────────────────────────────
    s9_pks = get_shoper9_pks()

    engine = create_async_engine(PG_URL)
    async with engine.connect() as conn:
        pg_pks = await get_pg_pks(conn)

        # ── Compare ───────────────────────────────────────────────────────────
        print(f"\n{'='*65}")
        print(f"  COMPARISON: Shoper9 PKs vs SMRITI PKs")
        print(f"{'='*65}")

        perfect_match  = []   # Shoper9 cols match (tenant_id extra in PG is OK)
        pk_col_mismatch = []  # PK columns differ (not just tenant_id)
        only_in_s9     = []   # In Shoper9 but not in SMRITI
        only_in_pg     = []   # In SMRITI but not in Shoper9

        for table, s9_cols in sorted(s9_pks.items()):
            if table in pg_pks:
                pg_cols = pg_pks[table]
                # Remove tenant_id from pg for comparison
                pg_core = [c for c in pg_cols if c != 'tenant_id']
                if pg_core == s9_cols:
                    perfect_match.append(table)
                else:
                    pk_col_mismatch.append((table, s9_cols, pg_cols))
            else:
                only_in_s9.append((table, s9_cols))

        for table in pg_pks:
            if table not in s9_pks:
                only_in_pg.append((table, pg_pks[table]))

        print(f"\n  [OK]  Perfect match (Shoper9 PK = SMRITI core PK): {len(perfect_match)}")
        print(f"  [!!]  PK COLUMN MISMATCH (need to fix):             {len(pk_col_mismatch)}")
        print(f"  [S9]  In Shoper9 only (no PG table):                {len(only_in_s9)}")
        print(f"  [PG]  In SMRITI only (SMRITI-added tables):         {len(only_in_pg)}")

        if pk_col_mismatch:
            print(f"\n  Tables where PK columns DIFFER from Shoper9:")
            print(f"  {'Table':<35} {'Shoper9 PK':<35} {'SMRITI PK (current)'}")
            print(f"  {'-'*35} {'-'*35} {'-'*35}")
            for table, s9, pg in pk_col_mismatch:
                print(f"  {table:<35} {str(s9):<35} {str(pg)}")

        # ── Generate migration SQL ─────────────────────────────────────────────
        sql_lines = []
        sql_lines.append("-- SMRITI-OS: Shoper9 PK Parity Migration")
        sql_lines.append(f"-- Aligns SMRITI PKs with Shoper9 SHOPER9X01 tested structure")
        sql_lines.append(f"-- tenant_id is ALWAYS appended at end (SMRITI multi-tenant enhancement)")
        sql_lines.append(f"-- Tables to fix: {len(pk_col_mismatch)}")
        sql_lines.append(f"-- Run in psql or pgAdmin\n")

        if pk_col_mismatch:
            for table, s9_cols, current_pg_cols in pk_col_mismatch:
                # Get constraint name from DB
                r = await conn.execute(text(f"""
                    SELECT constraint_name
                    FROM information_schema.table_constraints
                    WHERE constraint_type = 'PRIMARY KEY'
                      AND table_schema    = '{SCHEMA}'
                      AND table_name      = '{table}'
                """))
                row = r.fetchone()
                cname = row[0] if row else f"{table}_pkey"

                new_pk_cols = s9_cols + ['tenant_id']
                new_pk_str  = ', '.join(new_pk_cols)

                sql_lines.append(f"-- {table}")
                sql_lines.append(f"--   Shoper9 PK:  {s9_cols}")
                sql_lines.append(f"--   Current PK:  {current_pg_cols}")
                sql_lines.append(f"--   New PK:      {new_pk_cols}")
                sql_lines.append(f"ALTER TABLE {SCHEMA}.{table} DROP CONSTRAINT {cname};")
                sql_lines.append(f"ALTER TABLE {SCHEMA}.{table} ADD CONSTRAINT {cname} PRIMARY KEY ({new_pk_str});")
                sql_lines.append("")
        else:
            sql_lines.append("-- No PK mismatches found. All tables already aligned with Shoper9!")

        sql_content = '\n'.join(sql_lines)
        with open(OUT_SQL, 'w', encoding='utf-8') as f:
            f.write(sql_content)

        print(f"\n[SQL] Migration saved to: {OUT_SQL}")

        # ── Auto-apply if mismatches exist ────────────────────────────────────
        if pk_col_mismatch:
            print(f"\n[APPLY] Applying {len(pk_col_mismatch)} PK corrections...")
            ok_count = 0
            fail_list = []

        # use autocommit engine for per-table transactions
    await engine.dispose()

    if pk_col_mismatch:
        engine2 = create_async_engine(PG_URL, isolation_level="AUTOCOMMIT")
        async with engine2.connect() as conn2:
            for table, s9_cols, current_pg_cols in pk_col_mismatch:
                r = await conn2.execute(text(f"""
                    SELECT constraint_name FROM information_schema.table_constraints
                    WHERE constraint_type='PRIMARY KEY' AND table_schema='{SCHEMA}' AND table_name='{table}'
                """))
                row = r.fetchone()
                cname = row[0] if row else f"{table}_pkey"
                new_pk_str = ', '.join(s9_cols + ['tenant_id'])

                try:
                    await conn2.execute(text("BEGIN"))
                    await conn2.execute(text(f"ALTER TABLE {SCHEMA}.{table} DROP CONSTRAINT {cname}"))
                    await conn2.execute(text(f"ALTER TABLE {SCHEMA}.{table} ADD CONSTRAINT {cname} PRIMARY KEY ({new_pk_str})"))
                    await conn2.execute(text("COMMIT"))
                    ok_count += 1
                    print(f"  [OK]   {table:<40} -> PK = ({new_pk_str})")
                except Exception as e:
                    await conn2.execute(text("ROLLBACK"))
                    fail_list.append((table, str(e)[:100]))
                    print(f"  [FAIL] {table}: {str(e)[:80]}")

        await engine2.dispose()

        print(f"\n{'='*65}")
        print(f"  DONE: {ok_count} fixed, {len(fail_list)} failed")
        if fail_list:
            for t, e in fail_list:
                print(f"  FAIL: {t} -> {e}")
    else:
        print(f"\n[DONE] No changes needed. All PKs already match Shoper9!")

asyncio.run(main())
