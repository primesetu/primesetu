/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: create_departments
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- Department hierarchy (dept → category → sub-category)
CREATE TABLE IF NOT EXISTS public.departments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    code        TEXT NOT NULL,
    parent_id   UUID REFERENCES public.departments(id) ON DELETE SET NULL,  -- NULL = top level
    level       SMALLINT NOT NULL CHECK (level IN (1,2,3)),  -- 1=dept, 2=cat, 3=subcat
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, code)
);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Store isolation using current_store_id() helper
CREATE POLICY "store_isolation" ON public.departments
    FOR ALL USING (store_id = current_store_id());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_departments_store_id ON public.departments(store_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON public.departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_departments_level ON public.departments(store_id, level);

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.departments IS
    '3-level product classification hierarchy (Department -> Category -> Sub-category).';

COMMENT ON COLUMN public.departments.level IS
    '1 = Department, 2 = Category, 3 = Sub-category.';
