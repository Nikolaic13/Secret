-- Add delivery method columns to food_items table if they don't exist
DO $$ 
BEGIN
    -- Add delivery_method column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'food_items' AND column_name = 'delivery_method') THEN
        ALTER TABLE food_items ADD COLUMN delivery_method VARCHAR(20) DEFAULT 'pickup' 
        CHECK (delivery_method IN ('pickup', 'dropoff'));
    END IF;
    
    -- Add pickup_address column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'food_items' AND column_name = 'pickup_address') THEN
        ALTER TABLE food_items ADD COLUMN pickup_address TEXT;
    END IF;
    
    -- Add pickup_contact column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'food_items' AND column_name = 'pickup_contact') THEN
        ALTER TABLE food_items ADD COLUMN pickup_contact VARCHAR(20);
    END IF;
END $$;

-- Update existing food items to have pickup as default delivery method
UPDATE food_items SET delivery_method = 'pickup' WHERE delivery_method IS NULL;

-- Update status constraints to include new statuses
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'food_items_status_check' AND table_name = 'food_items') THEN
        ALTER TABLE food_items DROP CONSTRAINT food_items_status_check;
    END IF;
    
    -- Add updated constraint
    ALTER TABLE food_items ADD CONSTRAINT food_items_status_check 
    CHECK (status IN ('available', 'waiting_pickup', 'ready_distribution', 'claimed', 'distributed', 'expired'));
    
    -- Drop existing storage_status constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'food_items_storage_status_check' AND table_name = 'food_items') THEN
        ALTER TABLE food_items DROP CONSTRAINT food_items_storage_status_check;
    END IF;
    
    -- Add updated storage_status constraint
    ALTER TABLE food_items ADD CONSTRAINT food_items_storage_status_check 
    CHECK (storage_status IN ('donated', 'claimed', 'in_storage', 'allocated', 'distributed'));
END $$;

-- Create barangay_needs table if it doesn't exist
CREATE TABLE IF NOT EXISTS barangay_needs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barangay_name VARCHAR(100) NOT NULL,
  barangay_rep_id UUID REFERENCES auth.users(id),
  food_categories TEXT[] NOT NULL,
  priority_level INTEGER DEFAULT 5 CHECK (priority_level >= 1 AND priority_level <= 10),
  estimated_families INTEGER,
  special_requirements TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'fulfilled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_items_delivery_method ON food_items(delivery_method);
CREATE INDEX IF NOT EXISTS idx_barangay_needs_barangay ON barangay_needs(barangay_name);
CREATE INDEX IF NOT EXISTS idx_barangay_needs_status ON barangay_needs(status);

-- Add comments for documentation
COMMENT ON TABLE barangay_needs IS 'Stores barangay-reported food needs and requirements';
COMMENT ON COLUMN food_items.delivery_method IS 'Either pickup (collected from donor) or dropoff (brought to municipal hall)';
COMMENT ON COLUMN food_items.pickup_address IS 'Address for pickup when delivery_method is pickup';
COMMENT ON COLUMN food_items.pickup_contact IS 'Contact number for pickup coordination';
