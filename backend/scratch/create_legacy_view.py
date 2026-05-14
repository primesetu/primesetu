
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def create_menu_view():
    async with engine.begin() as conn:
        view_sql = """
        CREATE OR REPLACE VIEW public.menu_items AS
        SELECT 
            "MenuOPt"::text as id,
            "MnuCap" as label,
            CASE 
                WHEN "MnuCap" ILIKE '%sale%' THEN 'shopping_cart'
                WHEN "MnuCap" ILIKE '%billing%' THEN 'point_of_sale'
                WHEN "MnuCap" ILIKE '%stock%' THEN 'inventory'
                WHEN "MnuCap" ILIKE '%report%' THEN 'assessment'
                WHEN "MnuCap" ILIKE '%cash%' THEN 'account_balance_wallet'
                ELSE 'extension'
            END as icon,
            '/' || LOWER(REPLACE("MnuCap", ' ', '-')) as route_path,
            true as is_active,
            "MnuWght" as sort_order,
            'SYSTEM' as tenant_id,
            'legacy.view' as required_permission,
            CASE WHEN "MnuNo" = 0 THEN NULL ELSE "MnuNo"::text END as parent_id
        FROM shoper9.vamenu;
        """
        await conn.execute(text(view_sql))
        print("Created menu_items view pointing to legacy vamenu.")

if __name__ == "__main__":
    asyncio.run(create_menu_view())
