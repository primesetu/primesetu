-- ============================================================
-- SMRITI-OS — R2 Migration
-- Phase: R2 — Transaction Atomicity + Idempotency
-- Architect: Jawahar R Mallah
-- Date: 2026-05-15
-- ============================================================
-- Adds the billing idempotency registry table.
-- UNIQUE(store_id, key) enforces per-store uniqueness.
-- Keys expire after 24 hours (safe retry window).
-- This table is written INSIDE the billing transaction.
-- Safe to run multiple times (idempotent migration).
-- ============================================================

CREATE TABLE IF NOT EXISTS smriti_idempotency (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key             UUID        NOT NULL,
    store_id        TEXT        NOT NULL,
    transaction_id  UUID        NOT NULL,
    bill_no         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',

    -- [R2] Uniqueness is per-store.
    -- Same UUID from different stores is allowed (multi-tenant safety).
    CONSTRAINT uq_idempotency_store_key UNIQUE (store_id, key)
);

-- Index for fast replay lookup
CREATE INDEX IF NOT EXISTS ix_smriti_idempotency_key
    ON smriti_idempotency (key);

CREATE INDEX IF NOT EXISTS ix_smriti_idempotency_store_id
    ON smriti_idempotency (store_id);

-- Index for cleanup job: DELETE WHERE expires_at < NOW()
CREATE INDEX IF NOT EXISTS ix_smriti_idempotency_expires_at
    ON smriti_idempotency (expires_at);

-- ============================================================
-- Verification query (run after migration):
-- SELECT COUNT(*) FROM smriti_idempotency;  -- should return 0
-- ============================================================
