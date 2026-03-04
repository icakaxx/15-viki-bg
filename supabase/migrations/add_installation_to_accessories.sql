-- Add installation as a service in the same table as accessories.
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor).
-- Until you run this, the app still works: installation will be null and the frontend uses 300 BGN fallback.

-- 1. Add type column to distinguish accessories from installation
ALTER TABLE accessories
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'accessory';

-- 2. Ensure existing rows are marked as accessories
UPDATE accessories SET type = 'accessory' WHERE type IS NULL;

-- 3. Insert installation service (one row, price in BGN per AC unit)
-- Skip if already present
INSERT INTO accessories (name, price, active, type)
SELECT 'Installation', 300, true, 'installation'
WHERE NOT EXISTS (SELECT 1 FROM accessories WHERE type = 'installation' LIMIT 1);
