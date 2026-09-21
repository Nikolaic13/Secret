-- Complete FoodShare Janiuay Database Setup
-- Run this script in your new Supabase project to restore the database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if any (in correct order to handle foreign keys)
DROP TABLE IF EXISTS barangay_needs CASCADE;
DROP TABLE IF EXISTS food_categories CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS storage_logs CASCADE;
DROP TABLE IF EXISTS barangay_data CASCADE;
DROP TABLE IF EXISTS food_items CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  role TEXT NOT NULL CHECK (role IN ('donor', 'municipal', 'barangay', 'admin')),
  barangay TEXT,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food_items table with all necessary columns
CREATE TABLE food_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'waiting_pickup', 'ready_distribution', 'claimed', 'distributed', 'expired')),
  storage_status TEXT DEFAULT 'donated' CHECK (storage_status IN ('donated', 'claimed', 'in_storage', 'allocated', 'distributed')),
  storage_location TEXT,
  storage_notes TEXT,
  stored_at TIMESTAMP WITH TIME ZONE,
  assigned_barangay TEXT,
  claimed_at TIMESTAMP WITH TIME ZONE,
  delivery_method TEXT DEFAULT 'pickup' CHECK (delivery_method IN ('pickup', 'dropoff')),
  pickup_address TEXT,
  pickup_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage_logs table
CREATE TABLE storage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  food_item_id UUID REFERENCES food_items(id) ON DELETE CASCADE NOT NULL,
  municipal_rep_id UUID REFERENCES auth.users(id),
  barangay_rep_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  storage_location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipient_barangay TEXT NOT NULL,
  food_item_id UUID REFERENCES food_items(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'allocation',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create barangay_data table for MCDA algorithm
CREATE TABLE barangay_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  population INTEGER NOT NULL,
  urgency_score DECIMAL(3,1) NOT NULL DEFAULT 5.0 CHECK (urgency_score >= 0 AND urgency_score <= 10),
  distance_km DECIMAL(5,2) NOT NULL DEFAULT 0.0,
  children_population INTEGER DEFAULT 0,
  elderly_population INTEGER DEFAULT 0,
  pregnant_women INTEGER DEFAULT 0,
  families_with_infants INTEGER DEFAULT 0,
  malnourished_children INTEGER DEFAULT 0,
  food_security_level INTEGER DEFAULT 5 CHECK (food_security_level >= 1 AND food_security_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food_categories table
CREATE TABLE food_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_name TEXT UNIQUE NOT NULL,
  target_demographics TEXT[] NOT NULL,
  nutritional_priority INTEGER DEFAULT 5 CHECK (nutritional_priority >= 1 AND nutritional_priority <= 10),
  shelf_life_category TEXT DEFAULT 'medium' CHECK (shelf_life_category IN ('short', 'medium', 'long')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create barangay_needs table
CREATE TABLE barangay_needs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barangay_name TEXT NOT NULL,
  barangay_rep_id UUID REFERENCES auth.users(id),
  food_categories TEXT[] NOT NULL,
  priority_level INTEGER DEFAULT 5 CHECK (priority_level >= 1 AND priority_level <= 10),
  estimated_families INTEGER,
  special_requirements TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'fulfilled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_food_items_donor_id ON food_items(donor_id);
CREATE INDEX idx_food_items_status ON food_items(status);
CREATE INDEX idx_food_items_storage_status ON food_items(storage_status);
CREATE INDEX idx_food_items_assigned_barangay ON food_items(assigned_barangay);
CREATE INDEX idx_food_items_delivery_method ON food_items(delivery_method);
CREATE INDEX idx_food_items_created_at ON food_items(created_at);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_barangay ON profiles(barangay);
CREATE INDEX idx_profiles_approval_status ON profiles(approval_status);
CREATE INDEX idx_storage_logs_food_item_id ON storage_logs(food_item_id);
CREATE INDEX idx_notifications_recipient_barangay ON notifications(recipient_barangay);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_barangay_data_name ON barangay_data(name);
CREATE INDEX idx_barangay_needs_barangay ON barangay_needs(barangay_name);
CREATE INDEX idx_barangay_needs_status ON barangay_needs(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE barangay_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE barangay_needs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - PROFILES
-- ============================================================================

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users during registration" ON profiles
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES - FOOD ITEMS
-- ============================================================================

CREATE POLICY "Donors can view own food items" ON food_items
  FOR SELECT USING (
    donor_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('municipal', 'barangay', 'admin')
    )
  );

CREATE POLICY "Donors can insert own food items" ON food_items
  FOR INSERT WITH CHECK (donor_id = auth.uid());

CREATE POLICY "Donors can update own food items" ON food_items
  FOR UPDATE USING (donor_id = auth.uid());

CREATE POLICY "Municipal reps can update food items" ON food_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('municipal', 'admin')
    )
  );

CREATE POLICY "Municipal reps can delete food items" ON food_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('municipal', 'admin')
    )
  );

