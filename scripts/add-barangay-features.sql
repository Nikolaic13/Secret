-- Add demographic columns to barangay_data table if they don't exist
DO $$ 
BEGIN
    -- Add demographic columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangay_data' AND column_name = 'children_population') THEN
        ALTER TABLE barangay_data ADD COLUMN children_population INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangay_data' AND column_name = 'elderly_population') THEN
        ALTER TABLE barangay_data ADD COLUMN elderly_population INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangay_data' AND column_name = 'pregnant_women') THEN
        ALTER TABLE barangay_data ADD COLUMN pregnant_women INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangay_data' AND column_name = 'families_with_infants') THEN
        ALTER TABLE barangay_data ADD COLUMN families_with_infants INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangay_data' AND column_name = 'malnourished_children') THEN
        ALTER TABLE barangay_data ADD COLUMN malnourished_children INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangay_data' AND column_name = 'pwd_population') THEN
        ALTER TABLE barangay_data ADD COLUMN pwd_population INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangay_data' AND column_name = 'senior_citizens') THEN
        ALTER TABLE barangay_data ADD COLUMN senior_citizens INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangay_data' AND column_name = 'solo_parents') THEN
        ALTER TABLE barangay_data ADD COLUMN solo_parents INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangay_data' AND column_name = 'indigenous_families') THEN
        ALTER TABLE barangay_data ADD COLUMN indigenous_families INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangay_data' AND column_name = 'food_security_level') THEN
        ALTER TABLE barangay_data ADD COLUMN food_security_level INTEGER DEFAULT 5;
    END IF;
END $$;

-- Create food_requests table for specific barangay food category requests
CREATE TABLE IF NOT EXISTS food_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    barangay_name TEXT NOT NULL,
    food_category TEXT NOT NULL,
    quantity_needed INTEGER NOT NULL,
    unit TEXT NOT NULL DEFAULT 'kg',
    priority_level INTEGER,
    reason TEXT NOT NULL,
    special_requirements TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'fulfilled', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update the priority_level column to be nullable since MCDA handles prioritization
ALTER TABLE food_requests ALTER COLUMN priority_level DROP NOT NULL;
ALTER TABLE food_requests ALTER COLUMN priority_level SET DEFAULT 5;

-- Update the check constraint to allow NULL values
ALTER TABLE food_requests DROP CONSTRAINT IF EXISTS food_requests_priority_level_check;
ALTER TABLE food_requests ADD CONSTRAINT food_requests_priority_level_check 
CHECK (priority_level IS NULL OR (priority_level >= 1 AND priority_level <= 10));

-- Update existing records to have a default priority level of 5 if they're null
UPDATE food_requests SET priority_level = 5 WHERE priority_level IS NULL;

-- Create indexes for food_requests
CREATE INDEX IF NOT EXISTS idx_food_requests_barangay ON food_requests(barangay_name);
CREATE INDEX IF NOT EXISTS idx_food_requests_status ON food_requests(status);
CREATE INDEX IF NOT EXISTS idx_food_requests_category ON food_requests(food_category);
CREATE INDEX IF NOT EXISTS idx_food_requests_priority ON food_requests(priority_level);
CREATE INDEX IF NOT EXISTS idx_food_requests_created_at ON food_requests(created_at);

-- Enable RLS for food_requests
ALTER TABLE food_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for food_requests
CREATE POLICY "Barangay representatives can insert their own requests" ON food_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'barangay' 
            AND profiles.barangay = food_requests.barangay_name
        )
    );

CREATE POLICY "Barangay representatives can view their own requests" ON food_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'barangay' 
            AND profiles.barangay = food_requests.barangay_name
        )
    );

CREATE POLICY "Municipal representatives can view all requests" ON food_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'municipal'
        )
    );

CREATE POLICY "Municipal representatives can update request status" ON food_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'municipal'
        )
    );

-- Update sample demographic data for existing barangays
UPDATE barangay_data SET 
    children_population = FLOOR(population * 0.25)::INTEGER,
    elderly_population = FLOOR(population * 0.08)::INTEGER,
    pregnant_women = FLOOR(population * 0.02)::INTEGER,
    families_with_infants = FLOOR(population * 0.03)::INTEGER,
    malnourished_children = FLOOR(population * 0.05)::INTEGER,
    pwd_population = FLOOR(population * 0.04)::INTEGER,
    senior_citizens = FLOOR(population * 0.06)::INTEGER,
    solo_parents = FLOOR(population * 0.07)::INTEGER,
    indigenous_families = FLOOR(population * 0.01)::INTEGER,
    food_security_level = FLOOR(RANDOM() * 5 + 4)::INTEGER -- Random between 4-8
WHERE children_population IS NULL OR children_population = 0;

-- Insert sample food requests
INSERT INTO food_requests (barangay_name, food_category, quantity_needed, unit, priority_level, reason, special_requirements, status) VALUES
('Abangay', 'Rice', 50, 'sacks', 8, 'Upcoming harvest season gap, many families running low on rice supply', 'Need good quality rice suitable for children', 'pending'),
('Agcarope', 'Vegetables', 30, 'kg', 7, 'Limited access to fresh vegetables due to distance from market', 'Prefer leafy greens and root vegetables', 'pending'),
('Balanac', 'Baby Food', 20, 'cans', 9, 'High number of infants and toddlers in the barangay', 'Need age-appropriate formula and baby food', 'pending'),
('Cabantog', 'Meat', 25, 'kg', 6, 'Protein deficiency observed in malnourished children', 'Chicken or fish preferred, halal preparation needed', 'pending'),
('Calmay', 'Dairy', 40, 'liters', 8, 'Many pregnant women and lactating mothers need calcium', 'Fresh milk or powdered milk acceptable', 'pending');

-- Add comments for documentation
COMMENT ON TABLE food_requests IS 'Specific food category requests from barangay representatives';

-- Update the comment to reflect the new nullable nature
COMMENT ON COLUMN food_requests.priority_level IS 'Priority level from 1-10 (nullable - MCDA algorithm handles prioritization automatically)';
COMMENT ON COLUMN food_requests.reason IS 'Detailed explanation of why this food category is needed';
COMMENT ON COLUMN food_requests.special_requirements IS 'Any special dietary or preparation requirements';

-- Update barangay_data comments
COMMENT ON COLUMN barangay_data.children_population IS 'Number of children';
COMMENT ON COLUMN barangay_data.elderly_population IS 'Number of elderly people';
COMMENT ON COLUMN barangay_data.pregnant_women IS 'Number of pregnant women';
COMMENT ON COLUMN barangay_data.families_with_infants IS 'Number of families with infants';
COMMENT ON COLUMN barangay_data.malnourished_children IS 'Number of malnourished children';
COMMENT ON COLUMN barangay_data.pwd_population IS 'Number of persons with disabilities';
COMMENT ON COLUMN barangay_data.senior_citizens IS 'Number of senior citizens (60+ years old)';
COMMENT ON COLUMN barangay_data.solo_parents IS 'Number of solo parent families';
COMMENT ON COLUMN barangay_data.indigenous_families IS 'Number of indigenous families';
COMMENT ON COLUMN barangay_data.food_security_level IS 'Food security level of the barangay';

-- Create function to update food_requests timestamp
CREATE OR REPLACE FUNCTION update_food_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for food_requests
DROP TRIGGER IF EXISTS update_food_requests_updated_at ON food_requests;
CREATE TRIGGER update_food_requests_updated_at
  BEFORE UPDATE ON food_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_food_requests_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON food_requests TO authenticated;
GRANT USAGE ON SEQUENCE food_requests_id_seq TO authenticated;

COMMIT;
