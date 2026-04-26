/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: stabilize_purchase_orders
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- Drop old tables if they exist (clean slate for Phase 5)
DROP TABLE IF EXISTS public.purchase_order_items CASCADE;
DROP TABLE IF EXISTS public.purchase_orders CASCADE;

-- 1. Purchase Orders (Header)
CREATE TABLE public.purchase_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    vendor_id       UUID NOT NULL REFERENCES public.partners(id),
    po_number       TEXT NOT NULL, -- e.g., PO/2026/0001
    status          TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'CANCELLED', 'CLOSED')),
    total_paise     INTEGER NOT NULL DEFAULT 0,
    tax_paise       INTEGER NOT NULL DEFAULT 0,
    other_charges_paise INTEGER NOT NULL DEFAULT 0,
    notes           TEXT,
    expected_date   DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      UUID REFERENCES auth.users(id),
    
    UNIQUE (store_id, po_number)
);

-- 2. Purchase Order Items (Detail)
CREATE TABLE public.purchase_order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id           UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    item_id         UUID NOT NULL REFERENCES public.items(id),
    size            TEXT,
    colour          TEXT,
    qty_ordered     INTEGER NOT NULL CHECK (qty_ordered > 0),
    qty_received    INTEGER NOT NULL DEFAULT 0 CHECK (qty_received >= 0),
    unit_cost_paise INTEGER NOT NULL CHECK (unit_cost_paise >= 0),
    tax_rate        SMALLINT NOT NULL DEFAULT 0 CHECK (tax_rate IN (0,5,12,18,28)),
    tax_paise       INTEGER NOT NULL DEFAULT 0,
    total_paise     INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_po_store_id ON public.purchase_orders(store_id);
CREATE INDEX idx_po_created_at ON public.purchase_orders(store_id, created_at DESC);
CREATE INDEX idx_po_items_po_id ON public.purchase_order_items(po_id);

-- RLS Enforcement
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- PO Header Policy
CREATE POLICY "store_isolation_po" ON public.purchase_orders
    FOR ALL USING (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

-- PO Items Policy
CREATE POLICY "store_isolation_po_items" ON public.purchase_order_items
    FOR ALL USING (
        po_id IN (
            SELECT id FROM public.purchase_orders
            WHERE store_id = (
                SELECT store_id FROM public.store_users
                WHERE user_id = auth.uid()
                LIMIT 1
            )
        )
    );

-- 3. Goods Receipt Note (GRN Header)
CREATE TABLE IF NOT EXISTS public.grns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    po_id           UUID REFERENCES public.purchase_orders(id),
    grn_number      TEXT NOT NULL, -- e.g., GRN/2026/0001
    received_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    received_by     UUID NOT NULL REFERENCES auth.users(id),
    vendor_id       UUID NOT NULL REFERENCES public.partners(id),
    notes           TEXT,
    
    UNIQUE (store_id, grn_number)
);

-- 4. GRN Items (Detail)
CREATE TABLE IF NOT EXISTS public.grn_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_id          UUID NOT NULL REFERENCES public.grns(id) ON DELETE CASCADE,
    po_item_id      UUID REFERENCES public.purchase_order_items(id),
    item_id         UUID NOT NULL REFERENCES public.items(id),
    size            TEXT,
    colour          TEXT,
    qty_received    INTEGER NOT NULL CHECK (qty_received > 0),
    unit_cost_paise INTEGER NOT NULL CHECK (unit_cost_paise >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for GRN
ALTER TABLE public.grns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grn_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_isolation_grn" ON public.grns
    FOR ALL USING (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

CREATE POLICY "store_isolation_grn_items" ON public.grn_items
    FOR ALL USING (
        grn_id IN (
            SELECT id FROM public.grns
            WHERE store_id = (
                SELECT store_id FROM public.store_users
                WHERE user_id = auth.uid()
                LIMIT 1
            )
        )
    );

-- Comments
COMMENT ON TABLE public.grns IS 'Goods Receipt Notes for stock inwarding.';
COMMENT ON TABLE public.grn_items IS 'Line items for Goods Receipt Notes.';
