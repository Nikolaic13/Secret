-- Create food categories table for MCDA demographic targeting
CREATE TABLE IF NOT EXISTS food_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  target_demographic TEXT NOT NULL,
  priority_weight DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for food categories (readable by all authenticated users)
CREATE POLICY "Food categories are readable by authenticated users" ON food_categories
  FOR SELECT TO authenticated USING (true);

-- Insert food categories with demographic targeting
INSERT INTO food_categories (name, target_demographic, priority_weight, description) VALUES
('Dairy', 'children', 1.50, 'Milk, cheese, yogurt - prioritized for barangays with high children percentage'),
('Baby Food', 'infants', 2.00, 'Formula, baby cereals, purees - prioritized for families with infants'),
('Meat', 'general', 1.30, 'Fresh and processed meat products'),
('Vegetables', 'elderly', 1.20, 'Fresh vegetables - prioritized for barangays with elderly population'),
('Fruits', 'children', 1.25, 'Fresh and dried fruits - good for children and general nutrition'),
('Rice', 'general', 1.40, 'Staple food - high priority for food security'),
('Canned Goods', 'general', 1.10, 'Preserved foods with long shelf life'),
('Bread', 'general', 1.15, 'Baked goods and bread products'),
('Noodles', 'general', 1.20, 'Instant and regular noodles'),
('Snacks', 'children', 1.05, 'Healthy snacks - lower priority but good for children'),
('Beverages', 'general', 1.00, 'Non-alcoholic drinks'),
('Condiments', 'general', 0.90, 'Seasonings and cooking ingredients - lower priority'),
('Medicine', 'elderly', 1.80, 'Over-the-counter medications - high priority for elderly'),
('Vitamins', 'children', 1.35, 'Nutritional supplements - good for children and general health');

-- Verify the data was inserted
SELECT * FROM food_categories ORDER BY priority_weight DESC;

-- Show category distribution
SELECT 
  target_demographic,
  COUNT(*) as category_count,
  AVG(priority_weight) as avg_weight
FROM food_categories 
GROUP BY target_demographic 
ORDER BY avg_weight DESC;
