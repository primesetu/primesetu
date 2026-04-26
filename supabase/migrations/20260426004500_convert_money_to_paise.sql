/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: convert_money_to_paise
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP: Convert Numeric/Float money columns to INTEGER (Paise)
-- ============================================================

-- Table: products
ALTER TABLE public.products 
  ALTER COLUMN mrp TYPE INTEGER USING (mrp * 100)::INTEGER,
  ALTER COLUMN wholesale_price TYPE INTEGER USING (wholesale_price * 100)::INTEGER,
  ALTER COLUMN staff_price TYPE INTEGER USING (staff_price * 100)::INTEGER,
  ALTER COLUMN cost_price TYPE INTEGER USING (cost_price * 100)::INTEGER;

-- Table: tills
ALTER TABLE public.tills 
  ALTER COLUMN cash_collected TYPE INTEGER USING (cash_collected * 100)::INTEGER;

-- Table: transactions
ALTER TABLE public.transactions 
  ALTER COLUMN subtotal TYPE INTEGER USING (subtotal * 100)::INTEGER,
  ALTER COLUMN discount_total TYPE INTEGER USING (discount_total * 100)::INTEGER,
  ALTER COLUMN tax_total TYPE INTEGER USING (tax_total * 100)::INTEGER,
  ALTER COLUMN net_payable TYPE INTEGER USING (net_payable * 100)::INTEGER;

-- Table: transaction_items
ALTER TABLE public.transaction_items 
  ALTER COLUMN mrp TYPE INTEGER USING (mrp * 100)::INTEGER,
  ALTER COLUMN tax_amount TYPE INTEGER USING (tax_amount * 100)::INTEGER,
  ALTER COLUMN net_amount TYPE INTEGER USING (net_amount * 100)::INTEGER;

-- Table: credit_notes
ALTER TABLE public.credit_notes 
  ALTER COLUMN initial_amount TYPE INTEGER USING (initial_amount * 100)::INTEGER,
  ALTER COLUMN balance_amount TYPE INTEGER USING (balance_amount * 100)::INTEGER;

-- Table: advance_deposits
ALTER TABLE public.advance_deposits 
  ALTER COLUMN initial_amount TYPE INTEGER USING (initial_amount * 100)::INTEGER,
  ALTER COLUMN balance_amount TYPE INTEGER USING (balance_amount * 100)::INTEGER;

-- Table: purchase_orders
ALTER TABLE public.purchase_orders 
  ALTER COLUMN total_cost TYPE INTEGER USING (total_cost * 100)::INTEGER;

-- Table: purchase_order_items
ALTER TABLE public.purchase_order_items 
  ALTER COLUMN unit_cost TYPE INTEGER USING (unit_cost * 100)::INTEGER;

-- Table: partners
ALTER TABLE public.partners 
  ALTER COLUMN credit_limit TYPE INTEGER USING (credit_limit * 100)::INTEGER;

-- Table: sales_slips
ALTER TABLE public.sales_slips 
  ALTER COLUMN total_amount TYPE INTEGER USING (total_amount * 100)::INTEGER;

-- Table: sales_slip_items
ALTER TABLE public.sales_slip_items 
  ALTER COLUMN mrp TYPE INTEGER USING (mrp * 100)::INTEGER,
  ALTER COLUMN net_amount TYPE INTEGER USING (net_amount * 100)::INTEGER;

-- ============================================================
-- DOWN: In case we need to revert (Informational only)
-- ============================================================
/*
ALTER TABLE public.products 
  ALTER COLUMN mrp TYPE NUMERIC(15, 2) USING (mrp / 100.0),
  ... etc
*/

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON COLUMN public.products.mrp IS 'MRP in paise (Integer). Multiply by 100 for display.';
COMMENT ON COLUMN public.transactions.net_payable IS 'Net amount in paise. Mandatory for Tally zero-sum validation.';
