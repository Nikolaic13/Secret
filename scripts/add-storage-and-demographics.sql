-- Add storage status to food_items
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS storage_status TEXT DEFAULT 'donated' 
CHECK (storage_status IN ('donated', 'in_storage', 'allocated', 'distributed'));

-- Add storage location and notes
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS storage_location TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS storage_notes TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS stored_at TIMESTAMP WITH TIME ZONE;

-- Update barangay_data to include demographic information
ALTER TABLE barangay_data ADD COLUMN IF NOT EXISTS children_population INTEGER DEFAULT 0;
ALTER TABLE barangay_data ADD COLUMN IF NOT EXISTS elderly_population INTEGER DEFAULT 0;
ALTER TABLE barangay_data ADD COLUMN IF NOT EXISTS pregnant_women INTEGER DEFAULT 0;
ALTER TABLE barangay_data ADD COLUMN IF NOT EXISTS families_with_infants INTEGER DEFAULT 0;
ALTER TABLE barangay_data ADD COLUMN IF NOT EXISTS malnourished_children INTEGER DEFAULT 0;
ALTER TABLE barangay_data ADD COLUMN IF NOT EXISTS food_security_level DECIMAL(3,1) DEFAULT 5.0 
CHECK (food_security_level >= 0 AND food_security_level <= 10);

-- Update existing barangay data with demographic information
UPDATE barangay_data SET 
  children_population = FLOOR(population * 0.35),  -- 35% children
  elderly_population = FLOOR(population * 0.08),   -- 8% elderly
  pregnant_women = FLOOR(population * 0.02),       -- 2% pregnant women
  families_with_infants = FLOOR(population * 0.05), -- 5% families with infants
  malnourished_children = FLOOR(population * 0.12), -- 12% malnourished children
  food_security_level = CASE 
    WHEN urgency_score >= 8.5 THEN 3.0  -- Low food security
    WHEN urgency_score >= 7.0 THEN 5.0  -- Medium food security
    ELSE 7.0                            -- High food security
  END
WHERE children_population IS NULL OR children_population = 0;

-- Create food_categories table for MCDA matching
CREATE TABLE IF NOT EXISTS food_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_name TEXT NOT NULL UNIQUE,
  target_demographics TEXT[] NOT NULL, -- Array of target demographics
  nutritional_priority INTEGER DEFAULT 5 CHECK (nutritional_priority >= 1 AND nutritional_priority <= 10),
  shelf_life_category TEXT CHECK (shelf_life_category IN ('perishable', 'semi_perishable', 'non_perishable')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert food category mappings
INSERT INTO food_categories (category_name, target_demographics, nutritional_priority, shelf_life_category) VALUES
('dairy', ARRAY['children', 'pregnant_women', 'families_with_infants'], 9, 'perishable'),
('fruits', ARRAY['children', 'elderly', 'malnourished'], 8, 'perishable'),
('vegetables', ARRAY['children', 'elderly', 'malnourished'], 8, 'perishable'),
('meat', ARRAY['children', 'pregnant_women', 'malnourished'], 9, 'perishable'),
('seafood', ARRAY['children', 'pregnant_women', 'malnourished'], 8, 'perishable'),
('grains', ARRAY['general', 'families_with_infants'], 7, 'non_perishable'),
('canned', ARRAY['general', 'elderly'], 6, 'non_perishable'),
('bakery', ARRAY['children', 'general'], 5, 'perishable'),
('other', ARRAY['general'], 5, 'semi_perishable')
ON CONFLICT (category_name) DO UPDATE SET
  target_demographics = EXCLUDED.target_demographics,
  nutritional_priority = EXCLUDED.nutritional_priority,
  shelf_life_category = EXCLUDED.shelf_life_category;

-- Create storage_logs table to track storage activities
CREATE TABLE IF NOT EXISTS storage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  food_item_id UUID REFERENCES food_items(id) ON DELETE CASCADE,
  municipal_rep_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL CHECK (action IN ('stored', 'allocated', 'removed')),
  storage_location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for food_categories (readable by all authenticated users)
CREATE POLICY "Food categories are readable by all" ON food_categories
  FOR SELECT TO authenticated USING (true);

-- Create policies for storage_logs
CREATE POLICY "Municipal reps can manage storage logs" ON storage_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'municipal'
    )
  );
