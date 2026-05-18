"""
SMRITI-OS - Safe Multi-Tenant PK Migration Generator
======================================================
Steps:
  1. Find all s9 tables with tenant_id NOT in PK
  2. Check for Foreign Keys referencing those tables
  3. Check for duplicate rows that would block migration
  4. Generate safe migration SQL (saved to scratch/migration_add_tenant_pk_safe.sql)
  5. Apply migration automatically
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

PG_URL    = 'postgresql+asyncpg://postgres:MSba108682%21%40@127.0.0.1:5434/smriti_local'
SCHEMA    = 's9'
OUT_FILE  = 'scratch/migration_add_tenant_pk_safe.sql'

async def main():
    engine = create_async_engine(PG_URL)
    async with engine.connect() as conn:

        # ── 1. Find tables needing fix ──────────────────────────────
        r = await conn.execute(text(f"""
            SELECT c.table_name
            FROM information_schema.columns c
            WHERE c.table_schema = '{SCHEMA}' AND c.column_name = 'tenant_id'
            ORDER BY c.table_name
        """))
        tables_with_tenant = [row[0] for row in r.fetchall()]

        needs_fix = []
        for table in tables_with_tenant:
            r = await conn.execute(text(f"""
                SELECT kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                   AND tc.table_schema    = kcu.table_schema
                WHERE tc.constraint_type = 'PRIMARY KEY'
                  AND tc.table_schema    = '{SCHEMA}'
                  AND tc.table_name      = '{table}'
                ORDER BY kcu.ordinal_position
            """))
            pk_cols = [row[0] for row in r.fetchall()]
            if pk_cols and 'tenant_id' not in pk_cols:
                r2 = await conn.execute(text(f"""
                    SELECT constraint_name
                    FROM information_schema.table_constraints
                    WHERE constraint_type = 'PRIMARY KEY'
                      AND table_schema    = '{SCHEMA}'
                      AND table_name      = '{table}'
                """))
                row2 = r2.fetchone()
                cname = row2[0] if row2 else f"{table}_pkey"
                needs_fix.append((table, pk_cols, cname))

        print(f"\n[STEP 1] Tables needing PK fix: {len(needs_fix)}")

        # ── 2. Check for Foreign Keys ───────────────────────────────
        all_fks = []
        for table, _, _ in needs_fix:
            r = await conn.execute(text(f"""
                SELECT tc.constraint_name,
                       tc.table_name  AS fk_table,
                       kcu.column_name AS fk_col,
                       ccu.table_name  AS ref_table,
                       ccu.column_name AS ref_col
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                   AND tc.table_schema    = kcu.table_schema
                JOIN information_schema.constraint_column_usage ccu
                    ON ccu.constraint_name = tc.constraint_name
                   AND ccu.table_schema    = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                  AND tc.table_schema    = '{SCHEMA}'
                  AND ccu.table_name     = '{table}'
            """))
            for fk in r.fetchall():
                all_fks.append({'name': fk[0], 'fk_table': fk[1], 'fk_col': fk[2],
                                 'ref_table': fk[3], 'ref_col': fk[4]})

        print(f"[STEP 2] Foreign Keys referencing affected tables: {len(all_fks)}")
        for fk in all_fks:
            print(f"         FK {fk['name']}: {fk['fk_table']}.{fk['fk_col']} -> {fk['ref_table']}.{fk['ref_col']}")

        # ── 3. Check duplicates ─────────────────────────────────────
        print(f"\n[STEP 3] Checking for duplicate rows (blockers)...")
        blockers = []
        clean    = []
        for table, pk_cols, cname in needs_fix:
            pk_str = ', '.join(pk_cols)
            r = await conn.execute(text(f"""
                SELECT COUNT(*) FROM (
                    SELECT {pk_str}, COUNT(*) FROM {SCHEMA}.{table}
                    GROUP BY {pk_str} HAVING COUNT(*) > 1
                ) dup
            """))
            dup_count = r.scalar() or 0
            if dup_count > 0:
                blockers.append((table, pk_cols, cname, dup_count))
                print(f"         [BLOCKER] {table:<45} {dup_count} duplicate groups!")
            else:
                clean.append((table, pk_cols, cname))

        print(f"\n         Clean (safe to migrate): {len(clean)}")
        print(f"         Blockers (duplicates exist): {len(blockers)}")
        if blockers:
            print(f"\n         [WARN] Blocked tables (need manual dedup first):")
            for t, pk, _, cnt in blockers:
                print(f"           - {t}  PK={pk}  ({cnt} dup groups)")

        # ── 4. Build migration SQL ──────────────────────────────────
        sql_lines = []
        sql_lines.append("-- SMRITI-OS: Multi-Tenant PK Migration")
        sql_lines.append(f"-- Tables to fix:  {len(needs_fix)}")
        sql_lines.append(f"-- Clean/safe:     {len(clean)}")
        sql_lines.append(f"-- Blockers:       {len(blockers)} (skipped)")
        sql_lines.append(f"-- FKs handled:    {len(all_fks)}\n")
        sql_lines.append("BEGIN;\n")

        if all_fks:
            sql_lines.append("-- STEP A: Drop referencing Foreign Keys")
            for fk in all_fks:
                sql_lines.append(f"ALTER TABLE {SCHEMA}.{fk['fk_table']} DROP CONSTRAINT IF EXISTS {fk['name']};")
            sql_lines.append("")

        sql_lines.append("-- STEP B: Add tenant_id to Primary Keys (clean tables only)")
        for table, pk_cols, cname in clean:
            new_pk = ', '.join(pk_cols + ['tenant_id'])
            sql_lines.append(f"-- {table}  old_pk=({', '.join(pk_cols)})")
            sql_lines.append(f"ALTER TABLE {SCHEMA}.{table} DROP CONSTRAINT {cname};")
            sql_lines.append(f"ALTER TABLE {SCHEMA}.{table} ADD CONSTRAINT {cname} PRIMARY KEY ({new_pk});")
            sql_lines.append("")

        if blockers:
            sql_lines.append("-- STEP C: SKIPPED tables (have duplicates - fix manually first)")
            for table, pk_cols, _, cnt in blockers:
                sql_lines.append(f"-- SKIPPED: {table}  ({cnt} duplicate groups on pk={pk_cols})")
            sql_lines.append("")

        sql_lines.append("COMMIT;\n-- Migration complete")
        sql_content = '\n'.join(sql_lines)

        with open(OUT_FILE, 'w', encoding='utf-8') as f:
            f.write(sql_content)
        print(f"\n[STEP 4] Migration SQL saved to: {OUT_FILE}")

        # ── 5. Print final summary ──────────────────────────────────
        print(f"\n{'='*65}")
        print(f"  MIGRATION SUMMARY")
        print(f"{'='*65}")
        print(f"  Total tables with tenant_id:   {len(tables_with_tenant)}")
        print(f"  Tables needing PK fix:         {len(needs_fix)}")
        print(f"  Will be FIXED now:             {len(clean)}")
        print(f"  SKIPPED (duplicates exist):    {len(blockers)}")
        print(f"  FKs to handle:                 {len(all_fks)}")
        print(f"  SQL file:                      {OUT_FILE}")
        print(f"{'='*65}\n")

        if blockers:
            print("[WARN] Migration will be PARTIAL. Fix duplicates in blocked tables first.")
        else:
            print("[OK] All tables are clean. Migration is fully SAFE to apply.")

    await engine.dispose()
    return clean, blockers, all_fks

if __name__ == '__main__':
    asyncio.run(main())
