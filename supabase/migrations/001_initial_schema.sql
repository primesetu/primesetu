-- ============================================================
-- PrimeSetu - Shoper9-Based Retail OS
-- Zero Cloud . Sovereign . AI-Governed
-- ============================================================
-- System Architect   :  Jawahar R. M.
-- Organisation       :  AITDL Network
-- Project            :  PrimeSetu
-- (c) 2026 - All Rights Reserved
-- "Memory, Not Code."
-- ============================================================

-- Core Retail Schema v1.1.5 (Shoper 9 Enhanced)

-- 1. System Parameters (Global Config)
CREATE TABLE system_parameters (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    value_type TEXT CHECK (value_type IN ('bool', 'int', 'string', 'float')),
    bool_val BOOLEAN,
    int_val INTEGER,
    str_val TEXT,
    float_val NUMERIC(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Params (Shoper 9 Muscle Memory)
INSERT INTO system_parameters (code, description, value_type, bool_val) VALUES 
('MRP_INCL_TAX', 'Is MRP inclusive of tax by default?', 'bool', true),
('AUTO_ROUND_OFF', 'Enable automatic round-off of bills?', 'bool', true),
('ALLOW_NEGATIVE_STOCK', 'Allow sales if stock is zero?', 'bool', false);

-- 2. Locations (Stores/Warehouses)
CREATE TABLE stores (
    id TEXT PRIMARY KEY, -- 'CSW', 'X01', 'WH1'
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('Retail', 'Warehouse', 'HO')) DEFAULT 'Retail',
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. Modern Product Master (Enhanced)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- Barcode/SKU
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    subcategory TEXT,
    size TEXT,
    color TEXT,
    mrp NUMERIC(15,2) DEFAULT 0.0,
    cost_price NUMERIC(15,2) DEFAULT 0.0,
    tax_rate NUMERIC(5,2) DEFAULT 18.0,
    is_tax_inclusive BOOLEAN DEFAULT TRUE,
    is_inventory_item BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    attributes JSONB DEFAULT '{}'::jsonb, -- Mimics AnalCode1-32
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Inventory States
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
    quantity NUMERIC(12,3) DEFAULT 0.000,
    min_stock NUMERIC(12,3) DEFAULT 0.000,
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, store_id)
);

-- 5. Customers (CRM Light)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Transactions (Sales/Receipts)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_no TEXT UNIQUE NOT NULL, -- Format: CSW/2026/XXXX
    store_id TEXT REFERENCES stores(id),
    customer_id UUID REFERENCES customers(id),
    type TEXT CHECK (type IN ('Sales', 'Purchase', 'Transfer', 'Adjustment')),
    payment_mode TEXT CHECK (payment_mode IN ('CASH', 'UPI', 'CARD', 'MIXED')),
    subtotal NUMERIC(15,2) DEFAULT 0.00,
    discount_total NUMERIC(15,2) DEFAULT 0.00,
    tax_total NUMERIC(15,2) DEFAULT 0.00,
    net_payable NUMERIC(15,2) DEFAULT 0.00,
    status TEXT CHECK (status IN ('Draft', 'Finalized', 'Cancelled')) DEFAULT 'Finalized',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Transaction Items (Line Details)
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    qty NUMERIC(12,3) NOT NULL,
    mrp NUMERIC(15,2) NOT NULL,
    discount_per NUMERIC(5,2) DEFAULT 0.0,
    tax_amount NUMERIC(15,2) DEFAULT 0.0,
    net_amount NUMERIC(15,2) NOT NULL
);

-- Enable RLS
ALTER TABLE system_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Global Read Access (Phase 1)
CREATE POLICY "Public Access" ON system_parameters FOR ALL USING (true);
CREATE POLICY "Public Access" ON stores FOR ALL USING (true);
CREATE POLICY "Public Access" ON products FOR ALL USING (true);
CREATE POLICY "Public Access" ON inventory FOR ALL USING (true);
CREATE POLICY "Public Access" ON customers FOR ALL USING (true);
CREATE POLICY "Public Access" ON transactions FOR ALL USING (true);
CREATE POLICY "Public Access" ON transaction_items FOR ALL USING (true);
