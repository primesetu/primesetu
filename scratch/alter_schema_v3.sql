-- Add v3.0 columns to smriti_item
ALTER TABLE smriti_item ADD COLUMN IF NOT EXISTS sync_version INTEGER DEFAULT 1;
ALTER TABLE smriti_item ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE smriti_item ADD COLUMN IF NOT EXISTS idempotency_key UUID DEFAULT gen_random_uuid();

-- Add v3.0 columns to smriti_sale_hdr
ALTER TABLE smriti_sale_hdr ADD COLUMN IF NOT EXISTS sync_version INTEGER DEFAULT 1;
ALTER TABLE smriti_sale_hdr ADD COLUMN IF NOT EXISTS idempotency_key UUID DEFAULT gen_random_uuid();
-- Note: is_deleted is NOT added to smriti_sale_hdr as per v3.0 Handbook (financial transactions are reversed, never deleted).

-- Apply Mandatory Index Strategy (Section 6.4)
-- idx_item_barcode: For fast barcode scanning at POS (sku acts as our barcode/identifier in the simplified schema)
CREATE INDEX IF NOT EXISTS idx_item_barcode ON smriti_item (sku);

-- idx_item_active: Active item listing at POS
CREATE INDEX IF NOT EXISTS idx_item_active ON smriti_item (sku) WHERE is_deleted = FALSE;

-- idx_sale_hdr_store_date: For day-end report and daily sales queries
CREATE INDEX IF NOT EXISTS idx_sale_hdr_store_date ON smriti_sale_hdr (bill_date DESC);

-- idx_sale_hdr_tally: Tally sync queue - only pending records
CREATE INDEX IF NOT EXISTS idx_sale_hdr_tally ON smriti_sale_hdr (tally_synced) WHERE tally_synced = FALSE;

-- idx_sale_hdr_irn: E-invoice lookup by IRN
CREATE INDEX IF NOT EXISTS idx_sale_hdr_irn ON smriti_sale_hdr (irn) WHERE irn IS NOT NULL;
