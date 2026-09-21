-- Fix storage_status check constraint to include 'claimed'
-- This script adds 'claimed' to the valid storage_status values

-- Drop the existing constraint
ALTER TABLE food_items DROP CONSTRAINT IF EXISTS food_items_storage_status_check;

-- Add the updated constraint with 'claimed' included
ALTER TABLE food_items ADD CONSTRAINT food_items_storage_status_check 
CHECK (storage_status IN ('donated', 'claimed', 'in_storage', 'allocated', 'distributed'));

-- Update any existing NULL storage_status to 'donated' for consistency
UPDATE food_items SET storage_status = 'donated' WHERE storage_status IS NULL;

-- Verify the constraint was added correctly
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'food_items_storage_status_check';

-- Show current storage_status values to verify
SELECT DISTINCT storage_status, COUNT(*) 
FROM food_items 
GROUP BY storage_status 
ORDER BY storage_status;
