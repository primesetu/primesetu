import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check_classifications():
    async with engine.connect() as conn:
        # Check sample values for all classifications
        fields = ["class1cd", "class2cd", "subclass1cd", "subclass2cd"]
        print("SMRITI-OS Shoper9 Schema Audit:")
        for f in fields:
            query = text(f"SELECT {f}, count(*) FROM s9.itemmaster WHERE {f} IS NOT NULL GROUP BY {f} LIMIT 5")
            res = await conn.execute(query)
            rows = res.all()
            print(f"\nField: {f}")
            for r in rows:
                print(f"  Value: '{r[0]}' (Count: {r[1]})")

if __name__ == "__main__":
    asyncio.run(check_classifications())
