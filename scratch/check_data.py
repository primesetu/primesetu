
import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def check_article():
    async with AsyncSessionLocal() as db:
        # Check subclass1cd
        sql = text("SELECT stockno, itemdesc, class1cd, subclass1cd FROM s9.itemmaster WHERE subclass1cd = '14368'")
        res = await db.execute(sql)
        rows = res.all()
        print(f"Found in subclass1cd: {len(rows)} items")
        for r in rows:
            print(r)
            
        # Check class1cd just in case
        sql2 = text("SELECT stockno, itemdesc, class1cd, subclass1cd FROM s9.itemmaster WHERE class1cd = '14368'")
        res2 = await db.execute(sql2)
        rows2 = res2.all()
        print(f"Found in class1cd: {len(rows2)} items")

if __name__ == "__main__":
    asyncio.run(check_article())
