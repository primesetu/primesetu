#!/usr/bin/env python3
"""
SMRITI-OS -- Migration: Create ItemMaster Classification Tables
Creates the 4 missing Shoper9 upstream dependency tables:
  1. subclass1cat  -- Style master (with all 32 AnalCodes)
  2. subclass2cat  -- Shade / Colour master
  3. sizecat       -- Size master with replenishment ratio support
  4. extd_item_master -- Extended description + image (1:1 ItemMaster)

Run from backend/:
  python -m app.migration.create_item_classification_tables
  python -m app.migration.create_item_classification_tables --backfill
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..")))

from sqlalchemy import text
from app.core.database import engine
from app.models.item_classification import (
    SubClass1Cat, SubClass2Cat, SizeCat, ExtdItemMaster
)
from app.core.database import Base

TABLES = [
    ("subclass1cat",     SubClass1Cat,     "Style master (32 AnalCodes)"),
    ("subclass2cat",     SubClass2Cat,     "Shade / Colour master"),
    ("sizecat",          SizeCat,          "Size master + replenishment ratio"),
    ("extd_item_master", ExtdItemMaster,   "Extended description + image (1:1 ItemMaster)"),
]


async def table_exists(conn, table_name: str) -> bool:
    result = await conn.execute(text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
        "WHERE table_schema = 'public' AND table_name = :tbl)"
    ), {"tbl": table_name})
    return result.scalar()


async def migrate():
    print("\n=== SMRITI-OS -- ItemMaster Classification Migration ===\n")

    async with engine.begin() as conn:
        for table_name, model_cls, description in TABLES:
            exists = await table_exists(conn, table_name)
            if exists:
                print(f"  [SKIP]   {table_name:<25} already exists -- {description}")
                continue

            await conn.run_sync(
                lambda sync_conn, tbl=model_cls.__table__: tbl.create(sync_conn, checkfirst=True)
            )
            print(f"  [CREATE] {table_name:<25} -- {description}")

        print("\n  Checking legacy schema...")
        try:
            result = await conn.execute(text(
                "SELECT COUNT(*) FROM legacy.genlookup WHERE recid = 53"
            ))
            print(f"  [INFO]   SizeGroup records in legacy.genlookup(RecId=53): {result.scalar()}")
        except Exception:
            print("  [INFO]   legacy.genlookup not accessible")

        try:
            result = await conn.execute(text("SELECT COUNT(*) FROM legacy.itemmaster"))
            print(f"  [INFO]   Items in legacy.itemmaster: {result.scalar():,}")
        except Exception:
            print("  [INFO]   legacy.itemmaster not accessible")

    print("\n=== Migration Complete ===")
    print("  Next: Run with --backfill to populate from legacy data")
    print("     OR: POST /api/item-classification/backfill-from-legacy\n")


async def backfill_from_legacy():
    print("\n=== [BACKFILL] Deriving classification data from legacy.itemmaster ===\n")

    async with engine.begin() as conn:

        # SubClass1Cat
        try:
            result = await conn.execute(text("""
                INSERT INTO subclass1cat (class1cd, class2cd, subclass1cd, subclass1desc,
                    analcode1, analcode2, analcode3, analcode4, analcode5, analcode32)
                SELECT DISTINCT ON (class1cd, class2cd, subclass1cd)
                    class1cd, class2cd, subclass1cd, subclass1cd,
                    analcode1, analcode2, analcode3, analcode4, analcode5, analcode32
                FROM legacy.itemmaster
                WHERE class1cd IS NOT NULL AND class2cd IS NOT NULL AND subclass1cd IS NOT NULL
                ON CONFLICT ON CONSTRAINT uq_subclass1cat_pk DO NOTHING
                RETURNING class1cd
            """))
            print(f"  [OK] SubClass1Cat : {result.rowcount} style records inserted")
        except Exception as e:
            print(f"  [SKIP] SubClass1Cat backfill: {e}")

        # SubClass2Cat
        try:
            result = await conn.execute(text("""
                INSERT INTO subclass2cat (class1cd, class2cd, subclass2cd, subclass2desc)
                SELECT DISTINCT ON (class1cd, class2cd, subclass2cd)
                    class1cd, class2cd, subclass2cd, subclass2cd
                FROM legacy.itemmaster
                WHERE class1cd IS NOT NULL AND class2cd IS NOT NULL AND subclass2cd IS NOT NULL
                ON CONFLICT ON CONSTRAINT uq_subclass2cat_pk DO NOTHING
                RETURNING class1cd
            """))
            print(f"  [OK] SubClass2Cat : {result.rowcount} shade records inserted")
        except Exception as e:
            print(f"  [SKIP] SubClass2Cat backfill: {e}")

        # SizeCat
        try:
            result = await conn.execute(text("""
                INSERT INTO sizecat (class1cd, class2cd, sizecd)
                SELECT DISTINCT class1cd, class2cd, sizecd
                FROM legacy.itemmaster
                WHERE class1cd IS NOT NULL AND class2cd IS NOT NULL AND sizecd IS NOT NULL
                ON CONFLICT ON CONSTRAINT uq_sizecat_pk DO NOTHING
                RETURNING class1cd
            """))
            print(f"  [OK] SizeCat      : {result.rowcount} size records inserted")
        except Exception as e:
            print(f"  [SKIP] SizeCat backfill: {e}")

        # ExtdItemMaster
        try:
            result = await conn.execute(text("""
                INSERT INTO extd_item_master (stockno, item_ext_desc, image_id)
                SELECT stockno, itemdesc, imageid
                FROM legacy.itemmaster
                WHERE itemdesc IS NOT NULL
                ON CONFLICT (stockno) DO NOTHING
                RETURNING stockno
            """))
            print(f"  [OK] ExtdItemMaster: {result.rowcount} records inserted")
        except Exception as e:
            print(f"  [SKIP] ExtdItemMaster backfill: {e}")

    print("\n=== [BACKFILL] Complete ===\n")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="ItemMaster Classification Migration")
    parser.add_argument("--backfill", action="store_true",
                        help="Also backfill from legacy.itemmaster after creating tables")
    args = parser.parse_args()

    async def run():
        await migrate()
        if args.backfill:
            await backfill_from_legacy()

    asyncio.run(run())
