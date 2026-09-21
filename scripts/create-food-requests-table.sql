-- Create food_requests table for barangay-initiated food requests
CREATE TABLE IF NOT EXISTS food_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barangay_name TEXT NOT NULL,
  barangay_rep_id UUID REFERENCES auth.users(id),
  food_category TEXT NOT NULL,
  quantity_needed INTEGER NOT NULL,
  unit TEXT NOT NULL,
  reason TEXT,
  special_requirements TEXT,
  priority_level INTEGER DEFAULT 5 CHECK (priority_level >= 1 AND priority_level <= 10),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'fulfilled', 'cancelled')),
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  mcda_score INTEGER,
  items_allocated INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create distribution_logs table for tracking distributions
CREATE TABLE IF NOT EXISTS distribution_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  food_item_id UUID REFERENCES food_items(id) ON DELETE CASCADE,
  barangay_name TEXT NOT NULL,
  quantity_distributed INTEGER NOT NULL,
  distribution_method TEXT NOT NULL,
  mcda_score INTEGER,
  requested_quantity INTEGER DEFAULT 0,
  category TEXT,
  distributed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_food_requests_barangay ON food_requests(barangay_name);
CREATE INDEX IF NOT EXISTS idx_food_requests_status ON food_requests(status);
CREATE INDEX IF NOT EXISTS idx_food_requests_category ON food_requests(food_category);
CREATE INDEX IF NOT EXISTS idx_distribution_logs_barangay ON distribution_logs(barangay_name);
CREATE INDEX IF NOT EXISTS idx_distribution_logs_food_item ON distribution_logs(food_item_id);

-- RLS Policies
ALTER TABLE food_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_logs ENABLE ROW LEVEL SECURITY;

-- Food Requests RLS
CREATE POLICY "Barangay reps can view own requests" ON food_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.role = 'barangay' AND profiles.barangay = food_requests.barangay_name
        OR profiles.role IN ('municipal', 'admin')
      )
    )
  );

CREATE POLICY "Barangay reps can create requests" ON food_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('barangay', 'municipal', 'admin')
    )
  );

CREATE POLICY "Municipal reps can update requests" ON food_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('municipal', 'admin')
    )
  );

-- Distribution Logs RLS
CREATE POLICY "Municipal and barangay reps can view distribution logs" ON distribution_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('municipal', 'barangay', 'admin')
    )
  );

CREATE POLICY "Municipal reps can insert distribution logs" ON distribution_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('municipal', 'admin')
    )
  );

-- Triggers
CREATE TRIGGER update_food_requests_updated_at 
  BEFORE UPDATE ON food_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE food_requests IS 'Barangay-initiated requests for specific food categories';
COMMENT ON TABLE distribution_logs IS 'Logs of food distributions to barangays';
