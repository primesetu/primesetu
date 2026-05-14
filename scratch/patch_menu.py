import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def patch_database():
    print("Connecting to Sovereign Node...")
    engine = create_async_engine(DATABASE_URL)
    
    sql_commands = [
        # 1. Create Table
        """
        CREATE TABLE IF NOT EXISTS public.menu_items (
            id VARCHAR(100) PRIMARY KEY,
            label VARCHAR(200) NOT NULL,
            route VARCHAR(300) NOT NULL,
            icon VARCHAR(100),
            module VARCHAR(100) NOT NULL,
            required_permission VARCHAR(100) NOT NULL,
            category VARCHAR(50),
            parent_id VARCHAR(100) REFERENCES public.menu_items(id),
            tenant_id VARCHAR(50) NOT NULL,
            sort_order INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            shortcut VARCHAR(20),
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
        """,
        # 2. Security
        "ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;",
        "DROP POLICY IF EXISTS \"Users can view menus for their store\" ON public.menu_items;",
        """
        CREATE POLICY "Users can view menus for their store"
            ON public.menu_items
            FOR SELECT
            USING (
                tenant_id = (auth.jwt() ->> 'store_id')
                OR tenant_id = 'SYSTEM'
            );
        """,
        # 3. Indexes
        "CREATE INDEX IF NOT EXISTS idx_menu_tenant ON public.menu_items(tenant_id);",
        "CREATE INDEX IF NOT EXISTS idx_menu_module ON public.menu_items(module);",
        "CREATE INDEX IF NOT EXISTS idx_menu_category ON public.menu_items(category);",
        "CREATE INDEX IF NOT EXISTS idx_menu_parent ON public.menu_items(parent_id);",
        # 4. Seed Data
        "UPDATE public.menu_items SET category = 'POS' WHERE id IN ('dashboard', 'pos_billing');",
        "UPDATE public.menu_items SET category = 'WAREHOUSE' WHERE id = 'inv_registry';",
        "UPDATE public.menu_items SET category = 'FINANCE' WHERE id = 'fin_reports';",
        """
        INSERT INTO public.menu_items (id, label, route, icon, module, category, required_permission, tenant_id, sort_order, shortcut)
        VALUES ('dashboard', 'Overview', '/dashboard', 'LayoutDashboard', 'dashboard', 'POS', 'dashboard.view', 'SYSTEM', 0, 'F12')
        ON CONFLICT (id) DO UPDATE SET category = 'POS';
        """,
        """
        INSERT INTO public.menu_items (id, label, route, icon, module, category, required_permission, tenant_id, sort_order, shortcut)
        VALUES ('pos_billing', 'Billing (POS)', '/sales', 'ShoppingCart', 'sales', 'POS', 'billing.access', 'SYSTEM', 1, 'F1')
        ON CONFLICT (id) DO NOTHING;
        """,
        """
        INSERT INTO public.menu_items (id, label, route, icon, module, category, required_permission, tenant_id, sort_order, shortcut)
        VALUES ('inv_registry', 'Item Master', '/inventory/registry', 'Package', 'inventory', 'WAREHOUSE', 'inventory.view', 'SYSTEM', 2, 'F2')
        ON CONFLICT (id) DO NOTHING;
        """,
        """
        INSERT INTO public.menu_items (id, label, route, icon, module, category, required_permission, tenant_id, sort_order, shortcut)
        VALUES ('fin_reports', 'MIS Reports', '/analytics/mis', 'BarChart3', 'analytics', 'FINANCE', 'reports.view', 'SYSTEM', 3, 'F3')
        ON CONFLICT (id) DO NOTHING;
        """
    ]
    
    async with engine.begin() as conn:
        for cmd in sql_commands:
            print(f"Executing: {cmd.strip().splitlines()[0]}...")
            await conn.execute(text(cmd))
    
    await engine.dispose()
    print("Sovereign Database Patched successfully!")

if __name__ == "__main__":
    asyncio.run(patch_database())
