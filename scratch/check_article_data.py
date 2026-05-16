import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check_article():
    async with engine.connect() as conn:
        article_no = "95001"
        query = text("SELECT subclass1cd, count(*) FROM s9.itemmaster WHERE subclass1cd LIKE :art GROUP BY subclass1cd")
        res = await conn.execute(query, {"art": f"{article_no}%"})
        rows = res.all()
        print(f"Results for '{article_no}':")
        for r in rows:
            print(f"  Value: '{r[0]}', Length: {len(r[0]) if r[0] else 0}, Count: {r[1]}")

if __name__ == "__main__":
    asyncio.run(check_article())
