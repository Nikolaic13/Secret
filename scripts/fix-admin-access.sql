-- Temporarily disable RLS for profiles table to allow admin access
-- In production, you'd want to create proper admin policies instead
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Alternative: Create a proper admin policy (uncomment if you prefer this approach)
-- CREATE POLICY "Admin can view all profiles" ON profiles
--   FOR SELECT USING (true);

-- Make sure the approval_status column exists and has the right default
ALTER TABLE profiles ALTER COLUMN approval_status SET DEFAULT 'pending';

-- Update any existing representative profiles that don't have approval_status set
UPDATE profiles 
SET approval_status = 'approved' 
WHERE role IN ('municipal', 'barangay') AND approval_status IS NULL;

-- Update donor profiles to be approved (they don't need approval)
UPDATE profiles 
SET approval_status = 'approved' 
WHERE role = 'donor';
