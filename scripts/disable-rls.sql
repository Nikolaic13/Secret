-- Disable Row Level Security for all tables to allow easier development and testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE food_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE barangay_data DISABLE ROW LEVEL SECURITY;

-- Drop existing policies (optional - they won't be enforced anyway with RLS disabled)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users during registration" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Donors can view own food items" ON food_items;
DROP POLICY IF EXISTS "Donors can insert own food items" ON food_items;
DROP POLICY IF EXISTS "Donors can update own food items" ON food_items;
DROP POLICY IF EXISTS "Municipal reps can update food items" ON food_items;

DROP POLICY IF EXISTS "Barangay reps can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Municipal reps can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Barangay reps can update own notifications" ON notifications;

DROP POLICY IF EXISTS "Everyone can view barangay data" ON barangay_data;
DROP POLICY IF EXISTS "Municipal reps can manage barangay data" ON barangay_data;
