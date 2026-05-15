import asyncio
from app.core.database import SessionLocal
from sqlalchemy import text

async def main():
    async with SessionLocal() as db:
        res = await db.execute(text('SELECT COUNT(*) FROM s9.class12combo'))
        print('class12combo count:', res.scalar())
        
        # also check class1 and class2 in genlookup
        res = await db.execute(text('SELECT COUNT(*) FROM s9.genlookup WHERE recid IN (1, 2)'))
        print('genlookup (product/brand) count:', res.scalar())

if __name__ == '__main__':
    asyncio.run(main())
