-- Create barangay_data table with all required demographic fields
CREATE TABLE IF NOT EXISTS barangay_data (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    population INTEGER NOT NULL,
    urgency_score INTEGER NOT NULL CHECK (urgency_score >= 1 AND urgency_score <= 10),
    distance_km DECIMAL(5,2) NOT NULL,
    children_population INTEGER NOT NULL,
    elderly_population INTEGER NOT NULL,
    pregnant_women INTEGER NOT NULL,
    families_with_infants INTEGER NOT NULL,
    malnourished_children INTEGER NOT NULL,
    food_security_level INTEGER NOT NULL CHECK (food_security_level >= 1 AND food_security_level <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_barangay_name ON barangay_data(name);
CREATE INDEX IF NOT EXISTS idx_barangay_urgency ON barangay_data(urgency_score);
CREATE INDEX IF NOT EXISTS idx_barangay_population ON barangay_data(population);

-- Add comments for documentation
COMMENT ON TABLE barangay_data IS 'Demographic and geographic data for Janiuay barangays used in MCDA algorithm';
COMMENT ON COLUMN barangay_data.urgency_score IS 'Urgency score from 1-10 (10 = most urgent)';
COMMENT ON COLUMN barangay_data.food_security_level IS 'Food security level from 1-10 (1 = least secure, 10 = most secure)';
COMMENT ON COLUMN barangay_data.distance_km IS 'Distance from municipal center in kilometers';
