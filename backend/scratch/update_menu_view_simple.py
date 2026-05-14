
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def update_menu_view():
    async with engine.begin() as conn:
        await conn.execute(text("DROP VIEW IF EXISTS public.menu_items CASCADE"))
        # Simplest possible SQL to avoid syntax errors
        view_sql = """
        CREATE VIEW public.menu_items AS
        SELECT 
            "MenuOPt"::text as id,
            "MnuCap" as label,
            'Extension' as icon,
            '/' || LOWER(REPLACE("MnuCap", ' ', '-')) as route,
            'legacy' as module,
            'SHOPER9' as category,
            true as is_active,
            "MnuWght" as sort_order,
            'SYSTEM' as tenant_id,
            'legacy.view' as required_permission,
            CASE WHEN "MnuNo" = 0 THEN NULL ELSE "MnuNo"::text END as parent_id,
            NULL::text as shortcut,
            NULL::jsonb as metadata
        FROM shoper9.vamenu;
        """
        await conn.execute(text(view_sql))
        print("Updated menu_items view successfully.")

if __name__ == "__main__":
    asyncio.run(update_menu_view())
