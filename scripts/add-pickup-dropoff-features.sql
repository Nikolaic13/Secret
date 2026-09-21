-- Add pickup/dropoff fields to food_items table
ALTER TABLE food_items 
ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(20) DEFAULT 'pickup',
ADD COLUMN IF NOT EXISTS pickup_address TEXT,
ADD COLUMN IF NOT EXISTS pickup_contact VARCHAR(20);

-- Update status values to match new flow
-- Current: available -> claimed -> distributed
-- New: available -> waiting_pickup -> ready_distribution -> distributed

-- Add barangay needs table
CREATE TABLE IF NOT EXISTS barangay_needs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barangay_name VARCHAR(100) NOT NULL,
  barangay_rep_id UUID REFERENCES auth.users(id),
  food_categories TEXT[] NOT NULL,
  priority_level INTEGER DEFAULT 5, -- 1-10 scale
  estimated_families INTEGER,
  special_requirements TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_barangay_needs_barangay ON barangay_needs(barangay_name);
CREATE INDEX IF NOT EXISTS idx_barangay_needs_status ON barangay_needs(status);
CREATE INDEX IF NOT EXISTS idx_food_items_delivery_method ON food_items(delivery_method);

-- Update existing food items to have pickup as default delivery method
UPDATE food_items SET delivery_method = 'pickup' WHERE delivery_method IS NULL;

-- Add municipal hall address as a constant (this can be updated as needed)
INSERT INTO barangay_data (name, population, urgency_score, distance_km, children_population, elderly_population, pregnant_women, families_with_infants, malnourished_children, food_security_level)
VALUES ('Municipal Hall', 0, 0, 0, 0, 0, 0, 0, 0, 10)
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE barangay_needs IS 'Stores barangay-reported food needs and requirements';
COMMENT ON COLUMN food_items.delivery_method IS 'Either pickup or dropoff';
COMMENT ON COLUMN food_items.pickup_address IS 'Address for pickup when delivery_method is pickup';
