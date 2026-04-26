/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: search_performance_indexes
 * © 2026 AITDL Network
 * ============================================================ */

-- Enable pg_trgm for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Indexes for items
CREATE INDEX IF NOT EXISTS idx_items_name_trgm ON public.items USING gin (item_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_items_code_trgm ON public.items USING gin (item_code gin_trgm_ops);

-- Indexes for partners (Customers/Vendors)
CREATE INDEX IF NOT EXISTS idx_partners_name_trgm ON public.partners USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_partners_phone_trgm ON public.partners USING gin (phone gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_partners_code_trgm ON public.partners USING gin (code gin_trgm_ops);

-- Composite indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_items_store_code ON public.items (store_id, item_code);
CREATE INDEX IF NOT EXISTS idx_partners_store_phone ON public.partners (store_id, phone);
