import asyncio
from app.core.database import engine
from sqlalchemy import text

async def audit():
    async with engine.connect() as conn:
        print("--- DEEP AUDIT: legacy.ItemMaster ---")
        
        # 1. Inspect ItemMaster Columns (Case Sensitive)
        res = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_schema = 'legacy' AND table_name = 'ItemMaster'"))
        cols = [row[0] for row in res.fetchall()]
        print("\n[Actual Columns found in ItemMaster]")
        for c in cols:
            print(f"  {c}")

        # 2. Relationship: ItemMaster -> StockMaster (Fixed Casing)
        # Using exact casing from information_schema if possible, or just trying the CamelCase
        try:
            res = await conn.execute(text("""
                SELECT COUNT(im."StockNo") 
                FROM legacy."ItemMaster" im
                LEFT JOIN legacy."StockMaster" sm ON im."StockNo" = sm."StockNo"
                WHERE sm."StockNo" IS NULL
            """))
            orphans = res.scalar()
            print(f"\n[Stock Alignment]\n- Items without StockMaster records: {orphans}")
        except Exception as e:
            print(f"\n[Stock Alignment] Error: {e}")

        # 3. Transaction Volume check
        res = await conn.execute(text('SELECT COUNT(*) FROM legacy."StkTrnHdr"'))
        print(f"\n[Transaction Load]\n- Header records (StkTrnHdr): {res.scalar()}")
        
        res = await conn.execute(text('SELECT COUNT(*) FROM legacy."StkTrnDtls"'))
        print(f"- Detail records (StkTrnDtls): {res.scalar()}")

if __name__ == "__main__":
    asyncio.run(audit())
