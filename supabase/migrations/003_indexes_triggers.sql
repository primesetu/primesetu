-- ============================================================
-- PrimeSetu — Shoper9-Based Retail OS
-- Zero Cloud · Sovereign · AI-Governed
-- System Architect : Jawahar R. M. | © 2026
-- "Memory, Not Code."
-- ============================================================

-- ── INDEXES ───────────────────────────────────────────────
CREATE INDEX idx_products_store   ON products(store_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_sku     ON products(store_id, sku);
CREATE INDEX idx_stock_store      ON stock(store_id);
CREATE INDEX idx_stock_product    ON stock(product_id);
CREATE INDEX idx_bills_store_date ON bills(store_id, bill_date);
CREATE INDEX idx_bills_status     ON bills(store_id, status);
CREATE INDEX idx_bill_items_bill  ON bill_items(bill_id);
CREATE INDEX idx_ledger_store     ON ledger(store_id, entry_date);

-- ── AUTO-UPDATE STOCK STATUS TRIGGER ──────────────────────
CREATE OR REPLACE FUNCTION update_stock_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.status := CASE
    WHEN NEW.qty <= 0                     THEN 'out'::stock_status
    WHEN NEW.qty <= NEW.reorder_level / 2 THEN 'critical'::stock_status
    WHEN NEW.qty <= NEW.reorder_level     THEN 'low'::stock_status
    ELSE                                       'ok'::stock_status
  END;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_stock_status
  BEFORE INSERT OR UPDATE ON stock
  FOR EACH ROW EXECUTE FUNCTION update_stock_status();

-- ── AUTO BILL NUMBER ───────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_bill_no()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  next_no INT;
BEGIN
  SELECT COALESCE(MAX(CAST(SPLIT_PART(bill_no, '-', 2) AS INT)), 0) + 1
  INTO next_no
  FROM bills
  WHERE store_id = NEW.store_id;

  NEW.bill_no := 'B-' || LPAD(next_no::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bill_no
  BEFORE INSERT ON bills
  FOR EACH ROW
  WHEN (NEW.bill_no IS NULL OR NEW.bill_no = '')
  EXECUTE FUNCTION generate_bill_no();
