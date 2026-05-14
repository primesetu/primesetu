
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def update_menu_view():
    async with engine.begin() as conn:
        view_sql = """
        CREATE OR REPLACE VIEW public.menu_items AS
        SELECT 
            "MenuOPt"::text as id,
            "MnuCap" as label,
            CASE 
                WHEN "MnuCap" ILIKE '%sale%' THEN 'ShoppingCart'
                WHEN "MnuCap" ILIKE '%billing%' THEN 'ShoppingCart'
                WHEN "MnuCap" ILIKE '%stock%' THEN 'Package'
                WHEN "MnuCap" ILIKE '%report%' THEN 'BarChart3'
                WHEN "MnuCap" ILIKE '%cash%' THEN 'DollarSign'
                ELSE 'Extension'
            END as icon,
            '/' || LOWER(REPLACE("MnuCap", ' ', '-')) as route,
            'legacy' as module,
            'SHOPER9' as category,
            true as is_active,
            "MnuWght" as sort_order,
            'SYSTEM' as tenant_id,
            'legacy.view' as required_permission,
            CASE WHEN "MnuNo" = 0 THEN NULL ELSE "MnuNo"::text END as parent_id,
            NULL::text as shortcut,
            jsonb_build_object('source', 'shoper9') as metadata
        FROM shoper9.vamenu;
        """
        await conn.execute(text(view_sql))
        print("Updated menu_items view with module, category, and metadata columns.")

if __name__ == "__main__":
    asyncio.run(update_menu_view())
