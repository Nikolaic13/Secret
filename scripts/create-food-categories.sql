-- Create food_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS food_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    target_demographics TEXT[] NOT NULL,
    nutritional_priority INTEGER NOT NULL CHECK (nutritional_priority >= 1 AND nutritional_priority <= 10),
    shelf_life_category VARCHAR(20) NOT NULL CHECK (shelf_life_category IN ('short', 'medium', 'long')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clear existing data
DELETE FROM food_categories;

-- Insert food categories with proper demographic targeting
INSERT INTO food_categories (category_name, target_demographics, nutritional_priority, shelf_life_category, description) VALUES
('Baby Food', ARRAY['families_with_infants'], 10, 'medium', 'Specialized nutrition for infants and toddlers'),
('Dairy', ARRAY['children', 'families_with_infants', 'pregnant_women'], 9, 'short', 'Milk, cheese, yogurt - high calcium and protein'),
('Meat', ARRAY['general', 'malnourished', 'pregnant_women'], 8, 'short', 'Fresh and processed meats - high protein content'),
('Grains', ARRAY['general', 'malnourished'], 8, 'long', 'Rice, bread, pasta - staple carbohydrates'),
('Vegetables', ARRAY['general', 'children', 'elderly'], 7, 'short', 'Fresh vegetables - vitamins and minerals'),
('Fruits', ARRAY['children', 'elderly', 'pregnant_women'], 6, 'short', 'Fresh fruits - vitamins and natural sugars'),
('Canned Goods', ARRAY['general'], 5, 'long', 'Preserved foods with long shelf life'),
('Snacks', ARRAY['children'], 3, 'medium', 'Packaged snacks and treats'),
('Beverages', ARRAY['general'], 2, 'medium', 'Non-alcoholic drinks and juices');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_food_category_name ON food_categories(category_name);

-- Verify the data
SELECT 
    category_name, 
    target_demographics, 
    nutritional_priority, 
    shelf_life_category 
FROM food_categories 
ORDER BY nutritional_priority DESC;

-- Show demographic targeting summary
SELECT 
    unnest(target_demographics) as demographic,
    COUNT(*) as categories_targeting,
    ARRAY_AGG(category_name) as categories
FROM food_categories 
GROUP BY unnest(target_demographics)
ORDER BY categories_targeting DESC;
