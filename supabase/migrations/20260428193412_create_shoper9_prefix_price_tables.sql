/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Migration: create_shoper9_prefix_price_tables
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- 1. Prefix Terminal Groups
CREATE TABLE IF NOT EXISTS public.prefix_terminal_groups (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    terminal_group_id   VARCHAR(32) NOT NULL,
    srl_no              INTEGER NOT NULL,
    terminal_id         VARCHAR(32),
    description         VARCHAR(128),
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT now(),
    UNIQUE(store_id, terminal_group_id, srl_no)
);

-- 2. Prefix Config
CREATE TABLE IF NOT EXISTS public.prefix_config (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id                UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    trn_type                VARCHAR(10) NOT NULL,
    trn_name                VARCHAR(128) NOT NULL,
    trn_sub_name            VARCHAR(128),
    op_id                   VARCHAR(10),
    is_active               BOOLEAN DEFAULT TRUE,
    terminal_wise_prefix    BOOLEAN DEFAULT FALSE,
    number_reset            INTEGER DEFAULT 0, -- 0: Never, 1: Monthly, 2: Yearly
    parent_trn_type         VARCHAR(10),
    created_at              TIMESTAMPTZ DEFAULT now(),
    UNIQUE(store_id, trn_type, op_id)
);

-- 3. Prefix Master
CREATE TABLE IF NOT EXISTS public.prefix_master (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    trn_type            VARCHAR(10) NOT NULL,
    op_id               VARCHAR(10) NOT NULL,
    terminal_group_id   VARCHAR(32) NOT NULL,
    srl_no              INTEGER NOT NULL,
    prefix              VARCHAR(8),
    base_prefix         VARCHAR(8),
    suffix              VARCHAR(8),
    is_active           BOOLEAN DEFAULT TRUE,
    reset_type          VARCHAR(16), -- Monthly, Yearly
    created_at          TIMESTAMPTZ DEFAULT now(),
    UNIQUE(store_id, trn_type, op_id, terminal_group_id, srl_no)
);

-- 4. Prefix Transaction Number Tracking
CREATE TABLE IF NOT EXISTS public.prefix_trn_no (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    trn_type        VARCHAR(10) NOT NULL,
    actual_prefix   VARCHAR(16) NOT NULL,
    doc_number      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    updated_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(store_id, trn_type, actual_prefix)
);

-- 5. Prefix Transaction Log (Audit)
CREATE TABLE IF NOT EXISTS public.prefix_trn_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    fld1            VARCHAR(16) NOT NULL, -- Prefix
    fld2            VARCHAR(10) NOT NULL, -- TrnType
    fld3            VARCHAR(10),          -- OpId
    fld4            INTEGER NOT NULL,     -- DocNo
    user_id         UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 6. Price Range Settings
CREATE TABLE IF NOT EXISTS public.price_range_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    fld_type        INTEGER NOT NULL,
    fld_id          INTEGER NOT NULL,
    fld_name        VARCHAR(64),
    fld_caption     VARCHAR(64),
    fld_enabled     BOOLEAN DEFAULT TRUE,
    fld_order       INTEGER,
    UNIQUE(store_id, fld_type, fld_id)
);

-- 7. Price Range
CREATE TABLE IF NOT EXISTS public.price_range (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    price_type          INTEGER NOT NULL,
    doc_no_prefix       VARCHAR(16) NOT NULL,
    doc_no              INTEGER NOT NULL,
    srl_no              INTEGER NOT NULL,
    start_date          TIMESTAMPTZ,
    end_date            TIMESTAMPTZ,
    stock_no            VARCHAR(32),
    selling_price_paise INTEGER NOT NULL DEFAULT 0,
    min_price_paise     INTEGER DEFAULT 0,
    max_price_paise     INTEGER DEFAULT 0,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT now(),
    UNIQUE(store_id, price_type, doc_no_prefix, doc_no, srl_no)
);

-- 8. Price Revision
CREATE TABLE IF NOT EXISTS public.price_revision (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    doc_no              INTEGER NOT NULL,
    file_number         VARCHAR(32),
    stock_no            VARCHAR(32),
    effective_date      TIMESTAMPTZ,
    retail_price_paise  INTEGER NOT NULL DEFAULT 0,
    dealer_price_paise  INTEGER DEFAULT 0,
    is_approved         BOOLEAN DEFAULT FALSE,
    shoper_date         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT now()
);

-- 9. Price Revision History
CREATE TABLE IF NOT EXISTS public.price_revision_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    revision_id         UUID REFERENCES public.price_revision(id),
    stock_no            VARCHAR(32),
    old_price_paise     INTEGER,
    new_price_paise     INTEGER,
    changed_by          UUID REFERENCES auth.users(id),
    created_at          TIMESTAMPTZ DEFAULT now()
);

-- 10. Prefix Doc Log (Audit)
CREATE TABLE IF NOT EXISTS public.prefix_doc_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    trn_type        VARCHAR(10),
    prefix          VARCHAR(16),
    doc_no          INTEGER,
    err_desc        TEXT,
    user_id         VARCHAR(32),
    terminal_id     VARCHAR(32),
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 11. Price Loading Log
CREATE TABLE IF NOT EXISTS public.price_loading_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    sku             VARCHAR(50),
    old_mrp_paise   INTEGER,
    new_mrp_paise   INTEGER,
    status          INTEGER,
    remarks         TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 12. Price Range Category Details
CREATE TABLE IF NOT EXISTS public.price_range_cat_dtls (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    pr_cat_id       INTEGER NOT NULL,
    srl_no          INTEGER NOT NULL,
    pr_cat_code     VARCHAR(16),
    pr_cat_name     VARCHAR(32),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(store_id, pr_cat_id, srl_no)
);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'prefix_terminal_groups', 'prefix_config', 'prefix_master', 
            'prefix_trn_no', 'prefix_trn_log', 'prefix_doc_log',
            'price_range_settings', 'price_range', 'price_range_cat_dtls',
            'price_revision', 'price_revision_history', 'price_loading_log'
        )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        
        EXECUTE format('
            CREATE POLICY "store_isolation_select" ON public.%I
            FOR SELECT USING (
                store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)
            )', t);

        -- Audit tables (log/history) don't get Update/Delete policies
        IF t NOT IN ('prefix_trn_log', 'price_revision_history', 'prefix_doc_log', 'price_loading_log') THEN
            EXECUTE format('
                CREATE POLICY "store_isolation_all" ON public.%I
                FOR ALL WITH CHECK (
                    store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)
                )', t);
        ELSE
            EXECUTE format('
                CREATE POLICY "store_isolation_insert" ON public.%I
                FOR INSERT WITH CHECK (
                    store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)
                )', t);
        END IF;
    END LOOP;
END $$;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_prefix_trn_no_lookup ON public.prefix_trn_no(store_id, trn_type, actual_prefix);
CREATE INDEX idx_price_range_lookup ON public.price_range(store_id, stock_no, is_active);
CREATE INDEX idx_price_revision_stock ON public.price_revision(store_id, stock_no);
