-- Phase 5: Operational Intelligence Migration
-- Purchase Orders, GRN, and Inventory Audit

-- 1. Purchase Orders
CREATE TABLE public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no TEXT NOT NULL,
    store_id UUID NOT NULL REFERENCES public.stores(id),
    supplier_id UUID NOT NULL REFERENCES public.partners(id),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'PARTIAL', 'RECEIVED', 'CANCELLED')),
    total_amount_paise INTEGER NOT NULL DEFAULT 0,
    expected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Purchase Order Items
CREATE TABLE public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id),
    size TEXT,
    colour TEXT,
    qty_ordered INTEGER NOT NULL CHECK (qty_ordered > 0),
    qty_received INTEGER NOT NULL DEFAULT 0,
    unit_cost_paise INTEGER NOT NULL DEFAULT 0,
    total_paise INTEGER GENERATED ALWAYS AS (qty_ordered * unit_cost_paise) STORED
);

-- 3. GRN (Goods Receipt Note)
CREATE TABLE public.grns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES public.purchase_orders(id),
    grn_no TEXT NOT NULL,
    received_at TIMESTAMPTZ DEFAULT now(),
    received_by UUID REFERENCES auth.users(id),
    remarks TEXT
);

-- 4. Inventory Audits
CREATE TABLE public.inventory_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_no TEXT NOT NULL,
    store_id UUID NOT NULL REFERENCES public.stores(id),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'SUBMITTED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT now(),
    submitted_at TIMESTAMPTZ
);

-- 5. Inventory Audit Items
CREATE TABLE public.inventory_audit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES public.inventory_audits(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id),
    size TEXT,
    colour TEXT,
    system_qty INTEGER NOT NULL DEFAULT 0,
    physical_qty INTEGER NOT NULL DEFAULT 0,
    variance INTEGER GENERATED ALWAYS AS (physical_qty - system_qty) STORED
);

-- RLS Enablement
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_audit_items ENABLE ROW LEVEL SECURITY;

-- Store Isolation Policies
CREATE POLICY store_isolation_po ON public.purchase_orders
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE POLICY store_isolation_po_items ON public.purchase_order_items
    FOR ALL USING (po_id IN (SELECT id FROM public.purchase_orders));

CREATE POLICY store_isolation_grn ON public.grns
    FOR ALL USING (po_id IN (SELECT id FROM public.purchase_orders));

CREATE POLICY store_isolation_audit ON public.inventory_audits
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE POLICY store_isolation_audit_items ON public.inventory_audit_items
    FOR ALL USING (audit_id IN (SELECT id FROM public.inventory_audits));

-- Indexes for performance
CREATE INDEX idx_po_store ON public.purchase_orders(store_id);
CREATE INDEX idx_po_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX idx_audit_store ON public.inventory_audits(store_id);
CREATE INDEX idx_po_items_po ON public.purchase_order_items(po_id);
CREATE INDEX idx_audit_items_audit ON public.inventory_audit_items(audit_id);
