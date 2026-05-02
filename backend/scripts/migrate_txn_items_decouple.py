"""
SMRITI-OS Migration: transaction_items — Decouple from items table
===================================================================
Drops the FK constraint on product_id (items.id) and adds:
  - stock_no   VARCHAR  (Shoper9 stockno, indexed)
  - item_name  VARCHAR  (denormalized)
  - item_brand VARCHAR  (denormalized)

Safe to run multiple times (idempotent via IF NOT EXISTS / IF EXISTS checks).
"""

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def migrate():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)

    print("Starting migration: transaction_items schema update...")

    # 1. Drop the FK constraint on product_id (items.id)
    fk_name = await conn.fetchval("""
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'transaction_items'
          AND kcu.column_name = 'product_id'
        LIMIT 1
    """)

    if fk_name:
        await conn.execute(f'ALTER TABLE public.transaction_items DROP CONSTRAINT IF EXISTS "{fk_name}"')
        print(f"  ✓ Dropped FK constraint: {fk_name}")
    else:
        print("  ✓ No FK on product_id found (already clean)")

    # 2. Make product_id nullable (was NOT NULL)
    await conn.execute("""
        ALTER TABLE public.transaction_items
        ALTER COLUMN product_id DROP NOT NULL
    """)
    print("  ✓ Made product_id nullable")

    # 3. Add stock_no column
    col_exists = await conn.fetchval("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name='transaction_items' AND column_name='stock_no'
    """)
    if not col_exists:
        await conn.execute("""
            ALTER TABLE public.transaction_items
            ADD COLUMN stock_no VARCHAR
        """)
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_txn_items_stock_no
            ON public.transaction_items (stock_no)
        """)
        print("  ✓ Added column: stock_no (indexed)")
    else:
        print("  ✓ Column stock_no already exists")

    # 4. Add item_name column
    col_exists = await conn.fetchval("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name='transaction_items' AND column_name='item_name'
    """)
    if not col_exists:
        await conn.execute("""
            ALTER TABLE public.transaction_items
            ADD COLUMN item_name VARCHAR
        """)
        print("  ✓ Added column: item_name")
    else:
        print("  ✓ Column item_name already exists")

    # 5. Add item_brand column
    col_exists = await conn.fetchval("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name='transaction_items' AND column_name='item_brand'
    """)
    if not col_exists:
        await conn.execute("""
            ALTER TABLE public.transaction_items
            ADD COLUMN item_brand VARCHAR
        """)
        print("  ✓ Added column: item_brand")
    else:
        print("  ✓ Column item_brand already exists")

    await conn.close()
    print("\nMigration complete. transaction_items is now fully decoupled from items table.")

if __name__ == '__main__':
    asyncio.run(migrate())
