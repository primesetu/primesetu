-- Migration: Create Draft Bill Items Table (Shoper9 xtemp Concept)
CREATE TABLE IF NOT EXISTS public.draft_bill_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT, -- To support multiple counters for one user
    stock_no TEXT NOT NULL,
    item_desc TEXT,
    qty DECIMAL(10,3) DEFAULT 1,
    retail_price DECIMAL(10,2),
    disc_cd TEXT,
    disc_per DECIMAL(5,2) DEFAULT 0,
    tax_per DECIMAL(5,2) DEFAULT 0,
    salesman_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup when user opens billing screen
CREATE INDEX IF NOT EXISTS idx_draft_bill_user ON public.draft_bill_items(user_id);
