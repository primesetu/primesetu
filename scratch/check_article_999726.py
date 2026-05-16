import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check_article_999726():
    async with engine.connect() as conn:
        article = "999726"
        print(f"Checking data for Article: {article}")
        
        # Check Item Master
        query = text("SELECT * FROM s9.itemmaster WHERE subclass1cd = :article")
        res = await conn.execute(query, {"article": article})
        items = res.all()
        
        if not items:
            print("No items found in itemmaster for this article.")
            # Try partial match
            print("Trying partial match...")
            query = text("SELECT subclass1cd FROM s9.itemmaster WHERE subclass1cd LIKE :article LIMIT 5")
            res = await conn.execute(query, {"article": f"{article}%"})
            partial = res.all()
            print(f"Partial matches: {partial}")
            return

        print(f"Found {len(items)} variants in itemmaster.")
        for i in items:
            print(f"  StockNo: {i.stockno}, Brand: {i.class2cd}, Color: {i.subclass2cd}, Size: {i.sizecd}")

if __name__ == "__main__":
    asyncio.run(check_article_999726())
