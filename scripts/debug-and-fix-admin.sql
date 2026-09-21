-- First, let's check what's in the profiles table
SELECT 
  id, 
  first_name, 
  last_name, 
  email, 
  role, 
  approval_status, 
  created_at 
FROM profiles 
WHERE role IN ('municipal', 'barangay')
ORDER BY created_at DESC;

-- Make sure RLS is disabled for profiles table (for admin access)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Ensure the approval_status column exists with proper constraints
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Update any NULL approval_status values
UPDATE profiles 
SET approval_status = 'pending' 
WHERE approval_status IS NULL AND role IN ('municipal', 'barangay');

-- Update donor profiles to be approved (they don't need approval)
UPDATE profiles 
SET approval_status = 'approved' 
WHERE role = 'donor' AND (approval_status IS NULL OR approval_status = 'pending');

-- Check the results
SELECT 
  role,
  approval_status,
  COUNT(*) as count
FROM profiles 
GROUP BY role, approval_status
ORDER BY role, approval_status;
