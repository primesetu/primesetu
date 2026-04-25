-- ============================================================
-- PrimeSetu - Shoper9-Based Retail OS
-- Zero Cloud · Sovereign · AI-Governed
-- ============================================================
-- Migration: 001_float_to_numeric.sql
--
-- PURPOSE: Convert all monetary Float columns to NUMERIC(12,2)
-- Run this ONCE against your Supabase PostgreSQL database.
-- Safe to run on existing data — Postgres casts Float → Numeric exactly.
-- ============================================================

BEGIN;

-- ── inventory (products) ─────────────────────────────────────────────────────
-- First ensure basic columns exist if they are missing
ALTER TABLE inventory 
  ADD COLUMN IF NOT EXISTS mrp           NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS cost_price    NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS selling_price NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS sku           VARCHAR(50),
  ADD COLUMN IF NOT EXISTS name          VARCHAR(255),
  ADD COLUMN IF NOT EXISTS barcode       VARCHAR(50),
  ADD COLUMN IF NOT EXISTS hsn_code      VARCHAR(10),
  ADD COLUMN IF NOT EXISTS gst_rate      NUMERIC(5,2)  DEFAULT 18.00,
  ADD COLUMN IF NOT EXISTS stock_qty     INTEGER       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reorder_level INTEGER       DEFAULT 5,
  ADD COLUMN IF NOT EXISTS category      VARCHAR(100)  DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS is_active     BOOLEAN       DEFAULT true,
  ADD COLUMN IF NOT EXISTS store_id      VARCHAR       REFERENCES stores(id),
  ADD COLUMN IF NOT EXISTS created_at    TIMESTAMPTZ   DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ   DEFAULT now();

-- Then cast existing ones if they were already there (safe to repeat)
ALTER TABLE inventory
  ALTER COLUMN mrp            TYPE NUMERIC(12,2) USING mrp::NUMERIC(12,2),
  ALTER COLUMN cost_price     TYPE NUMERIC(12,2) USING cost_price::NUMERIC(12,2),
  ALTER COLUMN selling_price  TYPE NUMERIC(12,2) USING selling_price::NUMERIC(12,2);

-- ── bills ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    bill_number VARCHAR(30) UNIQUE NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE bills
  ALTER COLUMN total_amount TYPE NUMERIC(12,2) USING total_amount::NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS store_id         VARCHAR       REFERENCES stores(id),
  ADD COLUMN IF NOT EXISTS customer_phone   VARCHAR(15),
  ADD COLUMN IF NOT EXISTS customer_gstin   VARCHAR(15),
  ADD COLUMN IF NOT EXISTS bill_type        VARCHAR(10)   NOT NULL DEFAULT 'sale',
  ADD COLUMN IF NOT EXISTS payment_mode     VARCHAR(10)   NOT NULL DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS cashier_id       VARCHAR       REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS subtotal_amount  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS discount_amount  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS cgst_amount      NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS sgst_amount      NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS igst_amount      NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS total_tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS round_off        NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS is_cancelled     BOOLEAN       NOT NULL DEFAULT false;

-- ── bill_items ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(id),
    product_id UUID REFERENCES inventory(id),
    qty INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0.00
);

ALTER TABLE bill_items
  ALTER COLUMN unit_price TYPE NUMERIC(12,2) USING unit_price::NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS mrp_at_billing  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS hsn_code        VARCHAR(10),
  ADD COLUMN IF NOT EXISTS gst_rate        NUMERIC(5,2)  NOT NULL DEFAULT 18.00,
  ADD COLUMN IF NOT EXISTS taxable_amount  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS cgst_amount     NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS sgst_amount     NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS igst_amount     NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS line_total      NUMERIC(12,2) NOT NULL DEFAULT 0.00;

-- ── schemes ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    value NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    min_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00
);

ALTER TABLE schemes
  ADD COLUMN IF NOT EXISTS value NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS min_amount NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS store_id VARCHAR REFERENCES stores(id);

ALTER TABLE schemes
  ALTER COLUMN value      TYPE NUMERIC(12,2) USING value::NUMERIC(12,2),
  ALTER COLUMN min_amount TYPE NUMERIC(12,2) USING min_amount::NUMERIC(12,2);

-- ── tills ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    cash_collected NUMERIC(12,2) NOT NULL DEFAULT 0.00
);

ALTER TABLE tills
  ALTER COLUMN cash_collected TYPE NUMERIC(12,2) USING cash_collected::NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS store_id VARCHAR REFERENCES stores(id);

-- ── stores (new columns) ─────────────────────────────────────────────────────
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS state_code VARCHAR(2);

-- ── alerts (new columns) ─────────────────────────────────────────────────────
ALTER TABLE alerts
  ADD COLUMN IF NOT EXISTS store_id VARCHAR REFERENCES stores(id);

-- ── Indexes for performance ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bills_store_date
  ON bills(store_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_store_sku
  ON inventory(store_id, sku);

CREATE INDEX IF NOT EXISTS idx_inventory_barcode
  ON inventory(barcode) WHERE barcode IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bills_cancelled
  ON bills(store_id, is_cancelled, created_at DESC);

COMMIT;

-- ── Verification query (run manually after migration) ────────────────────────
-- SELECT column_name, data_type, numeric_precision, numeric_scale
-- FROM information_schema.columns
-- WHERE table_name IN ('bills', 'bill_items', 'inventory', 'schemes', 'tills')
--   AND column_name IN ('mrp', 'total_amount', 'unit_price', 'value', 'cash_collected', 'cost_price')
-- ORDER BY table_name, column_name;
