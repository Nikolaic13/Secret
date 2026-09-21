-- Create test representative accounts for easier testing
-- This script creates both auth users and profile entries

-- First, let's check what columns exist in the profiles table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Create test representative profiles
-- Note: You must first create the auth users in Supabase Dashboard, then update the UUIDs below

-- First, check if we have any auth users to work with
SELECT 'Auth users in system:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Insert test municipal representative profile
-- Replace 'YOUR_MUNICIPAL_USER_UUID' with actual UUID from auth.users
INSERT INTO profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role, 
    barangay, 
    approval_status,
    created_at
) VALUES (
    'YOUR_MUNICIPAL_USER_UUID'::uuid,  -- Replace with actual UUID
    'municipal.rep@janiuay.gov.ph',
    'Maria',
    'Santos',
    'municipal',
    NULL,  -- Municipal reps don't have specific barangay
    'approved',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    barangay = EXCLUDED.barangay,
    approval_status = EXCLUDED.approval_status;

-- Insert test barangay representative profile  
-- Replace 'YOUR_BARANGAY_USER_UUID' with actual UUID from auth.users
INSERT INTO profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    barangay,
    approval_status,
    created_at
) VALUES (
    'YOUR_BARANGAY_USER_UUID'::uuid,  -- Replace with actual UUID
    'barangay.rep@poblacion.janiuay.gov.ph',
    'Juan',
    'Dela Cruz',
    'barangay',
    'Don T. Lutero Center (Poblacion)',
    'approved',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    barangay = EXCLUDED.barangay,
    approval_status = EXCLUDED.approval_status;

-- Verify the profiles were created
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    barangay,
    approval_status
FROM profiles 
WHERE role IN ('municipal', 'barangay')
ORDER BY created_at DESC;

-- Instructions for manual setup:
SELECT '
MANUAL SETUP REQUIRED:
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" and create:
   - Email: municipal.rep@janiuay.gov.ph
   - Password: TestMunicipal123!
   - Confirm password: TestMunicipal123!
   
3. Create another user:
   - Email: barangay.rep@poblacion.janiuay.gov.ph  
   - Password: TestBarangay123!
   - Confirm password: TestBarangay123!

4. Copy the UUIDs from the created users
5. Replace YOUR_MUNICIPAL_USER_UUID and YOUR_BARANGAY_USER_UUID in this script
6. Run this script again to create the profiles
' as instructions;
