/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: create_warehouse_extensions
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

CREATE TABLE IF NOT EXISTS public.warehouse_item_extensions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    item_id     UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    warehouse_bin VARCHAR(50),
    warehouse_rack VARCHAR(50),
    least_salable_qty INTEGER DEFAULT 0,
    bulk_pack_qty INTEGER DEFAULT 0,
    is_fragile BOOLEAN DEFAULT false,
    handling_instructions TEXT,
    shoper_extd_recid INTEGER,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wh_item_ext_store_id ON public.warehouse_item_extensions(store_id);
CREATE INDEX IF NOT EXISTS idx_wh_item_ext_item_id ON public.warehouse_item_extensions(item_id);

-- ============================================================
-- RLS (MANDATORY — no table goes live without RLS)
-- ============================================================

ALTER TABLE public.warehouse_item_extensions ENABLE ROW LEVEL SECURITY;

-- Store isolation: users can only see their own store's data
CREATE POLICY "store_isolation_select" ON public.warehouse_item_extensions
    FOR SELECT USING (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

-- Insert: only authenticated users of this store
CREATE POLICY "store_isolation_insert" ON public.warehouse_item_extensions
    FOR INSERT WITH CHECK (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

-- Update: only authenticated users of this store
CREATE POLICY "store_isolation_update" ON public.warehouse_item_extensions
    FOR UPDATE USING (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

-- ============================================================
-- COMMENTS (helps future agents understand intent)
-- ============================================================

COMMENT ON TABLE public.warehouse_item_extensions IS
    'Warehouse-specific extensions for items mapping to shoper9wh1 ExtdItemMaster.';

-- ============================================================
-- TABLE: warehouse_physical_stock_taking
-- ============================================================

CREATE TABLE IF NOT EXISTS public.warehouse_physical_stock_taking (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    audit_id    UUID NOT NULL REFERENCES public.inventory_audits(id) ON DELETE CASCADE,
    item_id     UUID NOT NULL REFERENCES public.items(id),
    system_qty  INTEGER NOT NULL DEFAULT 0,
    physical_qty INTEGER NOT NULL DEFAULT 0,
    counted_by  UUID NOT NULL REFERENCES auth.users(id),
    zone_code   VARCHAR(50),
    status      VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COUNTED', 'VERIFIED')),
    shoper_recid INTEGER,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wh_phy_stock_store_id ON public.warehouse_physical_stock_taking(store_id);
CREATE INDEX IF NOT EXISTS idx_wh_phy_stock_audit_id ON public.warehouse_physical_stock_taking(audit_id);
CREATE INDEX IF NOT EXISTS idx_wh_phy_stock_created_at ON public.warehouse_physical_stock_taking(store_id, created_at DESC);

ALTER TABLE public.warehouse_physical_stock_taking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "phy_store_isolation_select" ON public.warehouse_physical_stock_taking
    FOR SELECT USING (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

CREATE POLICY "phy_store_isolation_insert" ON public.warehouse_physical_stock_taking
    FOR INSERT WITH CHECK (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

COMMENT ON TABLE public.warehouse_physical_stock_taking IS
    'Warehouse physical stock taking mapping to shoper9wh1 PhyTmpStockTakingItem.';

