-- Add new expiry-related columns to the food_items table
-- This supports exact dates, batch date ranges, and non-perishable classifications

ALTER TABLE food_items 
ADD COLUMN IF NOT EXISTS expiry_type TEXT DEFAULT 'exact',
ADD COLUMN IF NOT EXISTS expiry_date_from DATE,
ADD COLUMN IF NOT EXISTS expiry_date_to DATE;

-- Add comment on columns for documentation
COMMENT ON COLUMN food_items.expiry_type IS 'Type of expiration: exact, range, or non_perishable';
COMMENT ON COLUMN food_items.expiry_date_from IS 'Start of expiry range for mixed batch donations';
COMMENT ON COLUMN food_items.expiry_date_to IS 'End of expiry range for mixed batch donations';

-- Notify Supabase PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