-- ============================================================================
-- RLS POLICIES - STORAGE LOGS
-- ============================================================================

CREATE POLICY "Municipal and barangay reps can view storage logs" ON storage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('municipal', 'barangay', 'admin')
    )
  );

CREATE POLICY "Municipal and barangay reps can insert storage logs" ON storage_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('municipal', 'barangay', 'admin')
    )
  );

-- ============================================================================
-- RLS POLICIES - NOTIFICATIONS
-- ============================================================================

CREATE POLICY "Barangay reps can view own notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'barangay'
      AND profiles.barangay = notifications.recipient_barangay
    )
  );

CREATE POLICY "Municipal reps can insert notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('municipal', 'admin')
    )
  );

CREATE POLICY "Barangay reps can update own notifications" ON notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'barangay'
      AND profiles.barangay = notifications.recipient_barangay
    )
  );

-- ============================================================================
-- RLS POLICIES - BARANGAY DATA
-- ============================================================================

CREATE POLICY "Everyone can view barangay data" ON barangay_data
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Municipal reps can manage barangay data" ON barangay_data
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('municipal', 'admin')
    )
  );

-- ============================================================================
-- RLS POLICIES - FOOD CATEGORIES
-- ============================================================================

CREATE POLICY "Everyone can view food categories" ON food_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Municipal reps can manage food categories" ON food_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('municipal', 'admin')
    )
  );

-- ============================================================================
-- RLS POLICIES - BARANGAY NEEDS
-- ============================================================================

CREATE POLICY "Barangay reps can view own needs" ON barangay_needs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.role = 'barangay' AND profiles.barangay = barangay_needs.barangay_name
        OR profiles.role IN ('municipal', 'admin')
      )
    )
  );

CREATE POLICY "Barangay reps can manage own needs" ON barangay_needs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.role = 'barangay' AND profiles.barangay = barangay_needs.barangay_name
        OR profiles.role IN ('municipal', 'admin')
      )
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_items_updated_at 
  BEFORE UPDATE ON food_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barangay_data_updated_at 
  BEFORE UPDATE ON barangay_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barangay_needs_updated_at 
  BEFORE UPDATE ON barangay_needs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE COMMENTS (DOCUMENTATION)
-- ============================================================================

COMMENT ON TABLE food_items IS 'Stores food donation items with delivery and storage information';
COMMENT ON TABLE barangay_needs IS 'Stores barangay-reported food needs and requirements';
COMMENT ON COLUMN food_items.delivery_method IS 'Either pickup (collected from donor) or dropoff (brought to municipal hall)';
COMMENT ON COLUMN food_items.pickup_address IS 'Address for pickup when delivery_method is pickup';
COMMENT ON COLUMN food_items.pickup_contact IS 'Contact number for pickup coordination';
COMMENT ON COLUMN food_items.status IS 'Overall donation status in the workflow';
COMMENT ON COLUMN food_items.storage_status IS 'Storage and processing status';

-- Setup complete!
SELECT 'Database setup completed successfully!' AS status;
