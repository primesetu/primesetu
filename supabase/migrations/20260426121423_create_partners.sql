/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: create_partners
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- Single table for Customers, Vendors, Salespersons (Shoper9 "Partner" model)
CREATE TABLE IF NOT EXISTS public.partners (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    partner_type    TEXT NOT NULL CHECK (partner_type IN ('customer','vendor','salesperson','both')),
    code            TEXT NOT NULL,                  -- Shoper9-style short code, e.g. "C0001", "V001"
    name            TEXT NOT NULL,
    phone           TEXT,
    email           TEXT,
    gstin           TEXT,                           -- 15-char GSTIN for B2B customers
    address_line1   TEXT,
    address_line2   TEXT,
    city            TEXT,
    state_code      TEXT,                           -- 2-char state code for GST (e.g. "27" = Maharashtra)
    pincode         TEXT,
    credit_limit_paise INTEGER DEFAULT 0 CHECK (credit_limit_paise >= 0),
    credit_days     SMALLINT DEFAULT 0 CHECK (credit_days >= 0),
    price_group_id  UUID REFERENCES public.customer_price_groups(id) ON DELETE SET NULL,
    loyalty_points  INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, code)
);

-- Customer account ledger (credit/payment tracking)
CREATE TABLE IF NOT EXISTS public.customer_ledger (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    partner_id      UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    txn_type        TEXT NOT NULL CHECK (txn_type IN ('invoice','payment','credit_note','adjustment')),
    txn_ref         TEXT NOT NULL,          -- invoice_no or payment ref
    amount_paise    INTEGER NOT NULL,       -- positive = charge, negative = payment/CN
    balance_paise   INTEGER NOT NULL,       -- running balance after this entry
    txn_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Loyalty points ledger
CREATE TABLE IF NOT EXISTS public.loyalty_ledger (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    partner_id      UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    txn_type        TEXT NOT NULL CHECK (txn_type IN ('earn','redeem','expire','adjust')),
    points          INTEGER NOT NULL,       -- positive = earn, negative = redeem/expire
    balance         INTEGER NOT NULL,       -- running balance
    sale_id         UUID,                   -- FK to sales table (Step 11)
    txn_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

ALTER TABLE public.partners        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_ledger  ENABLE ROW LEVEL SECURITY;

-- Store isolation using current_store_id() helper
CREATE POLICY "store_isolation" ON public.partners
    FOR ALL USING (store_id = current_store_id());

CREATE POLICY "store_isolation" ON public.customer_ledger
    FOR ALL USING (store_id = current_store_id());

CREATE POLICY "store_isolation" ON public.loyalty_ledger
    FOR ALL USING (store_id = current_store_id());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_partners_store_type   ON public.partners(store_id, partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_store_code   ON public.partners(store_id, code);
CREATE INDEX IF NOT EXISTS idx_partners_phone        ON public.partners(store_id, phone);
CREATE INDEX IF NOT EXISTS idx_customer_ledger_ptr   ON public.customer_ledger(store_id, partner_id, txn_date DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_ptr    ON public.loyalty_ledger(store_id, partner_id, txn_date DESC);

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.partners IS
    'Unified registry for Customers, Vendors, and Salespersons.';

COMMENT ON COLUMN public.partners.gstin IS
    '15-character GSTIN. Should be validated against regex pattern server-side.';

COMMENT ON COLUMN public.partners.state_code IS
    '2-digit Indian state code (e.g., 27 for MH) used for IGST/CGST/SGST routing.';
