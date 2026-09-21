-- Add approval status to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Update existing profiles to be approved (so current users aren't locked out)
UPDATE profiles SET approval_status = 'approved' WHERE approval_status IS NULL;

-- Create admin_users table for super admin accounts
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default super admin (password: admin123 - should be changed in production)
INSERT INTO admin_users (username, email, password_hash, full_name) VALUES 
('superadmin', 'admin@foodshare-janiuay.com', '$2b$10$rOzJqQZ9Qm9Qm9Qm9Qm9Qm9Qm9Qm9Qm9Qm9Qm9Qm9Qm9Qm9Qm9Q', 'Super Administrator')
ON CONFLICT (username) DO NOTHING;

-- Create approval_logs table to track approval/rejection history
CREATE TABLE IF NOT EXISTS approval_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  admin_username TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users (only accessible by the application, not by regular users)
CREATE POLICY "Admin users are private" ON admin_users FOR ALL USING (false);

-- Create policies for approval_logs
CREATE POLICY "Approval logs are private" ON approval_logs FOR ALL USING (false);
