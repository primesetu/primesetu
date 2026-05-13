import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def check_schema():
    async with AsyncSessionLocal() as session:
        print("Checking shoper9.itemmaster in Supabase:")
        try:
            result = await session.execute(text("SELECT COUNT(*) FROM shoper9.itemmaster"))
            count = result.scalar()
            print(f"  Total rows: {count}")
            
            if count > 0:
                result = await session.execute(text("SELECT stockno, itemdesc, class1cd, class2cd FROM shoper9.itemmaster LIMIT 5"))
                rows = result.all()
                print("  Sample rows:")
                for r in rows:
                    print(f"    StockNo: {r[0]}, Desc: {r[1]}, Class1: {r[2]}, Class2: {r[3]}")
        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_schema())
