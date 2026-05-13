-- ============================================================
-- SMRITI-OS v3.0 — Migration: Sovereign Schema Stabilization
-- Date: 2026-05-12
-- Author: Jawahar R Mallah / AITDL Network
-- ============================================================
-- Applies all schema fixes made during v3.0 stabilization:
--   1. UUID v7 primary keys on smriti_sale_hdr / smriti_sale_dtl
--   2. last_sync columns: server-side DEFAULT NOW() + nullable
--   3. smriti_sync_queue: offline sync queue table
--   4. smriti_sync_queue indexes for fast pending-row sweeps
--   5. Trigger function: trg_enqueue_sync (auto-WAL to queue)
--   6. Triggers on all 9 core transactional tables
-- ============================================================

BEGIN;

-- ── 1. UUID v7 columns on sale tables ──────────────────────
ALTER TABLE smriti_sale_hdr
    ADD COLUMN IF NOT EXISTS id UUID;

ALTER TABLE smriti_sale_dtl
    ADD COLUMN IF NOT EXISTS id     UUID,
    ADD COLUMN IF NOT EXISTS sale_id UUID;

-- (UUID assignment is performed by refactor_sales_uuid7.py
--  which is idempotent via WHERE id IS NULL)

-- ── 2. Promote UUID columns to primary keys ─────────────────
-- Only run if id is already populated (script must have run first)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'smriti_sale_hdr'
          AND constraint_type = 'PRIMARY KEY'
          AND constraint_name LIKE '%id%'
    ) THEN
        ALTER TABLE smriti_sale_hdr
            DROP CONSTRAINT IF EXISTS smriti_sale_hdr_pkey CASCADE;
        ALTER TABLE smriti_sale_hdr
            ADD PRIMARY KEY (id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'smriti_sale_dtl'
          AND constraint_type = 'PRIMARY KEY'
          AND constraint_name LIKE '%id%'
    ) THEN
        ALTER TABLE smriti_sale_dtl
            DROP CONSTRAINT IF EXISTS smriti_sale_dtl_pkey CASCADE;
        ALTER TABLE smriti_sale_dtl
            ADD PRIMARY KEY (id);

        ALTER TABLE smriti_sale_dtl
            ADD CONSTRAINT IF NOT EXISTS fk_sale_hdr
            FOREIGN KEY (sale_id) REFERENCES smriti_sale_hdr(id);
    END IF;
END $$;

-- ── 3. Fix last_sync defaults across all sovereign tables ───
DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'smriti_item', 'smriti_stock', 'smriti_sale_hdr', 'smriti_sale_dtl',
        'smriti_ad', 'smriti_param', 'smriti_lookup', 'smriti_lookup_map',
        'smriti_combo', 'smriti_staff', 'smriti_pay_mode', 'smriti_docno'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format(
            'ALTER TABLE %I ALTER COLUMN last_sync SET DEFAULT now();
             ALTER TABLE %I ALTER COLUMN last_sync DROP NOT NULL;',
            t, t
        );
    END LOOP;
END $$;

-- ── 4. Sync queue table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS smriti_sync_queue (
    id          BIGSERIAL    PRIMARY KEY,
    table_name  TEXT         NOT NULL,
    operation   TEXT         NOT NULL,   -- INSERT | UPDATE | DELETE
    record_json JSONB        NOT NULL,
    status      TEXT         NOT NULL DEFAULT 'PENDING',
    retry_count INT          NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    synced_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_status
    ON smriti_sync_queue (status, id);

CREATE INDEX IF NOT EXISTS idx_sync_queue_table_pending
    ON smriti_sync_queue (table_name, status)
    WHERE status = 'PENDING';

-- ── 5. Trigger function ──────────────────────────────────────
CREATE OR REPLACE FUNCTION trg_enqueue_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO smriti_sync_queue(table_name, operation, record_json)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD)::jsonb);
        RETURN OLD;
    ELSE
        INSERT INTO smriti_sync_queue(table_name, operation, record_json)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW)::jsonb);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ── 6. Attach triggers to all core tables ───────────────────
DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'smriti_item', 'smriti_stock',
        'smriti_sale_hdr', 'smriti_sale_dtl',
        'transactions', 'transaction_items',
        'stores', 'users', 'customers'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_sync ON %I', t, t);
        EXECUTE format(
            'CREATE TRIGGER trg_%I_sync
             AFTER INSERT OR UPDATE OR DELETE ON %I
             FOR EACH ROW EXECUTE FUNCTION trg_enqueue_sync()',
            t, t
        );
    END LOOP;
END $$;

COMMIT;
