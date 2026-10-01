-- Migration: Add Beneficiaries, Clothing Distribution, and Distribution Logs
-- This script creates the tables and seed data needed for:
-- 1. Urgent Beneficiary management in Barangays
-- 2. Age-appropriate Clothing Distribution
-- 3. Distribution tracking and history
-- 4. Barangay Food and Aid Requests

-- 1. Beneficiaries Table
CREATE TABLE IF NOT EXISTS barangay_beneficiaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    barangay_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 125),
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    household_size INTEGER DEFAULT 1 CHECK (household_size >= 1),
    address_purok TEXT NOT NULL,
    contact_number TEXT,
    vulnerability_category TEXT DEFAULT 'low_income' 
      CHECK (vulnerability_category IN ('low_income', 'senior', 'pwd', 'pregnant', 'solo_parent', 'malnourished_child', 'displaced_family', 'infant_care')),
    is_urgent BOOLEAN DEFAULT FALSE,
    urgency_reason TEXT,
    last_aid_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by barangay and urgency
CREATE INDEX IF NOT EXISTS idx_beneficiaries_barangay ON barangay_beneficiaries(barangay_name);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_urgent ON barangay_beneficiaries(is_urgent);

-- 2. Clothing Inventory Table
CREATE TABLE IF NOT EXISTS clothing_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    barangay_name TEXT NOT NULL,
    item_name TEXT NOT NULL,
    clothing_type TEXT NOT NULL CHECK (clothing_type IN ('tops', 'bottoms', 'jacket', 'baby_wear', 'dress', 'footwear', 'undergarment', 'bundle')),
    target_age_group TEXT NOT NULL CHECK (target_age_group IN ('infant', 'child', 'teen', 'adult', 'senior', 'all_ages')),
    min_age INTEGER DEFAULT 0,
    max_age INTEGER DEFAULT 120,
    size TEXT NOT NULL,
    gender_target TEXT DEFAULT 'unisex' CHECK (gender_target IN ('male', 'female', 'unisex', 'kids')),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    condition TEXT DEFAULT 'gently_used' CHECK (condition IN ('new', 'gently_used')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clothing_barangay ON clothing_inventory(barangay_name);
CREATE INDEX IF NOT EXISTS idx_clothing_age ON clothing_inventory(target_age_group);

-- 3. Aid Distributions Table (Records both Food and Clothing distributions)
CREATE TABLE IF NOT EXISTS aid_distributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    barangay_name TEXT NOT NULL,
    beneficiary_id UUID REFERENCES barangay_beneficiaries(id) ON DELETE SET NULL,
    beneficiary_name TEXT NOT NULL,
    beneficiary_age INTEGER,
    distribution_date DATE DEFAULT CURRENT_DATE,
    item_type TEXT NOT NULL CHECK (item_type IN ('food', 'clothing', 'relief_pack', 'other')),
    item_name TEXT NOT NULL,
    category TEXT,
    clothing_size TEXT,
    clothing_age_group TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    distributor_name TEXT NOT NULL,
    distributor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_distributions_barangay ON aid_distributions(barangay_name);
CREATE INDEX IF NOT EXISTS idx_distributions_beneficiary ON aid_distributions(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_distributions_date ON aid_distributions(distribution_date);

-- Enable RLS
ALTER TABLE barangay_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE aid_distributions ENABLE ROW LEVEL SECURITY;

-- Permissive policies for barangay reps and admins
CREATE POLICY "Allow read barangay_beneficiaries" ON barangay_beneficiaries FOR SELECT USING (true);
CREATE POLICY "Allow insert barangay_beneficiaries" ON barangay_beneficiaries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update barangay_beneficiaries" ON barangay_beneficiaries FOR UPDATE USING (true);
CREATE POLICY "Allow delete barangay_beneficiaries" ON barangay_beneficiaries FOR DELETE USING (true);

CREATE POLICY "Allow read clothing_inventory" ON clothing_inventory FOR SELECT USING (true);
CREATE POLICY "Allow insert clothing_inventory" ON clothing_inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update clothing_inventory" ON clothing_inventory FOR UPDATE USING (true);

CREATE POLICY "Allow read aid_distributions" ON aid_distributions FOR SELECT USING (true);
CREATE POLICY "Allow insert aid_distributions" ON aid_distributions FOR INSERT WITH CHECK (true);

-- Seed Sample Urgent & Regular Beneficiaries
INSERT INTO barangay_beneficiaries (barangay_name, full_name, age, date_of_birth, gender, household_size, address_purok, contact_number, vulnerability_category, is_urgent, urgency_reason, notes) VALUES
('Abangay', 'Maria Santos', 34, '1992-04-12', 'female', 4, 'Purok 2, Riverside', '09171234567', 'low_income', false, null, 'Active registered family head'),
('Abangay', 'Tatay Roberto Dela Cruz', 72, '1954-08-19', 'male', 2, 'Purok 1, Centro', '09289876543', 'senior', true, 'Bedridden senior citizen, low medication & nourishment support needed immediately', 'High priority for monthly food packs'),
('Abangay', 'Baby Lucas Gabriel', 1, '2025-02-10', 'male', 3, 'Purok 4, Ilaya', '09195551234', 'infant_care', true, 'Severely underweight 1-year-old infant, requires formula and toddler clothing', 'Monitor weekly'),
('Abangay', 'Elena Ramirez', 29, '1997-09-05', 'female', 5, 'Purok 3, Near Chapel', '09301122334', 'pregnant', true, '8-months pregnant mother with 3 toddlers experiencing severe food shortage', 'Immediate food & milk request'),
('Abangay', 'Carlos Mendoza', 16, '2010-06-20', 'male', 6, 'Purok 2', '09456677889', 'low_income', false, null, 'High school student from subsistence farmer family'),
('Agcarope', 'Lourdes Villanueva', 68, '1958-11-03', 'female', 1, 'Purok 1', '09182345678', 'senior', true, 'Solo senior citizen, isolated during heavy rains', 'Urgent food rations');

-- Seed Sample Clothing Inventory with Age Brackets
INSERT INTO clothing_inventory (barangay_name, item_name, clothing_type, target_age_group, min_age, max_age, size, gender_target, quantity, condition, notes) VALUES
('Abangay', 'Infant Onesies & Rompers Set (3-pack)', 'baby_wear', 'infant', 0, 2, '0-12M', 'unisex', 15, 'new', 'Cotton breathable fabric for infants'),
('Abangay', 'Baby Warmers & Booties', 'baby_wear', 'infant', 0, 1, '0-6M', 'unisex', 12, 'new', 'Soft knitwear'),
('Abangay', 'Kids Everyday Cotton T-Shirts', 'tops', 'child', 3, 8, 'Kids Small (3-5Y)', 'kids', 25, 'gently_used', 'School and playtime shirts'),
('Abangay', 'Kids Denim & Shorts Assorted', 'bottoms', 'child', 6, 12, 'Kids Medium (6-9Y)', 'kids', 18, 'gently_used', 'Clean durable pants'),
('Abangay', 'Youth Hoodies & Windbreakers', 'jacket', 'teen', 13, 17, 'Teen M', 'unisex', 10, 'gently_used', 'Light outerwear for teens'),
('Abangay', 'Teen Casual Tops & Polo', 'tops', 'teen', 13, 17, 'Teen L / Adult XS', 'unisex', 14, 'gently_used', 'School / youth shirts'),
('Abangay', 'Adult Standard Relief T-Shirts', 'tops', 'adult', 18, 59, 'Adult M', 'unisex', 40, 'new', 'Emergency relief shirts'),
('Abangay', 'Adult Comfortable Cotton Shirts', 'tops', 'adult', 18, 59, 'Adult L', 'unisex', 35, 'gently_used', 'Clean adult tops'),
('Abangay', 'Adult Cargo & Jogger Pants', 'bottoms', 'adult', 18, 59, 'Adult XL', 'unisex', 20, 'gently_used', 'Workwear and utility pants'),
('Abangay', 'Senior Dignity Warm Cardigan & Shawl', 'jacket', 'senior', 60, 120, 'Senior Free Size', 'unisex', 15, 'new', 'Warm soft clothing for elderly residents');
