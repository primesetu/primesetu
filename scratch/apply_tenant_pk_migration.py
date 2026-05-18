"""
SMRITI-OS - Apply Tenant PK Migration (One Transaction Per Table)
=================================================================
Runs each table's PK change in its own transaction.
Reports per-table success/failure with real error messages.
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

PG_URL = 'postgresql+asyncpg://postgres:MSba108682%21%40@127.0.0.1:5434/smriti_local'
SCHEMA = 's9'

async def main():
    engine = create_async_engine(PG_URL, isolation_level="AUTOCOMMIT")
    async with engine.connect() as conn:

        # ── Get all tables needing fix ────────────────────────────────
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

        total  = len(needs_fix)
        passed = []
        failed = []

        print(f"[START] Processing {total} tables one by one...\n")

        for i, (table, pk_cols, cname) in enumerate(needs_fix, 1):
            new_pk = ', '.join(pk_cols + ['tenant_id'])
            drop_sql = f"ALTER TABLE {SCHEMA}.{table} DROP CONSTRAINT {cname}"
            add_sql  = f"ALTER TABLE {SCHEMA}.{table} ADD CONSTRAINT {cname} PRIMARY KEY ({new_pk})"

            try:
                await conn.execute(text(f"BEGIN"))
                await conn.execute(text(drop_sql))
                await conn.execute(text(add_sql))
                await conn.execute(text(f"COMMIT"))
                passed.append(table)
                if i % 50 == 0 or i == total:
                    print(f"  [{i}/{total}] Progress... {len(passed)} OK, {len(failed)} failed")
            except Exception as e:
                await conn.execute(text(f"ROLLBACK"))
                err_msg = str(e).split('\n')[0][:120]
                failed.append((table, pk_cols, err_msg))
                print(f"  [FAIL] {table:<45} -> {err_msg}")

        # ── Final report ──────────────────────────────────────────────
        print(f"\n{'='*65}")
        print(f"  MIGRATION COMPLETE")
        print(f"{'='*65}")
        print(f"  Total tables:   {total}")
        print(f"  SUCCESS:        {len(passed)}")
        print(f"  FAILED:         {len(failed)}")

        if failed:
            print(f"\n  Failed tables (investigate these):")
            for t, pk, err in failed:
                print(f"    {t:<45}  PK was {pk}")
                print(f"      Error: {err}")
        else:
            print(f"\n  [OK] All {total} tables updated successfully!")
            print(f"  tenant_id is now part of the Primary Key in ALL s9 tables.")

    await engine.dispose()

asyncio.run(main())
