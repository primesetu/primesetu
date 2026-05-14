import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv()

async def main():
    db_url = os.getenv('DATABASE_URL').replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(db_url)
    
    # All public schema tables with row counts
    tables = await conn.fetch("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
    """)
    
    print("=== ALL TABLES IN public SCHEMA ===\n")
    print(f"{'TABLE NAME':45s} {'ROWS':>10s}  COLUMNS")
    print("-" * 80)
    
    for t in tables:
        name = t['table_name']
        try:
            cnt = await conn.fetchval(f'SELECT count(*) FROM public."{name}"')
        except:
            cnt = -1
        
        col_count = await conn.fetchval("""
            SELECT count(*) FROM information_schema.columns
            WHERE table_schema='public' AND table_name=$1
        """, name)
        
        print(f"  {name:43s} {cnt:>10,}  ({col_count} cols)")
    
    print(f"\nTotal: {len(tables)} tables")
    
    # Also show foreign key dependencies on items table
    print("\n=== FK REFERENCES TO 'items' TABLE ===")
    fks = await conn.fetch("""
        SELECT
            tc.table_name AS referencing_table,
            kcu.column_name AS referencing_col,
            ccu.column_name AS referenced_col
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'items'
    """)
    for fk in fks:
        print(f"  {fk['referencing_table']}.{fk['referencing_col']} -> items.{fk['referenced_col']}")
    
    if not fks:
        print("  (none)")
    
    # Also show FK references to item_stock
    print("\n=== FK REFERENCES TO 'item_stock' TABLE ===")
    fks2 = await conn.fetch("""
        SELECT
            tc.table_name AS referencing_table,
            kcu.column_name AS referencing_col
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'item_stock'
    """)
    for fk in fks2:
        print(f"  {fk['referencing_table']}.{fk['referencing_col']} -> item_stock")
    if not fks2:
        print("  (none)")

    await conn.close()

asyncio.run(main())
