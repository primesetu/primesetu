/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: create_item_barcodes
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- Barcodes / GTINs per item/variant
CREATE TABLE IF NOT EXISTS public.item_barcodes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    item_id         UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    barcode         TEXT NOT NULL,
    barcode_type    TEXT NOT NULL CHECK (barcode_type IN ('EAN13','CODE128','QR','INTERNAL')),
    size            TEXT,           -- NULL = applies to all sizes of this item
    colour          TEXT,           -- NULL = applies to all colours of this item
    is_primary      BOOLEAN NOT NULL DEFAULT false,  -- one primary per item
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, barcode)      -- barcode must be globally unique per store
);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

ALTER TABLE public.item_barcodes ENABLE ROW LEVEL SECURITY;

-- Store isolation using current_store_id() helper
CREATE POLICY "store_isolation" ON public.item_barcodes
    FOR ALL USING (store_id = current_store_id());

-- ============================================================
-- INDEXES
-- ============================================================

-- CRITICAL: index for POS scan lookup (< 50ms requirement)
CREATE UNIQUE INDEX IF NOT EXISTS idx_barcodes_store_barcode ON public.item_barcodes(store_id, barcode);
CREATE INDEX IF NOT EXISTS idx_barcodes_item ON public.item_barcodes(item_id, store_id);

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.item_barcodes IS
    'Barcode registry (GTINStudio). Supports multiple barcodes (Brand + Internal) per SKU.';
