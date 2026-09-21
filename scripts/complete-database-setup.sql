-- Complete database setup for FoodShare Janiuay
-- This script drops and recreates all tables with the correct structure

-- Drop existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS allocations CASCADE;
DROP TABLE IF EXISTS storage_items CASCADE;
DROP TABLE IF EXISTS food_items CASCADE;
DROP TABLE IF EXISTS barangay_data CASCADE;
DROP TABLE IF EXISTS food_categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('donor', 'municipal', 'barangay', 'admin')),
    barangay TEXT,
    phone TEXT,
    address TEXT,
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food_categories table
CREATE TABLE food_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    nutritional_priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create barangay_data table
CREATE TABLE barangay_data (
    id SERIAL PRIMARY KEY,
    barangay_name TEXT NOT NULL UNIQUE,
    population INTEGER DEFAULT 0,
    households INTEGER DEFAULT 0,
    poverty_rate DECIMAL(5,2) DEFAULT 0.0,
    malnutrition_rate DECIMAL(5,2) DEFAULT 0.0,
    vulnerable_population INTEGER DEFAULT 0,
    distance_from_center DECIMAL(8,2) DEFAULT 0.0,
    food_security_score DECIMAL(3,1) DEFAULT 5.0,
    urgency_score DECIMAL(3,1) DEFAULT 1.0,
    last_allocation_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food_items table with all necessary columns
CREATE TABLE food_items (
    id SERIAL PRIMARY KEY,
    donor_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES food_categories(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'pieces',
    expiry_date DATE,
    pickup_location TEXT,
    pickup_contact TEXT,
    delivery_method TEXT DEFAULT 'pickup' CHECK (delivery_method IN ('pickup', 'dropoff')),
    pickup_address TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'stored', 'distributed', 'expired')),
    storage_status TEXT DEFAULT 'not_stored' CHECK (storage_status IN ('not_stored', 'stored', 'allocated', 'distributed')),
    claimed_by UUID REFERENCES profiles(id),
    claimed_at TIMESTAMP WITH TIME ZONE,
    stored_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage_items table
CREATE TABLE storage_items (
    id SERIAL PRIMARY KEY,
    food_item_id INTEGER REFERENCES food_items(id) NOT NULL,
    stored_by UUID REFERENCES profiles(id) NOT NULL,
    quantity_stored INTEGER NOT NULL,
    storage_location TEXT,
    storage_notes TEXT,
    storage_status TEXT DEFAULT 'stored' CHECK (storage_status IN ('stored', 'allocated', 'distributed')),
    stored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create allocations table
CREATE TABLE allocations (
    id SERIAL PRIMARY KEY,
    storage_item_id INTEGER REFERENCES storage_items(id) NOT NULL,
    allocated_by UUID REFERENCES profiles(id) NOT NULL,
    barangay TEXT NOT NULL,
    quantity_allocated INTEGER NOT NULL,
    allocation_method TEXT DEFAULT 'manual' CHECK (allocation_method IN ('manual', 'mcda')),
    urgency_score DECIMAL(3,1),
    allocation_notes TEXT,
    status TEXT DEFAULT 'allocated' CHECK (status IN ('allocated', 'distributed', 'cancelled')),
    allocated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    distributed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_barangay ON profiles(barangay);
CREATE INDEX idx_food_items_status ON food_items(status);
CREATE INDEX idx_food_items_donor ON food_items(donor_id);
CREATE INDEX idx_food_items_category ON food_items(category_id);
CREATE INDEX idx_storage_items_status ON storage_items(storage_status);
CREATE INDEX idx_allocations_barangay ON allocations(barangay);
CREATE INDEX idx_allocations_status ON allocations(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE barangay_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can see their own profile, admins can see all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Food items: Donors can manage their own, officials can view all
CREATE POLICY "Donors can manage own food items" ON food_items FOR ALL USING (auth.uid() = donor_id);
CREATE POLICY "Officials can view all food items" ON food_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('municipal', 'barangay', 'admin'))
);
CREATE POLICY "Officials can update food items" ON food_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('municipal', 'barangay', 'admin'))
);

-- Storage items: Municipal representatives can manage
CREATE POLICY "Municipal can manage storage" ON storage_items FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('municipal', 'admin'))
);
CREATE POLICY "Barangay can view relevant storage" ON storage_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p JOIN allocations a ON a.storage_item_id = storage_items.id 
            WHERE p.id = auth.uid() AND p.role = 'barangay' AND p.barangay = a.barangay)
);

-- Allocations: Municipal can manage, barangay can view their allocations
CREATE POLICY "Municipal can manage allocations" ON allocations FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('municipal', 'admin'))
);
CREATE POLICY "Barangay can view own allocations" ON allocations FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'barangay' AND barangay = allocations.barangay)
);

-- Public read access for reference data
CREATE POLICY "Public read barangay data" ON barangay_data FOR SELECT USING (true);
CREATE POLICY "Public read food categories" ON food_categories FOR SELECT USING (true);

-- Admin policies for reference data
CREATE POLICY "Admins can manage barangay data" ON barangay_data FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage food categories" ON food_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_items_updated_at BEFORE UPDATE ON food_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_storage_items_updated_at BEFORE UPDATE ON storage_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_allocations_updated_at BEFORE UPDATE ON allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_barangay_data_updated_at BEFORE UPDATE ON barangay_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
