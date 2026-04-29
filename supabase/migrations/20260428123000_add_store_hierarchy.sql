/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Migration: add_store_hierarchy
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- Create enum for hierarchy roles
CREATE TYPE store_hierarchy_role AS ENUM ('standalone', 'head_office', 'branch', 'franchise');

-- Add hierarchy columns to stores
ALTER TABLE public.stores 
    ADD COLUMN hierarchy_role store_hierarchy_role NOT NULL DEFAULT 'standalone',
    ADD COLUMN parent_id UUID REFERENCES public.stores(id) ON DELETE RESTRICT;

-- Index for fast tree traversal
CREATE INDEX idx_stores_parent_id ON public.stores(parent_id);

-- ============================================================
-- RLS ENHANCEMENT (HO Access to Branches)
-- ============================================================

-- Drop the old simple policy
DROP POLICY IF EXISTS "users see own store" ON public.stores;

-- Create the new hierarchical policy
-- A user can see a store if:
-- 1. It is their own store.
-- 2. Their store is the parent of the target store (HO -> Branch).
CREATE POLICY "hierarchical_store_access" ON public.stores
  FOR SELECT USING (
    id = current_store_id() 
    OR parent_id = current_store_id()
  );

-- Note: In Phase 6, we will expand this RLS logic to bills, stock, etc.
-- For now, this establishes the Sovereign structural backbone.

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON COLUMN public.stores.hierarchy_role IS 'Defines structural role: standalone, head_office, branch, franchise';
COMMENT ON COLUMN public.stores.parent_id IS 'References the Head Office or Parent Franchisee. Null for standalone/HO.';
