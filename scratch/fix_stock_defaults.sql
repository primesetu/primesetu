ALTER TABLE smriti_stock ALTER COLUMN on_hand SET DEFAULT 0;
ALTER TABLE smriti_stock ALTER COLUMN on_order SET DEFAULT 0;
ALTER TABLE smriti_stock ALTER COLUMN min_stock SET DEFAULT 0;
UPDATE smriti_stock SET on_hand = 0 WHERE on_hand IS NULL;
UPDATE smriti_stock SET on_order = 0 WHERE on_order IS NULL;
UPDATE smriti_stock SET min_stock = 0 WHERE min_stock IS NULL;
ALTER TABLE smriti_stock ALTER COLUMN on_hand SET NOT NULL;
ALTER TABLE smriti_stock ALTER COLUMN on_order SET NOT NULL;
ALTER TABLE smriti_stock ALTER COLUMN min_stock SET NOT NULL;
