-- ============================================================
-- PrimeSetu — Shoper9-Based Retail OS
-- Zero Cloud · Sovereign · AI-Governed
-- System Architect : Jawahar R. M. | © 2026
-- "Memory, Not Code."
-- ============================================================

-- ── Enable RLS on all tables ──────────────────────────────
ALTER TABLE stores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_outputs ENABLE ROW LEVEL SECURITY;

-- ── Helper: get current user's store_id ──────────────────
CREATE OR REPLACE FUNCTION current_store_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT store_id FROM users WHERE id = auth.uid()
$$;

-- ── Helper: get current user's role ──────────────────────
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role LANGUAGE sql STABLE AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$;

-- ── STORES ────────────────────────────────────────────────
CREATE POLICY "users see own store" ON stores
  FOR SELECT USING (id = current_store_id());

-- ── USERS ─────────────────────────────────────────────────
CREATE POLICY "users see own store users" ON users
  FOR SELECT USING (store_id = current_store_id());

CREATE POLICY "owner/manager can manage users" ON users
  FOR ALL USING (
    store_id = current_store_id()
    AND current_user_role() IN ('owner','manager')
  );

-- ── PRODUCTS ──────────────────────────────────────────────
CREATE POLICY "users see own store products" ON products
  FOR SELECT USING (store_id = current_store_id());

CREATE POLICY "owner/manager can manage products" ON products
  FOR ALL USING (
    store_id = current_store_id()
    AND current_user_role() IN ('owner','manager')
  );

-- ── STOCK ─────────────────────────────────────────────────
CREATE POLICY "users see own stock" ON stock
  FOR SELECT USING (store_id = current_store_id());

CREATE POLICY "manager+ can update stock" ON stock
  FOR ALL USING (
    store_id = current_store_id()
    AND current_user_role() IN ('owner','manager')
  );

-- ── BILLS ─────────────────────────────────────────────────
CREATE POLICY "users see own store bills" ON bills
  FOR SELECT USING (store_id = current_store_id());

CREATE POLICY "cashier+ can create bills" ON bills
  FOR INSERT WITH CHECK (store_id = current_store_id());

CREATE POLICY "manager+ can update bills" ON bills
  FOR UPDATE USING (
    store_id = current_store_id()
    AND current_user_role() IN ('owner','manager','cashier')
  );

-- ── BILL ITEMS ────────────────────────────────────────────
CREATE POLICY "users see bill items for their bills" ON bill_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = bill_items.bill_id
      AND bills.store_id = current_store_id()
    )
  );

CREATE POLICY "cashier+ can insert bill items" ON bill_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = bill_items.bill_id
      AND bills.store_id = current_store_id()
    )
  );

-- ── SCHEMES ───────────────────────────────────────────────
CREATE POLICY "users see own store schemes" ON schemes
  FOR SELECT USING (store_id = current_store_id());

CREATE POLICY "owner/manager can manage schemes" ON schemes
  FOR ALL USING (
    store_id = current_store_id()
    AND current_user_role() IN ('owner','manager')
  );

-- ── LEDGER ────────────────────────────────────────────────
CREATE POLICY "users see own ledger" ON ledger
  FOR SELECT USING (store_id = current_store_id());

CREATE POLICY "manager+ can write ledger" ON ledger
  FOR INSERT WITH CHECK (
    store_id = current_store_id()
    AND current_user_role() IN ('owner','manager')
  );

-- ── AI OUTPUTS ────────────────────────────────────────────
CREATE POLICY "users see own ai outputs" ON ai_outputs
  FOR SELECT USING (store_id = current_store_id());

CREATE POLICY "ai outputs insert" ON ai_outputs
  FOR INSERT WITH CHECK (store_id = current_store_id());
