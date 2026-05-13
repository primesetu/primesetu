import asyncio
from sqlalchemy import text
from app.database import engine

async def check_counts():
    tables = [
        'itemmaster', 'genlookup', 'stockmaster', 'barcodemaster', 
        'customers', 'saletrnhdr', 'stktrnhdr', 'vamenu', 'vamenushortcut'
    ]
    print("--- Cloud Table Counts ---")
    async with engine.connect() as conn:
        for t in tables:
            try:
                res = await conn.execute(text(f"SELECT count(*) FROM shoper9.{t}"))
                print(f"shoper9.{t}: {res.scalar()}")
            except Exception as e:
                print(f"shoper9.{t}: FAILED")

if __name__ == "__main__":
    asyncio.run(check_counts())
