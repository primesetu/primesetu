/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: phase7_promo_engine
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- Drop old simple schemes if we are migrating to the real engine
-- (In production, you'd migrate data, but we'll build alongside for now)

-- 1. Promo Header
CREATE TABLE IF NOT EXISTS public.promo_header (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id      UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    promo_code    TEXT NOT NULL,
    description   TEXT NOT NULL,
    promo_type    TEXT NOT NULL CHECK (promo_type IN ('BILL_LEVEL', 'ITEM_LEVEL', 'BUY_GET')),
    priority      INTEGER NOT NULL DEFAULT 1,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    valid_from    TIMESTAMPTZ NOT NULL,
    valid_to      TIMESTAMPTZ NOT NULL,
    happy_hours   JSONB, -- e.g., {"start": "14:00", "end": "18:00", "days": [1,2,3,4,5]}
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_promo_hdr_store_active ON public.promo_header(store_id, is_active);

-- 2. Promo Bill Level Discounts
CREATE TABLE IF NOT EXISTS public.promo_bill_disc (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_id      UUID NOT NULL REFERENCES public.promo_header(id) ON DELETE CASCADE,
    min_bill_amt  INTEGER NOT NULL, -- in paise
    max_bill_amt  INTEGER, -- in paise
    disc_type     TEXT NOT NULL CHECK (disc_type IN ('PERCENTAGE', 'FLAT_AMOUNT')),
    disc_value    INTEGER NOT NULL, -- either % (10 = 10%) or flat amount in paise
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Promo Buy X Get Y
CREATE TABLE IF NOT EXISTS public.promo_buy_get (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_id      UUID NOT NULL REFERENCES public.promo_header(id) ON DELETE CASCADE,
    buy_item_id   UUID REFERENCES public.items(id),
    buy_qty       INTEGER NOT NULL,
    get_item_id   UUID REFERENCES public.items(id),
    get_qty       INTEGER NOT NULL,
    get_disc_pct  INTEGER NOT NULL DEFAULT 100, -- 100% = Free
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

ALTER TABLE public.promo_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_bill_disc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_buy_get ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_isolation_select_promo_hdr" ON public.promo_header
    FOR SELECT USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation_insert_promo_hdr" ON public.promo_header
    FOR INSERT WITH CHECK (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation_update_promo_hdr" ON public.promo_header
    FOR UPDATE USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));

CREATE POLICY "store_isolation_select_promo_bill" ON public.promo_bill_disc
    FOR SELECT USING (promo_id IN (SELECT id FROM public.promo_header WHERE store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)));
CREATE POLICY "store_isolation_insert_promo_bill" ON public.promo_bill_disc
    FOR INSERT WITH CHECK (promo_id IN (SELECT id FROM public.promo_header WHERE store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)));

CREATE POLICY "store_isolation_select_promo_buy" ON public.promo_buy_get
    FOR SELECT USING (promo_id IN (SELECT id FROM public.promo_header WHERE store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)));
CREATE POLICY "store_isolation_insert_promo_buy" ON public.promo_buy_get
    FOR INSERT WITH CHECK (promo_id IN (SELECT id FROM public.promo_header WHERE store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)));
