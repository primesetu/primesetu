/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: create_item_stock
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- Stock matrix: quantity per size per colour per store
CREATE TABLE IF NOT EXISTS public.item_stock (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    size            TEXT NOT NULL,                      -- must be in size_group.sizes array
    colour          TEXT NOT NULL,
    qty_on_hand     INTEGER NOT NULL DEFAULT 0,
    qty_reserved    INTEGER NOT NULL DEFAULT 0,         -- in open orders
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (item_id, store_id, size, colour)
);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

ALTER TABLE public.item_stock ENABLE ROW LEVEL SECURITY;

-- Store isolation using current_store_id() helper
CREATE POLICY "store_isolation" ON public.item_stock
    FOR ALL USING (store_id = current_store_id());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_item_stock_item ON public.item_stock(item_id, store_id);
CREATE INDEX IF NOT EXISTS idx_item_stock_store ON public.item_stock(store_id);

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.item_stock IS
    'Real-time inventory levels per size/colour variant (Size-wise Stock Matrix).';
