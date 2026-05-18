"""
SMRITI-OS - GenLookup Schema Comparison Tool
=============================================
Compares the GenLookup table schema across:
  1. AITDL MSSQL Server: SHOPER9X01   (live GKP store)
  2. Local MSSQL Server: SHOPER9WH1   (local warehouse DB)
  3. Local PostgreSQL:   s9.genlookup (SMRITI sovereign node)

Connection details from project config.
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import pyodbc
import asyncio
import json
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# ── CONNECTION STRINGS ────────────────────────────────────────────────────────
AITDL_CONN    = 'DRIVER={SQL Server};SERVER=AITDL;DATABASE=SHOPER9X01;UID=sa;PWD=netmanthan@123;'
WH1_CONN      = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
PG_URL        = 'postgresql+asyncpg://postgres:MSba108682%21%40@127.0.0.1:5434/smriti_local'
PG_SCHEMA     = 's9'

# ── HELPERS ──────────────────────────────────────────────────────────────────
def get_mssql_schema(conn_str: str, db_label: str):
    """Fetch GenLookup column schema from an MSSQL database."""
    print(f"\n{'='*60}")
    print(f"  Connecting to: {db_label}")
    print(f"{'='*60}")
    try:
        conn = pyodbc.connect(conn_str, timeout=5)
        cursor = conn.cursor()

        # 1. Column definitions
        cursor.execute("""
            SELECT 
                c.COLUMN_NAME,
                c.DATA_TYPE,
                c.CHARACTER_MAXIMUM_LENGTH,
                c.NUMERIC_PRECISION,
                c.NUMERIC_SCALE,
                c.IS_NULLABLE,
                c.COLUMN_DEFAULT,
                c.ORDINAL_POSITION
            FROM INFORMATION_SCHEMA.COLUMNS c
            WHERE c.TABLE_NAME = 'GenLookUp'
            ORDER BY c.ORDINAL_POSITION
        """)
        columns = cursor.fetchall()
        col_names = [d[0] for d in cursor.description]

        print(f"\n  [COLS] Columns ({len(columns)} total):")
        schema = []
        for row in columns:
            d = dict(zip(col_names, row))
            type_str = d['DATA_TYPE']
            if d['CHARACTER_MAXIMUM_LENGTH']:
                type_str += f"({d['CHARACTER_MAXIMUM_LENGTH']})"
            elif d['NUMERIC_PRECISION'] and d['DATA_TYPE'] not in ('int', 'bigint', 'smallint', 'tinyint', 'bit'):
                type_str += f"({d['NUMERIC_PRECISION']},{d['NUMERIC_SCALE']})"
            nullable = "NULL" if d['IS_NULLABLE'] == 'YES' else "NOT NULL"
            default = f" DEFAULT {d['COLUMN_DEFAULT']}" if d['COLUMN_DEFAULT'] else ""
            print(f"    [{d['ORDINAL_POSITION']:2d}] {d['COLUMN_NAME']:<20} {type_str:<25} {nullable}{default}")
            schema.append({
                'pos': d['ORDINAL_POSITION'],
                'name': d['COLUMN_NAME'],
                'type': d['DATA_TYPE'],
                'max_len': d['CHARACTER_MAXIMUM_LENGTH'],
                'nullable': d['IS_NULLABLE'] == 'YES',
                'default': d['COLUMN_DEFAULT'],
            })

        # 2. Primary Keys
        cursor.execute("""
            SELECT kcu.COLUMN_NAME
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
                ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
            WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
              AND tc.TABLE_NAME = 'GenLookUp'
            ORDER BY kcu.ORDINAL_POSITION
        """)
        pks = [r[0] for r in cursor.fetchall()]
        print(f"\n  [PK] Primary Keys: {pks}")

        # 3. Indexes (STUFF+FOR XML PATH for SQL 2008+ compat)
        cursor.execute("""
            SELECT 
                i.name AS IndexName,
                i.type_desc,
                i.is_unique,
                STUFF((
                    SELECT ', ' + c2.name
                    FROM sys.index_columns ic2
                    JOIN sys.columns c2 ON ic2.object_id = c2.object_id AND ic2.column_id = c2.column_id
                    WHERE ic2.object_id = i.object_id AND ic2.index_id = i.index_id
                    ORDER BY ic2.key_ordinal
                    FOR XML PATH('')
                ), 1, 2, '') AS Columns
            FROM sys.indexes i
            WHERE OBJECT_NAME(i.object_id) = 'GenLookUp'
              AND i.name IS NOT NULL
            GROUP BY i.object_id, i.index_id, i.name, i.type_desc, i.is_unique
        """)
        indexes = cursor.fetchall()
        print(f"\n  [IDX] Indexes:")
        for idx in indexes:
            unique = " [UNIQUE]" if idx[2] else ""
            print(f"    - {idx[0]}: {idx[3]} ({idx[1]}){unique}")

        # 4. Row Count + Sample RecIds
        cursor.execute("SELECT COUNT(*) FROM GenLookUp")
        count = cursor.fetchone()[0]
        print(f"\n  [ROWS] Total Rows: {count:,}")

        cursor.execute("""
            SELECT DISTINCT RecId, COUNT(*) as Entries
            FROM GenLookUp
            GROUP BY RecId
            ORDER BY RecId
        """)
        recids = cursor.fetchall()
        print(f"\n  [RECID] RecId Distribution ({len(recids)} categories):")
        for r in recids[:20]:
            print(f"    RecId {r[0]:6} -> {r[1]:4} entries")
        if len(recids) > 20:
            print(f"    ... and {len(recids)-20} more RecIds")

        conn.close()
        return schema, pks

    except Exception as e:
        print(f"  [ERROR] Connection FAILED: {e}")
        return None, None


async def get_postgres_schema():
    """Fetch genlookup column schema from the local PostgreSQL."""
    print(f"\n{'='*60}")
    print(f"  Connecting to: Local PostgreSQL → s9.genlookup")
    print(f"{'='*60}")
    engine = create_async_engine(PG_URL)
    try:
        async with engine.connect() as conn:
            # 1. Columns
            result = await conn.execute(text(f"""
                SELECT 
                    ordinal_position,
                    column_name,
                    data_type,
                    character_maximum_length,
                    numeric_precision,
                    numeric_scale,
                    is_nullable,
                    column_default
                FROM information_schema.columns
                WHERE table_schema = '{PG_SCHEMA}'
                  AND table_name = 'genlookup'
                ORDER BY ordinal_position
            """))
            columns = result.fetchall()

            print(f"\n  [COLS] Columns ({len(columns)} total):")
            schema = []
            for row in columns:
                pos, name, dtype, maxlen, nprec, nscale, nullable, default = row
                type_str = dtype
                if maxlen:
                    type_str += f"({maxlen})"
                elif nprec and dtype not in ('integer', 'bigint', 'smallint'):
                    type_str += f"({nprec},{nscale})"
                null_str = "NULL" if nullable == 'YES' else "NOT NULL"
                def_str = f" DEFAULT {default}" if default else ""
                print(f"    [{pos:2d}] {name:<20} {type_str:<30} {null_str}{def_str}")
                schema.append({
                    'pos': pos,
                    'name': name,
                    'type': dtype,
                    'max_len': maxlen,
                    'nullable': nullable == 'YES',
                    'default': default,
                })

            # 2. Primary Keys
            result = await conn.execute(text(f"""
                SELECT kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.constraint_type = 'PRIMARY KEY'
                  AND tc.table_schema = '{PG_SCHEMA}'
                  AND tc.table_name = 'genlookup'
                ORDER BY kcu.ordinal_position
            """))
            pks = [r[0] for r in result.fetchall()]
            print(f"\n  [PK] Primary Keys: {pks}")

            # 3. Indexes
            result = await conn.execute(text(f"""
                SELECT indexname, indexdef
                FROM pg_indexes
                WHERE schemaname = '{PG_SCHEMA}'
                  AND tablename = 'genlookup'
            """))
            indexes = result.fetchall()
            print(f"\n  [IDX] Indexes:")
            for idx in indexes:
                print(f"    - {idx[0]}: {idx[1]}")

            # 4. Row count + RecId distribution
            result = await conn.execute(text(f"SELECT COUNT(*) FROM {PG_SCHEMA}.genlookup"))
            count = result.scalar()
            print(f"\n  [ROWS] Total Rows: {count:,}")

            result = await conn.execute(text(f"""
                SELECT recid, COUNT(*) as entries
                FROM {PG_SCHEMA}.genlookup
                GROUP BY recid
                ORDER BY recid
            """))
            recids = result.fetchall()
            print(f"\n  [RECID] RecId Distribution ({len(recids)} categories):")
            for r in recids[:20]:
                print(f"    RecId {r[0]:6} -> {r[1]:4} entries")
            if len(recids) > 20:
                print(f"    ... and {len(recids)-20} more RecIds")

            return schema, pks

    except Exception as e:
        print(f"  [ERROR] PostgreSQL FAILED: {e}")
        return None, None
    finally:
        await engine.dispose()


def compare_schemas(label_a: str, schema_a, pks_a, label_b: str, schema_b, pks_b):
    """Print a diff summary of two schemas."""
    if schema_a is None or schema_b is None:
        print(f"\n  ⚠️  Cannot compare: one or both schemas failed to load.")
        return

    print(f"\n{'='*60}")
    print(f"  SCHEMA DIFF: {label_a}  vs  {label_b}")
    print(f"{'='*60}")

    cols_a = {c['name'].lower(): c for c in schema_a}
    cols_b = {c['name'].lower(): c for c in schema_b}

    only_in_a  = set(cols_a.keys()) - set(cols_b.keys())
    only_in_b  = set(cols_b.keys()) - set(cols_a.keys())
    in_both    = set(cols_a.keys()) & set(cols_b.keys())

    if only_in_a:
        print(f"\n  [+] Columns ONLY in {label_a}:")
        for col in sorted(only_in_a):
            c = cols_a[col]
            print(f"    + {c['name']:<20} {c['type']}")

    if only_in_b:
        print(f"\n  [+] Columns ONLY in {label_b}:")
        for col in sorted(only_in_b):
            c = cols_b[col]
            print(f"    + {c['name']:<20} {c['type']}")

    type_diffs = []
    null_diffs = []
    for col in sorted(in_both):
        ca = cols_a[col]
        cb = cols_b[col]
        # Normalize type names
        type_a = ca['type'].lower().replace('varchar', 'character varying').replace('nvarchar', 'character varying').replace('int', 'integer')
        type_b = cb['type'].lower().replace('varchar', 'character varying').replace('nvarchar', 'character varying')
        if 'int' in type_b and type_b != 'integer':
            type_b = 'integer'
        if type_a != type_b:
            type_diffs.append((ca['name'], ca['type'], cb['type']))
        if ca['nullable'] != cb['nullable']:
            null_diffs.append((ca['name'], ca['nullable'], cb['nullable']))

    if type_diffs:
        print(f"\n  [WARN] Type Differences:")
        for name, ta, tb in type_diffs:
            print(f"    ~ {name:<20}  {label_a}: {ta:<20}  {label_b}: {tb}")

    if null_diffs:
        print(f"\n  [WARN] Nullability Differences:")
        for name, na, nb in null_diffs:
            print(f"    ~ {name:<20}  {label_a}: {'NULL' if na else 'NOT NULL':<12}  {label_b}: {'NULL' if nb else 'NOT NULL'}")

    if pks_a and pks_b:
        pks_a_norm = [p.lower() for p in pks_a]
        pks_b_norm = [p.lower() for p in pks_b]
        if pks_a_norm != pks_b_norm:
            print(f"\n  [PK MISMATCH!]")
            print(f"    {label_a}: {pks_a}")
            print(f"    {label_b}: {pks_b}")
        else:
            print(f"\n  [OK] Primary Keys match: {pks_a}")

    if not only_in_a and not only_in_b and not type_diffs and not null_diffs:
        print(f"\n  [OK] Schemas are structurally identical (column names + types match).")


async def main():
    print("\n" + "="*60)
    print("  SMRITI-OS :: GenLookup Schema Comparison")
    print("  AITDL MSSQL  vs  Local MSSQL  vs  PostgreSQL")
    print("="*60)

    # ── 1. AITDL SHOPER9X01 (Live GKP Store) ─────────────────────
    aitdl_schema, aitdl_pks = get_mssql_schema(AITDL_CONN, "AITDL → SHOPER9X01 (Live GKP Store)")

    # ── 2. Local SHOPER9WH1 (Warehouse / Training DB) ────────────
    wh1_schema, wh1_pks = get_mssql_schema(WH1_CONN, "Local → SHOPER9WH1 (Warehouse DB)")

    # ── 3. Local PostgreSQL s9.genlookup ─────────────────────────
    pg_schema, pg_pks = await get_postgres_schema()

    # ── Comparisons ──────────────────────────────────────────────
    compare_schemas("AITDL-SHOPER9X01", aitdl_schema, aitdl_pks,
                    "PG-s9.genlookup",  pg_schema,    pg_pks)

    if wh1_schema:
        compare_schemas("WH1-SHOPER9WH1",  wh1_schema, wh1_pks,
                        "PG-s9.genlookup", pg_schema,  pg_pks)

    print("\n\n" + "="*60)
    print("  Comparison Complete.")
    print("="*60 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
