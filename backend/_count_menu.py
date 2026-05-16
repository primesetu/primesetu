import asyncio
from app.core.database import get_db_session
from sqlalchemy import text

async def main():
    async with get_db_session() as session:
        # Menus
        res = await session.execute(text("SELECT count(*) FROM s9.vamenu"))
        print('vamenu count:', res.scalar())
        res = await session.execute(text("SELECT count(*) FROM s9.vamenushortcut"))
        print('vamenushortcut count:', res.scalar())

        # Let's also check user permissions (vasysobj/userobj) or sysopt
        res = await session.execute(text("""
            SELECT table_name, 
                   (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
            FROM (
              SELECT table_name, query_to_xml(format('select count(*) as cnt from %I.%I', table_schema, table_name), false, true, '') as xml_count
              FROM information_schema.tables
              WHERE table_schema = 's9' AND table_name IN ('sysopt', 'basecomptemplate', 'usermenu', 'secobj', 'vasysobj')
            ) t;
        """))
        for row in res.all():
            print(f"{row[0]}: {row[1]}")

if __name__ == "__main__":
    asyncio.run(main())
