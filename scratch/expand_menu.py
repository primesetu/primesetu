import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def expand_menu():
    print("Executing Master Sovereign Menu Seed (Phase 2.5)...")
    engine = create_async_engine(DATABASE_URL)
    
    # Complete Enterprise Retail Matrix (Shoper9 Parity)
    menu_items = [
        # POS OPERATIONS
        ('dashboard', 'Overview', '/dashboard', 'LayoutDashboard', 'dashboard', 'POS', 'dashboard.view', 0, 'F12'),
        ('sales', 'Billing (POS)', '/sales', 'ShoppingCart', 'sales', 'POS', 'billing.access', 1, 'F1'),
        ('returns', 'Sales Returns', '/sales/returns', 'RotateCcw', 'returns', 'POS', 'billing.returns', 2, 'F4'),
        ('tills', 'Till Management', '/sales/tills', 'Monitor', 'tills', 'POS', 'billing.tills', 3, 'F5'),
        ('dayend', 'Day End Closure', '/sales/day-end', 'Lock', 'dayend', 'POS', 'billing.dayend', 4, 'F6'),
        ('price', 'Price Master', '/sales/prices', 'DollarSign', 'price', 'POS', 'billing.prices', 5, 'F7'),
        ('customers', 'Customer Master', '/catalogue/customers', 'UserSquare2', 'customers', 'POS', 'catalogue.view', 6, 'F8'),
        ('loyalty', 'Loyalty Program', '/catalogue/loyalty', 'Trophy', 'loyalty', 'POS', 'loyalty.view', 7, 'Alt+L'),
        ('vouchers', 'Gift Vouchers', '/sales/vouchers', 'Trophy', 'vouchers', 'POS', 'billing.vouchers', 8, 'Alt+V'),
        ('promotions', 'Promotions', '/schemes', 'Trophy', 'promotions', 'POS', 'schemes.view', 9, 'F9'),
        
        # WAREHOUSE (Inventory & Supply Chain)
        ('inventory', 'Stock Status', '/inventory', 'Package', 'inventory', 'WAREHOUSE', 'inventory.view', 0, 'F11'),
        ('registry', 'Item Master', '/inventory/registry', 'Package', 'registry', 'WAREHOUSE', 'inventory.registry', 1, 'F3'),
        ('grn', 'Goods Inward (GRN)', '/inventory/grn', 'Truck', 'grn', 'WAREHOUSE', 'inventory.grn', 2, 'F10'),
        ('procurement', 'Purchase Orders', '/inventory/procurement', 'ShoppingBag', 'procurement', 'WAREHOUSE', 'inventory.procure', 3, 'F11'),
        ('movement', 'Stock Movement', '/inventory/movement', 'History', 'movement', 'WAREHOUSE', 'inventory.movement', 4, 'Alt+M'),
        ('transfer', 'Store Transfers', '/inventory/transfer', 'RotateCcw', 'transfer', 'WAREHOUSE', 'inventory.transfer', 5, 'Alt+T'),
        ('reconcile', 'Physical Audit', '/inventory/reconcile', 'History', 'reconcile', 'WAREHOUSE', 'inventory.audit', 6, 'Alt+P'),
        ('barcode', 'Barcode Studio', '/inventory/barcode', 'Package', 'barcode', 'WAREHOUSE', 'inventory.barcode', 7, 'Alt+B'),
        
        # FINANCE & ANALYTICS
        ('analytics', 'MIS Reports', '/analytics/mis', 'BarChart3', 'analytics', 'FINANCE', 'reports.view', 0, 'Alt+R'),
        ('salesrep', 'Sales Analysis', '/analytics/sales', 'BarChart3', 'salesrep', 'FINANCE', 'reports.sales', 1, 'Alt+S'),
        ('stockrep', 'Stock Analysis', '/analytics/stock', 'BarChart3', 'stockrep', 'FINANCE', 'reports.stock', 2, 'Alt+T'),
        ('taxrep', 'Tax Register', '/analytics/tax', 'BarChart3', 'taxrep', 'FINANCE', 'reports.tax', 3, 'Alt+X'),
        ('tally', 'Tally Integration', '/integration/tally', 'DollarSign', 'tally', 'FINANCE', 'integration.tally', 4, 'Alt+I'),
        
        # HO & SYSTEM
        ('ho', 'HO Sync', '/ho', 'Globe', 'ho', 'HO', 'ho.sync', 0, 'Alt+H'),
        ('settings', 'Configuration', '/settings', 'Settings', 'settings', 'SYSTEM', 'settings.view', 0, 'Alt+C'),
        ('security', 'User Security', '/settings/security', 'Lock', 'security', 'SYSTEM', 'settings.security', 1, 'Alt+U'),
        ('alerts', 'System Alerts', '/alerts', 'Globe', 'alerts', 'SYSTEM', 'alerts.view', 2, 'Alt+A'),
        ('housekeep', 'Housekeeping', '/settings/housekeeping', 'Settings', 'housekeep', 'SYSTEM', 'settings.housekeep', 3, 'Alt+K'),
    ]

    async with engine.begin() as conn:
        print("Cleaning old menu pulse...")
        await conn.execute(text("DELETE FROM public.menu_items WHERE tenant_id = 'SYSTEM';"))
        
        print(f"Injecting {len(menu_items)} Master Sovereign Modules...")
        for item in menu_items:
            sql = """
            INSERT INTO public.menu_items (id, label, route, icon, module, category, required_permission, tenant_id, sort_order, shortcut)
            VALUES (:id, :label, :route, :icon, :module, :category, :perm, 'SYSTEM', :sort, :key)
            """
            await conn.execute(text(sql), {
                "id": item[0], "label": item[1], "route": item[2], "icon": item[3], 
                "module": item[4], "category": item[5], "perm": item[6], "sort": item[7], "key": item[8]
            })
            
    await engine.dispose()
    print("Master Sovereign Menu Engine Seeded successfully!")

if __name__ == "__main__":
    asyncio.run(expand_menu())
