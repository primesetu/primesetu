-- ============================================================
-- PrimeSetu — Shoper9-Based Retail OS
-- Zero Cloud · Sovereign · AI-Governed
-- System Architect : Jawahar R. M. | © 2026
-- "Memory, Not Code."
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUMS ──────────────────────────────────────────────────
CREATE TYPE bill_status  AS ENUM ('draft','confirmed','cancelled');
CREATE TYPE stock_status AS ENUM ('ok','low','critical','out');
CREATE TYPE user_role    AS ENUM ('owner','manager','cashier','viewer');
CREATE TYPE scheme_type  AS ENUM ('flat','percent','bxgy','combo');
CREATE TYPE ledger_type  AS ENUM ('sale','purchase','payment','receipt','journal');

-- ── STORES ────────────────────────────────────────────────
CREATE TABLE stores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  code       TEXT NOT NULL UNIQUE,
  address    TEXT,
  gstin      TEXT,
  phone      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── USERS (extends Supabase auth.users) ───────────────────
CREATE TABLE users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id   UUID NOT NULL REFERENCES stores(id),
  email      TEXT NOT NULL,
  full_name  TEXT,
  role       user_role NOT NULL DEFAULT 'cashier',
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PRODUCTS ──────────────────────────────────────────────
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID NOT NULL REFERENCES stores(id),
  name        TEXT NOT NULL,
  sku         TEXT NOT NULL,
  barcode     TEXT,
  mrp         NUMERIC(10,2) NOT NULL DEFAULT 0,
  hsn         TEXT,
  gst_percent NUMERIC(5,2) DEFAULT 18,
  category    TEXT,
  brand       TEXT,
  unit        TEXT DEFAULT 'pcs',
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, sku)
);

-- ── STOCK ─────────────────────────────────────────────────
CREATE TABLE stock (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id      UUID NOT NULL REFERENCES stores(id),
  product_id    UUID NOT NULL REFERENCES products(id),
  qty           NUMERIC(10,3) NOT NULL DEFAULT 0,
  reorder_level NUMERIC(10,3) DEFAULT 10,
  status        stock_status DEFAULT 'ok',
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, product_id)
);

-- ── BILLS ─────────────────────────────────────────────────
CREATE TABLE bills (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID NOT NULL REFERENCES stores(id),
  bill_no         TEXT NOT NULL,
  bill_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_name   TEXT,
  customer_mobile TEXT,
  till_id         TEXT NOT NULL DEFAULT 'TILL-1',
  cashier_id      UUID REFERENCES users(id),
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst             NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  status          bill_status DEFAULT 'draft',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, bill_no)
);

-- ── BILL ITEMS ────────────────────────────────────────────
CREATE TABLE bill_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id     UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  qty         NUMERIC(10,3) NOT NULL DEFAULT 1,
  mrp         NUMERIC(10,2) NOT NULL,
  discount    NUMERIC(10,2) DEFAULT 0,
  scheme_id   UUID,
  amount      NUMERIC(12,2) NOT NULL
);

-- ── SCHEMES ───────────────────────────────────────────────
CREATE TABLE schemes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id  UUID NOT NULL REFERENCES stores(id),
  name      TEXT NOT NULL,
  type      scheme_type NOT NULL DEFAULT 'percent',
  value     NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_qty   NUMERIC(10,3),
  active    BOOLEAN DEFAULT TRUE,
  starts_at DATE NOT NULL DEFAULT CURRENT_DATE,
  ends_at   DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── LEDGER ────────────────────────────────────────────────
CREATE TABLE ledger (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID NOT NULL REFERENCES stores(id),
  type        ledger_type NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  party_name  TEXT,
  ref_id      UUID,
  narration   TEXT,
  entry_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI OUTPUTS ────────────────────────────────────────────
CREATE TABLE ai_outputs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID REFERENCES stores(id),
  prompt_hash     TEXT NOT NULL,
  output          TEXT NOT NULL,
  critic_score    NUMERIC(3,1),
  loop_iterations INT DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
