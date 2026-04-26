/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: create_item_price_levels
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- Price levels per item (MRP, Wholesale, Staff, etc.)
CREATE TABLE IF NOT EXISTS public.item_price_levels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    price_level     TEXT NOT NULL CHECK (price_level IN ('mrp','wholesale','staff','custom_1','custom_2')),
    price_paise     INTEGER NOT NULL CHECK (price_paise > 0),
    valid_from      DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (item_id, price_level, valid_from)
);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

ALTER TABLE public.item_price_levels ENABLE ROW LEVEL SECURITY;

-- Store isolation using current_store_id() helper
CREATE POLICY "store_isolation" ON public.item_price_levels
    FOR ALL USING (store_id = current_store_id());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_item_price_item ON public.item_price_levels(item_id, price_level);
CREATE INDEX IF NOT EXISTS idx_item_price_store ON public.item_price_levels(store_id);

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.item_price_levels IS
    'Historical and current prices for items at different levels (e.g. Wholesale, Staff).';
