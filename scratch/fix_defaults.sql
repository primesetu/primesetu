ALTER TABLE smriti_item ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE smriti_item ALTER COLUMN is_featured SET DEFAULT false;
UPDATE smriti_item SET is_featured = false WHERE is_featured IS NULL;
UPDATE smriti_item SET is_active = true WHERE is_active IS NULL;
ALTER TABLE smriti_item ALTER COLUMN is_featured SET NOT NULL;
ALTER TABLE smriti_item ALTER COLUMN is_active SET NOT NULL;
