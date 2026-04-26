/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: create_size_groups
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- Size groups (e.g. "Apparel S/M/L", "Footwear 6-11")
CREATE TABLE IF NOT EXISTS public.size_groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,                          -- "UK Footwear"
    sizes       TEXT[] NOT NULL,                        -- ["6","7","8","9","10","11"]
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, name)
);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

ALTER TABLE public.size_groups ENABLE ROW LEVEL SECURITY;

-- Store isolation: users can only see their own store's data
-- Using the current_store_id() helper defined in 002_rls_policies.sql
CREATE POLICY "store_isolation" ON public.size_groups
    FOR ALL USING (store_id = current_store_id());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_size_groups_store_id ON public.size_groups(store_id);

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.size_groups IS
    'Size matrices for items (e.g. "Apparel S/M/L"). Used to validate stock entries.';

COMMENT ON COLUMN public.size_groups.sizes IS
    'Ordered array of valid size labels in this group.';
