/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: create_items
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- Core item / product master
CREATE TABLE IF NOT EXISTS public.items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    item_code       TEXT NOT NULL,                      -- user-defined, unique per store
    item_name       TEXT NOT NULL CHECK (char_length(item_name) <= 40),
    department_id   UUID NOT NULL REFERENCES public.departments(id),
    brand           TEXT,
    supplier_id     UUID REFERENCES public.partners(id) ON DELETE SET NULL,
    size_group_id   UUID REFERENCES public.size_groups(id) ON DELETE SET NULL,
    colour          TEXT,                               -- e.g. "Navy Blue"
    colour_code     TEXT,                               -- e.g. "NVY"
    mrp_paise       INTEGER NOT NULL CHECK (mrp_paise > 0),
    cost_paise      INTEGER CHECK (cost_paise > 0),
    gst_rate        SMALLINT NOT NULL CHECK (gst_rate IN (0,5,12,18,28)),
    hsn_code        TEXT NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, item_code)
);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Store isolation using current_store_id() helper
CREATE POLICY "store_isolation" ON public.items
    FOR ALL USING (store_id = current_store_id());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_items_store_code ON public.items(store_id, item_code);
CREATE INDEX IF NOT EXISTS idx_items_department ON public.items(department_id);
CREATE INDEX IF NOT EXISTS idx_items_supplier   ON public.items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_items_search     ON public.items USING gin(to_tsvector('english', item_code || ' ' || item_name));

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.items IS
    'Central product registry (Item Master). Each SKU is unique per store.';

COMMENT ON COLUMN public.items.item_name IS
    'Short name (max 40 chars) to ensure compatibility with 80mm thermal receipt printers.';

COMMENT ON COLUMN public.items.gst_rate IS
    'Standard Indian GST rates: 0, 5, 12, 18, 28.';
