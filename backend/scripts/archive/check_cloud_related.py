import asyncio
from sqlalchemy import text
from app.database import engine

async def check_all():
    tables = [
        'itemmaster', 'barcodemaster', 'stockmaster', 'genlookup', 
        'class12combo', 'subclass1cat', 'subclass2cat', 'sizecat',
        'customermaster', 'salestransactionhdr', 'salestransactiondtls'
    ]
    print("--- Checking Cloud Table Counts ---")
    async with engine.connect() as conn:
        for t in tables:
            try:
                res = await conn.execute(text(f"SELECT count(*) FROM shoper9.{t}"))
                count = res.scalar()
                print(f"shoper9.{t}: {count}")
            except Exception as e:
                print(f"shoper9.{t}: MISSING or ERROR")

if __name__ == "__main__":
    asyncio.run(check_all())
