-- Seed food categories with nutritional priorities and demographic targeting
-- Run this after the main database setup

INSERT INTO food_categories (category_name, target_demographics, nutritional_priority, shelf_life_category)
VALUES
  ('Rice & Grains', ARRAY['general', 'children', 'families_with_infants', 'pregnant_women', 'elderly'], 10, 'long'),
  ('Canned Goods', ARRAY['general', 'children', 'elderly'], 8, 'long'),
  ('Dairy Products', ARRAY['children', 'families_with_infants', 'pregnant_women', 'elderly', 'malnourished_children'], 9, 'short'),
  ('Fresh Vegetables', ARRAY['general', 'children', 'pregnant_women', 'malnourished_children'], 9, 'short'),
  ('Fresh Fruits', ARRAY['children', 'pregnant_women', 'malnourished_children', 'elderly'], 8, 'short'),
  ('Meat & Poultry', ARRAY['general', 'children', 'pregnant_women', 'elderly'], 10, 'short'),
  ('Fish & Seafood', ARRAY['general', 'children', 'pregnant_women', 'malnourished_children'], 9, 'short'),
  ('Bread & Bakery', ARRAY['general', 'children', 'families_with_infants'], 7, 'short'),
  ('Eggs', ARRAY['general', 'children', 'families_with_infants', 'pregnant_women', 'malnourished_children'], 9, 'medium'),
  ('Cooking Oil', ARRAY['general', 'families_with_infants'], 8, 'long'),
  ('Dried Goods', ARRAY['general', 'children', 'elderly'], 8, 'long'),
  ('Baby Food', ARRAY['families_with_infants'], 10, 'medium'),
  ('Infant Formula', ARRAY['families_with_infants'], 10, 'long'),
  ('Ready-to-Eat Meals', ARRAY['general', 'elderly'], 7, 'short'),
  ('Beverages', ARRAY['general', 'children'], 5, 'long'),
  ('Condiments & Spices', ARRAY['general'], 5, 'long'),
  ('Noodles & Pasta', ARRAY['general', 'children'], 8, 'long'),
  ('Snacks', ARRAY['children'], 4, 'medium'),
  ('Preserved Foods', ARRAY['general', 'elderly'], 7, 'long'),
  ('Others', ARRAY['general'], 5, 'medium')
ON CONFLICT (category_name) DO NOTHING;

-- Verify inserted data
SELECT category_name, target_demographics, nutritional_priority, shelf_life_category 
FROM food_categories 
ORDER BY nutritional_priority DESC, category_name;
