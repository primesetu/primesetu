-- Migration: 006_seed_full_shoper9_menu.sql
-- Goal: Populate the MenuManager with all institutional Shoper 9 modules.

INSERT INTO public.menu_items (id, label, route, icon, module, category, required_permission, parent_id, tenant_id, sort_order, shortcut)
VALUES 
    -- POS Category
    ('pos_returns', 'Sales Returns', '/billing/returns', 'RotateCcw', 'returns', 'POS', 'billing.returns', NULL, 'SYSTEM', 5, 'Alt+2'),
    ('pos_schemes', 'Schemes & Offers', '/schemes', 'Trophy', 'schemes', 'POS', 'schemes.view', NULL, 'SYSTEM', 6, 'Alt+S'),
    ('pos_dayend', 'Day End Seal', '/billing/day-end', 'Lock', 'dayend', 'POS', 'billing.dayend', NULL, 'SYSTEM', 7, 'Alt+D'),

    -- WAREHOUSE Category
    ('inv_grn', 'Goods Inward (GRN)', '/inventory/grn', 'Truck', 'grn', 'WAREHOUSE', 'inventory.grn', NULL, 'SYSTEM', 10, 'Alt+G'),
    ('inv_audit', 'Stock Audit', '/inventory/audit', 'History', 'reconcile', 'WAREHOUSE', 'inventory.audit', NULL, 'SYSTEM', 11, 'Alt+A'),
    ('inv_movement', 'Stock Movement', '/inventory/movement', 'History', 'movement', 'WAREHOUSE', 'inventory.movement', NULL, 'SYSTEM', 12, 'Alt+M'),
    ('inv_barcode', 'Barcode Studio', '/inventory/barcode', 'Package', 'barcode', 'WAREHOUSE', 'inventory.barcode', NULL, 'SYSTEM', 13, 'Alt+B'),

    -- REGISTRY / FINANCE Category
    ('reg_hub', 'Catalogue Hub', '/catalogue/registry', 'Package', 'registry', 'CATALOGUE', 'catalogue.view', NULL, 'SYSTEM', 20, 'F4'),
    ('reg_customers', 'Customer Master', '/catalogue/customers', 'UserSquare2', 'customers', 'CATALOGUE', 'customers.view', NULL, 'SYSTEM', 21, 'Alt+C'),
    ('reg_vendors', 'Vendor Master', '/catalogue/vendors', 'Truck', 'vendors', 'CATALOGUE', 'vendors.view', NULL, 'SYSTEM', 22, 'Alt+V'),
    ('reg_loyalty', 'Loyalty Engine', '/catalogue/loyalty', 'Trophy', 'loyalty', 'CATALOGUE', 'loyalty.view', NULL, 'SYSTEM', 23, 'Alt+L'),
    ('reg_hsn', 'HSN/Tax Manager', '/catalogue/hsn', 'Tag', 'hsn', 'CATALOGUE', 'catalogue.hsn', NULL, 'SYSTEM', 24, NULL),
    ('reg_prices', 'Price Groups', '/catalogue/price-groups', 'DollarSign', 'pricegroups', 'CATALOGUE', 'catalogue.pricing', NULL, 'SYSTEM', 25, NULL),

    -- TREASURY / FINANCE Category
    ('fin_hub', 'Finance Hub', '/accounts/hub', 'DollarSign', 'finance', 'FINANCE', 'finance.view', NULL, 'SYSTEM', 30, 'F5'),
    ('fin_tally', 'Tally Bridge', '/accounts/tally', 'FileText', 'tally', 'FINANCE', 'finance.tally', NULL, 'SYSTEM', 31, NULL),
    ('fin_tax', 'Tax Register', '/analytics/tax', 'FileText', 'taxrep', 'FINANCE', 'reports.tax', NULL, 'SYSTEM', 32, NULL),

    -- HO Category
    ('ho_sync', 'HO Pulse Sync', '/ho/sync', 'Globe', 'ho', 'HO', 'ho.sync', NULL, 'SYSTEM', 40, 'Alt+H'),

    -- SYSTEM Category
    ('sys_config', 'System Setup', '/settings/config', 'Settings', 'settings', 'SYSTEM', 'system.config', NULL, 'SYSTEM', 50, 'F10'),
    ('sys_print', 'Print Templates', '/settings/print', 'Printer', 'print', 'SYSTEM', 'system.print', NULL, 'SYSTEM', 51, NULL),
    ('sys_security', 'Security Matrix', '/settings/security', 'ShieldCheck', 'security', 'SYSTEM', 'system.security', NULL, 'SYSTEM', 52, NULL)
ON CONFLICT (id) DO NOTHING;
