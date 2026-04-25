/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: convert_money_to_paise
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP: Convert Numeric/Float money columns to BIGINT (Paise)
-- ============================================================

-- Table: products
ALTER TABLE public.products 
  ALTER COLUMN mrp TYPE BIGINT USING (mrp * 100)::BIGINT,
  ALTER COLUMN wholesale_price TYPE BIGINT USING (wholesale_price * 100)::BIGINT,
  ALTER COLUMN staff_price TYPE BIGINT USING (staff_price * 100)::BIGINT,
  ALTER COLUMN cost_price TYPE BIGINT USING (cost_price * 100)::BIGINT;

-- Table: tills
ALTER TABLE public.tills 
  ALTER COLUMN cash_collected TYPE BIGINT USING (cash_collected * 100)::BIGINT;

-- Table: transactions
ALTER TABLE public.transactions 
  ALTER COLUMN subtotal TYPE BIGINT USING (subtotal * 100)::BIGINT,
  ALTER COLUMN discount_total TYPE BIGINT USING (discount_total * 100)::BIGINT,
  ALTER COLUMN tax_total TYPE BIGINT USING (tax_total * 100)::BIGINT,
  ALTER COLUMN net_payable TYPE BIGINT USING (net_payable * 100)::BIGINT;

-- Table: transaction_items
ALTER TABLE public.transaction_items 
  ALTER COLUMN mrp TYPE BIGINT USING (mrp * 100)::BIGINT,
  ALTER COLUMN tax_amount TYPE BIGINT USING (tax_amount * 100)::BIGINT,
  ALTER COLUMN net_amount TYPE BIGINT USING (net_amount * 100)::BIGINT;

-- Table: credit_notes
ALTER TABLE public.credit_notes 
  ALTER COLUMN initial_amount TYPE BIGINT USING (initial_amount * 100)::BIGINT,
  ALTER COLUMN balance_amount TYPE BIGINT USING (balance_amount * 100)::BIGINT;

-- Table: advance_deposits
ALTER TABLE public.advance_deposits 
  ALTER COLUMN initial_amount TYPE BIGINT USING (initial_amount * 100)::BIGINT,
  ALTER COLUMN balance_amount TYPE BIGINT USING (balance_amount * 100)::BIGINT;

-- Table: purchase_orders
ALTER TABLE public.purchase_orders 
  ALTER COLUMN total_cost TYPE BIGINT USING (total_cost * 100)::BIGINT;

-- Table: purchase_order_items
ALTER TABLE public.purchase_order_items 
  ALTER COLUMN unit_cost TYPE BIGINT USING (unit_cost * 100)::BIGINT;

-- Table: partners
ALTER TABLE public.partners 
  ALTER COLUMN credit_limit TYPE BIGINT USING (credit_limit * 100)::BIGINT;

-- Table: sales_slips
ALTER TABLE public.sales_slips 
  ALTER COLUMN total_amount TYPE BIGINT USING (total_amount * 100)::BIGINT;

-- Table: sales_slip_items
ALTER TABLE public.sales_slip_items 
  ALTER COLUMN mrp TYPE BIGINT USING (mrp * 100)::BIGINT,
  ALTER COLUMN net_amount TYPE BIGINT USING (net_amount * 100)::BIGINT;

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
