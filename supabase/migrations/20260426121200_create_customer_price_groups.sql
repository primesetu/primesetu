/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: create_customer_price_groups
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- Customer Price Groups (Retail, Wholesale, Staff, etc.)
CREATE TABLE IF NOT EXISTS public.customer_price_groups (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,              -- "Wholesale", "Staff", "VIP"
    code                TEXT NOT NULL,              -- short code, e.g. "WHL", "STF", "VIP"
    price_level         TEXT CHECK (price_level IN ('mrp','wholesale','staff','custom_1','custom_2')),
    discount_pct        NUMERIC(5,2) DEFAULT 0 CHECK (discount_pct >= 0 AND discount_pct <= 100),
    is_taxable          BOOLEAN NOT NULL DEFAULT true,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, code)
);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

ALTER TABLE public.customer_price_groups ENABLE ROW LEVEL SECURITY;

-- Store isolation using current_store_id() helper
CREATE POLICY "store_isolation" ON public.customer_price_groups
    FOR ALL USING (store_id = current_store_id());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_price_groups_store ON public.customer_price_groups(store_id);
CREATE INDEX IF NOT EXISTS idx_price_groups_code ON public.customer_price_groups(store_id, code);

-- ============================================================
-- SEED DATA (For existing stores)
-- ============================================================

INSERT INTO public.customer_price_groups (store_id, name, code, price_level, discount_pct)
SELECT id, 'Retail MRP', 'MRP', 'mrp', 0 FROM public.stores
ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO public.customer_price_groups (store_id, name, code, price_level, discount_pct)
SELECT id, 'Wholesale', 'WHL', 'wholesale', 0 FROM public.stores
ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO public.customer_price_groups (store_id, name, code, price_level, discount_pct)
SELECT id, 'Staff', 'STF', 'staff', 0 FROM public.stores
ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO public.customer_price_groups (store_id, name, code, price_level, discount_pct)
SELECT id, 'VIP 10% Off', 'VIP', NULL, 10.00 FROM public.stores
ON CONFLICT (store_id, code) DO NOTHING;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.customer_price_groups IS
    'Configuration for customer-specific pricing (e.g. Wholesale prices or Staff discounts).';

COMMENT ON COLUMN public.customer_price_groups.price_level IS
    'The item_price_level to use for this group. If set, this takes precedence over discount_pct.';

COMMENT ON COLUMN public.customer_price_groups.discount_pct IS
    'Flat percentage off MRP to apply if no price_level is specified.';
