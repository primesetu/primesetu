/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: create_general_lookup
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- GeneralLookup: dynamic system constants (replaces hardcoded enums)
CREATE TABLE IF NOT EXISTS public.general_lookup (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID REFERENCES public.stores(id) ON DELETE CASCADE,  -- NULL = system-wide
    category    TEXT NOT NULL,      -- 'payment_mode' | 'colour' | 'season' | 'size_group' | 'tax_category'
    code        TEXT NOT NULL,      -- short key, e.g. "UPI", "NVY", "SS26"
    label       TEXT NOT NULL,      -- display name, e.g. "UPI Payment", "Navy Blue"
    sort_order  SMALLINT DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    meta        JSONB,              -- extra props (e.g. colour_hex for colour entries)
    UNIQUE (store_id, category, code)
);

-- Index for common query patterns
CREATE INDEX IF NOT EXISTS idx_general_lookup_cat
    ON public.general_lookup(store_id, category);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

ALTER TABLE public.general_lookup ENABLE ROW LEVEL SECURITY;

-- Store isolation or system-wide (NULL store_id)
CREATE POLICY "store_isolation_or_system_select" ON public.general_lookup
    FOR SELECT USING (
        store_id IS NULL OR
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

-- Insert: only authenticated users of this store
CREATE POLICY "store_isolation_insert" ON public.general_lookup
    FOR INSERT WITH CHECK (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

-- Update: only authenticated users of this store
CREATE POLICY "store_isolation_update" ON public.general_lookup
    FOR UPDATE USING (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    ) WITH CHECK (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

-- ============================================================
-- SEED DATA
-- ============================================================

-- Payment modes
INSERT INTO public.general_lookup (store_id, category, code, label, sort_order)
VALUES
  (NULL, 'payment_mode', 'CASH', 'Cash',        1),
  (NULL, 'payment_mode', 'UPI',  'UPI',          2),
  (NULL, 'payment_mode', 'CARD', 'Card',         3),
  (NULL, 'payment_mode', 'CRED', 'Store Credit', 4)
ON CONFLICT (store_id, category, code) DO NOTHING;

-- GST tax categories
INSERT INTO public.general_lookup (store_id, category, code, label, sort_order)
VALUES
  (NULL, 'tax_category', 'GST0',  'GST Exempt (0%)',   1),
  (NULL, 'tax_category', 'GST5',  'GST 5%',            2),
  (NULL, 'tax_category', 'GST12', 'GST 12%',           3),
  (NULL, 'tax_category', 'GST18', 'GST 18%',           4),
  (NULL, 'tax_category', 'GST28', 'GST 28%',           5)
ON CONFLICT (store_id, category, code) DO NOTHING;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.general_lookup IS
    'Dynamic system constants and lookup values (Payment modes, Tax categories, Colours, etc.)';

COMMENT ON COLUMN public.general_lookup.store_id IS
    'The store this lookup belongs to. NULL means it is a system-wide default.';
