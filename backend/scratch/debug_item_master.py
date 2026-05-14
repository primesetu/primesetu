import asyncio
import sys
import os
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings
from app.models.legacy_s9 import Itemmaster, Stockmaster

async def debug_item_master():
    print("--- SMRITI-OS: ItemMaster Deep Debug ---")
    engine = create_async_engine(settings.local_database_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as db:
        # 1. Check if Itemmaster has tenant_id
        print("Checking Itemmaster model for tenant_id...")
        try:
            stmt = select(Itemmaster).limit(1)
            res = await db.execute(stmt)
            item = res.scalar_one_or_none()
            if item:
                print(f"  [OK] Found item: {item.stockno}, Tenant: {getattr(item, 'tenant_id', 'MISSING')}")
            else:
                print("  [WARN] No items found in Itemmaster.")
        except Exception as e:
            print(f"  [ERROR] Itemmaster query failed: {e}")

        # 2. Check Stock totals logic (from list_items)
        print("Testing stock totals join...")
        try:
            stock_subq = (
                select(Stockmaster.stockno, func.sum(Stockmaster.curbalqty).label("total_stock"))
                .group_by(Stockmaster.stockno)
                .subquery()
            )
            query = (
                select(Itemmaster, func.coalesce(stock_subq.c.total_stock, 0).label("total_stock"))
                .outerjoin(stock_subq, Itemmaster.stockno == stock_subq.c.stockno)
                .limit(5)
            )
            result = await db.execute(query)
            rows = result.all()
            print(f"  [OK] Successfully fetched {len(rows)} items with stock totals.")
            for row in rows:
                item, total = row
                print(f"    - {item.stockno}: {total}")
        except Exception as e:
            print(f"  [ERROR] Stock join failed: {e}")

        # 3. Check for tenant-less data
        print("Checking for rows with NULL tenant_id...")
        try:
            from sqlalchemy import text
            res = await db.execute(text(f"SELECT count(*) FROM {settings.LEGACY_SCHEMA}.itemmaster WHERE tenant_id IS NULL"))
            count = res.scalar()
            print(f"  [RESULT] Itemmaster rows with NULL tenant_id: {count}")
            
            res = await db.execute(text(f"SELECT count(*) FROM {settings.LEGACY_SCHEMA}.stockmaster WHERE tenant_id IS NULL"))
            count = res.scalar()
            print(f"  [RESULT] Stockmaster rows with NULL tenant_id: {count}")
        except Exception as e:
            print(f"  [ERROR] Tenant NULL check failed: {e}")

    await engine.dispose()
    print("--- DEBUG COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(debug_item_master())
