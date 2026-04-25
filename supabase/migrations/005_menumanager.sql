-- Migration: 005_menumanager.sql
-- Phase: MISS-001 (MenuManager Engine)

CREATE TABLE IF NOT EXISTS public.menu_items (
    id VARCHAR(100) PRIMARY KEY,
    label VARCHAR(200) NOT NULL,
    route VARCHAR(300) NOT NULL,
    icon VARCHAR(100),
    module VARCHAR(100) NOT NULL,
    
    -- [ENFORCER STAGE INTERVENTION]
    -- The prompt requested 'roles[]'. This was rejected by the Enforcer 
    -- as it violates AGENTS.md Rule 3: "PERMISSIONS OVER ROLES (ANTI-EXPLOSION)".
    -- Implemented 'required_permission' instead.
    required_permission VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- Added for Sidebar grouping
    parent_id VARCHAR(100) REFERENCES public.menu_items(id),
    tenant_id VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    shortcut VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1. Enable Row Level Security (RLS) per aiprotocol.md
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policy: Users can only read menus for their tenant (store_id) or SYSTEM defaults
CREATE POLICY "Users can view menus for their store"
    ON public.menu_items
    FOR SELECT
    USING (
        tenant_id = (auth.jwt() ->> 'store_id')
        OR tenant_id = 'SYSTEM'
    );

-- 3. Required Indexes
CREATE INDEX IF NOT EXISTS idx_menu_tenant ON public.menu_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_module ON public.menu_items(module);
CREATE INDEX IF NOT EXISTS idx_menu_category ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_parent ON public.menu_items(parent_id);

-- 4. Seed Data (with terminal mode hotkeys)
INSERT INTO public.menu_items (id, label, route, icon, module, category, required_permission, parent_id, tenant_id, sort_order, shortcut)
VALUES 
    ('dashboard', 'Overview', '/dashboard', 'LayoutDashboard', 'dashboard', 'POS', 'dashboard.view', NULL, 'SYSTEM', 0, 'F12'),
    ('pos_billing', 'Billing (POS)', '/sales', 'ShoppingCart', 'sales', 'POS', 'billing.access', NULL, 'SYSTEM', 1, 'F1'),
    ('inv_registry', 'Item Master', '/inventory/registry', 'Package', 'inventory', 'WAREHOUSE', 'inventory.view', NULL, 'SYSTEM', 2, 'F2'),
    ('fin_reports', 'MIS Reports', '/analytics/mis', 'BarChart3', 'analytics', 'FINANCE', 'reports.view', NULL, 'SYSTEM', 3, 'F3')
ON CONFLICT (id) DO NOTHING;
