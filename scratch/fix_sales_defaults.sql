ALTER TABLE smriti_sale_hdr ALTER COLUMN tally_synced SET DEFAULT false;
ALTER TABLE smriti_sale_hdr ALTER COLUMN tally_retry_count SET DEFAULT 0;
UPDATE smriti_sale_hdr SET tally_synced = false WHERE tally_synced IS NULL;
UPDATE smriti_sale_hdr SET tally_retry_count = 0 WHERE tally_retry_count IS NULL;
ALTER TABLE smriti_sale_hdr ALTER COLUMN tally_synced SET NOT NULL;
ALTER TABLE smriti_sale_hdr ALTER COLUMN tally_retry_count SET NOT NULL;

ALTER TABLE smriti_sale_dtl ALTER COLUMN disc_amount SET DEFAULT 0;
ALTER TABLE smriti_sale_dtl ALTER COLUMN tax_amount SET DEFAULT 0;
UPDATE smriti_sale_dtl SET disc_amount = 0 WHERE disc_amount IS NULL;
UPDATE smriti_sale_dtl SET tax_amount = 0 WHERE tax_amount IS NULL;
ALTER TABLE smriti_sale_dtl ALTER COLUMN disc_amount SET NOT NULL;
ALTER TABLE smriti_sale_dtl ALTER COLUMN tax_amount SET NOT NULL;
