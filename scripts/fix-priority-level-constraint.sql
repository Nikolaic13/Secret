-- Fix the priority_level column constraint issue
-- This script makes priority_level nullable since MCDA algorithm handles prioritization

-- Make priority_level column nullable
ALTER TABLE food_requests ALTER COLUMN priority_level DROP NOT NULL;

-- Set a default value for new records
ALTER TABLE food_requests ALTER COLUMN priority_level SET DEFAULT 5;

-- Update the check constraint to allow NULL values
ALTER TABLE food_requests DROP CONSTRAINT IF EXISTS food_requests_priority_level_check;
ALTER TABLE food_requests ADD CONSTRAINT food_requests_priority_level_check 
CHECK (priority_level IS NULL OR (priority_level >= 1 AND priority_level <= 10));

-- Update any existing NULL records to have a default value
UPDATE food_requests SET priority_level = 5 WHERE priority_level IS NULL;

-- Update the column comment
COMMENT ON COLUMN food_requests.priority_level IS 'Priority level from 1-10 (nullable - MCDA algorithm handles automatic prioritization)';

-- Verify the changes
SELECT 
    column_name, 
    is_nullable, 
    column_default,
    data_type
FROM information_schema.columns 
WHERE table_name = 'food_requests' AND column_name = 'priority_level';

-- Show current constraint (fixed for modern PostgreSQL)
SELECT 
    conname, 
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%food_requests%priority%';

-- Alternative way to check constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'food_requests' 
    AND tc.constraint_type = 'CHECK'
    AND tc.constraint_name LIKE '%priority%';
