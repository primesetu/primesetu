import asyncio
from app.core.database import get_db_session
from sqlalchemy import text


async def main():
    async with get_db_session() as session:
        print("=== s9.vamenu Schema ===")
        res = await session.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 's9' AND table_name = 'vamenu'
            ORDER BY ordinal_position
        """))
        for r in res.all():
            print(f"{r[0]}: {r[1]}")
            
        print("\\n=== s9.vamenushortcut Schema ===")
        res = await session.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 's9' AND table_name = 'vamenushortcut'
            ORDER BY ordinal_position
        """))
        for r in res.all():
            print(f"{r[0]}: {r[1]}")

        print("\\n=== Top 20 Menus ===")
        res = await session.execute(text("SELECT mnuno, mnuname, mnucap, mnupgm, exename FROM s9.vamenu ORDER BY mnuno LIMIT 20"))
        cols = list(res.keys())
        print(" | ".join(cols))
        print("-" * 80)
        for row in res.all():
            print(" | ".join([str(x) for x in row]))

if __name__ == "__main__":
    asyncio.run(main())
