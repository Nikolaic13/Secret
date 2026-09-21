-- Add the approval_status column to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Update existing profiles based on their role
-- Donors should be automatically approved (they don't need approval)
UPDATE profiles 
SET approval_status = 'approved' 
WHERE role = 'donor' AND approval_status IS NULL;

-- Representatives should be pending by default
UPDATE profiles 
SET approval_status = 'pending' 
WHERE role IN ('municipal', 'barangay') AND approval_status IS NULL;

-- Make sure RLS is disabled for admin access
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verify the column was added correctly
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'approval_status';

-- Check current data
SELECT 
  id,
  first_name,
  last_name,
  email,
  role,
  approval_status,
  created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;
