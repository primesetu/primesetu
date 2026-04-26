/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: add_shoper9_dna_columns
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- Add Shoper 9 DNA columns to items
ALTER TABLE public.items 
    ADD COLUMN IF NOT EXISTS external_id TEXT,
    ADD COLUMN IF NOT EXISTS anal_codes  JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS user_fields  JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_items_external_id ON public.items(external_id);

-- Add Shoper 9 DNA columns to transactions
ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS external_id TEXT;

CREATE INDEX IF NOT EXISTS idx_transactions_external_id ON public.transactions(external_id);

-- Add Shoper 9 DNA columns to partners
ALTER TABLE public.partners
    ADD COLUMN IF NOT EXISTS external_id TEXT;

CREATE INDEX IF NOT EXISTS idx_partners_external_id ON public.partners(external_id);

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON COLUMN public.items.external_id IS 'Original Shoper 9 StockNo for legacy compatibility.';
COMMENT ON COLUMN public.items.anal_codes IS 'Stores Shoper 9 AnalCode1-32 as structured JSON.';
COMMENT ON COLUMN public.items.user_fields IS 'Stores Shoper 9 SField and NField custom attributes.';
