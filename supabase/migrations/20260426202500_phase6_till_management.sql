/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: phase6_till_management
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- 1. Till Sessions (Day Begin / Day End / Z-Read)
CREATE TABLE IF NOT EXISTS public.till_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    opened_by           UUID NOT NULL REFERENCES auth.users(id),
    closed_by           UUID REFERENCES auth.users(id),
    opened_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at           TIMESTAMPTZ,
    status              TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED')),
    opening_float       INTEGER NOT NULL DEFAULT 0, -- Stored in paise
    expected_closing    INTEGER,
    actual_closing      INTEGER,
    variance            INTEGER,
    z_read_data         JSONB, -- Snapshots of sales totals
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_till_sessions_store_status ON public.till_sessions(store_id, status);

-- 2. POS Cash Transactions (Petty Cash, Safe Drops, Float Adds)
CREATE TABLE IF NOT EXISTS public.pos_cash_trn (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    till_session_id     UUID NOT NULL REFERENCES public.till_sessions(id),
    user_id             UUID NOT NULL REFERENCES auth.users(id),
    trn_type            TEXT NOT NULL CHECK (trn_type IN ('FLOAT_ADD', 'SAFE_DROP', 'EXPENSE', 'INCOME')),
    amount              INTEGER NOT NULL, -- Stored in paise
    remarks             TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_cash_trn_till ON public.pos_cash_trn(till_session_id);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

ALTER TABLE public.till_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_cash_trn ENABLE ROW LEVEL SECURITY;

-- Till Sessions Policies
CREATE POLICY "store_isolation_select_till" ON public.till_sessions
    FOR SELECT USING (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

CREATE POLICY "store_isolation_insert_till" ON public.till_sessions
    FOR INSERT WITH CHECK (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

CREATE POLICY "store_isolation_update_till" ON public.till_sessions
    FOR UPDATE USING (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

-- POS Cash Trn Policies
CREATE POLICY "store_isolation_select_cash" ON public.pos_cash_trn
    FOR SELECT USING (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

CREATE POLICY "store_isolation_insert_cash" ON public.pos_cash_trn
    FOR INSERT WITH CHECK (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON TABLE public.till_sessions IS 'Tracks Day Begin and Day End (Z-Read) cycles per store/till.';
COMMENT ON TABLE public.pos_cash_trn IS 'Logs manual cash drawer operations (Petty cash, safe drops).';

-- Till Hardware Table
CREATE TABLE IF NOT EXISTS public.till_hardware (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.till_hardware ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_isolation_select_till_hw" ON public.till_hardware FOR SELECT USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation_insert_till_hw" ON public.till_hardware FOR INSERT WITH CHECK (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));

