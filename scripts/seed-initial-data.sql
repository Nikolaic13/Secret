-- Seed initial data for FoodShare Janiuay

-- Insert food categories
INSERT INTO food_categories (name, description, nutritional_priority) VALUES
('Rice & Grains', 'Staple foods including rice, corn, wheat products', 1),
('Canned Goods', 'Preserved foods in cans and jars', 2),
('Dried Goods', 'Dried beans, lentils, pasta, and other shelf-stable items', 2),
('Fresh Produce', 'Fresh fruits and vegetables', 3),
('Protein Sources', 'Meat, fish, eggs, and dairy products', 3),
('Snacks & Beverages', 'Packaged snacks, drinks, and treats', 4),
('Baby Food', 'Infant formula, baby food, and related items', 1),
('Condiments & Spices', 'Cooking ingredients and flavor enhancers', 4)
ON CONFLICT (name) DO NOTHING;

-- Insert Janiuay barangay data with realistic demographic information
INSERT INTO barangay_data (
    barangay_name, population, households, poverty_rate, malnutrition_rate, 
    vulnerable_population, distance_from_center, food_security_score, urgency_score
) VALUES
-- Urban/Central Barangays (lower urgency)
('Poblacion Ilawod', 2850, 570, 15.2, 8.5, 285, 0.0, 7.5, 2.1),
('Poblacion Ilaya', 2650, 530, 16.8, 9.2, 265, 0.5, 7.2, 2.3),
('Poblacion Tabuc Suba', 2200, 440, 18.5, 10.1, 220, 0.8, 6.8, 2.5),

-- Semi-urban Barangays (moderate urgency)
('Agboy', 1850, 370, 22.3, 12.8, 237, 3.2, 6.2, 3.1),
('Anhawan', 1650, 330, 24.1, 13.5, 223, 4.1, 5.9, 3.3),
('Bago', 1750, 350, 23.8, 13.2, 231, 3.8, 6.0, 3.2),
('Bagacay', 1950, 390, 21.9, 12.5, 244, 2.9, 6.3, 3.0),
('Balabag', 1550, 310, 25.2, 14.1, 219, 4.5, 5.7, 3.5),
('Barasbar', 1450, 290, 26.8, 15.2, 220, 5.2, 5.4, 3.7),
('Bungca', 1350, 270, 28.1, 16.0, 216, 5.8, 5.2, 3.9),

-- Rural Barangays (higher urgency)
('Cabugao Norte', 1250, 250, 32.5, 18.5, 231, 8.5, 4.5, 4.5),
('Cabugao Sur', 1180, 236, 33.8, 19.2, 227, 9.2, 4.3, 4.7),
('Dalipe', 1080, 216, 35.2, 20.1, 217, 10.5, 4.0, 4.9),
('Gines', 980, 196, 37.1, 21.5, 211, 12.3, 3.7, 5.2),
('Guinacas', 1150, 230, 34.5, 19.8, 228, 9.8, 4.2, 4.8),
('Jaguimitan', 1320, 264, 29.8, 17.2, 227, 6.5, 4.8, 4.1),
('Lanag', 1420, 284, 28.5, 16.5, 234, 5.9, 5.0, 3.8),

-- Remote Barangays (highest urgency)
('Lonoy', 850, 170, 42.3, 25.8, 220, 15.8, 3.2, 6.1),
('Magdungao', 920, 184, 40.8, 24.5, 225, 14.2, 3.4, 5.8),
('Malayuan', 780, 156, 45.2, 27.3, 213, 18.5, 2.9, 6.5),
('Nanga', 1050, 210, 38.9, 22.8, 240, 11.8, 3.8, 5.4),
('Pal-agon', 950, 190, 41.5, 25.1, 238, 16.2, 3.1, 6.0),
('Panuran', 1100, 220, 36.8, 21.2, 233, 10.8, 3.9, 5.1),
('Quipot', 880, 176, 43.1, 26.2, 231, 17.1, 3.0, 6.2),
('Sablogon', 1200, 240, 33.2, 18.8, 226, 8.8, 4.4, 4.6),
('Tagubanhan', 1380, 276, 27.9, 15.8, 218, 5.5, 5.1, 3.7),
('Tubungan', 1480, 296, 26.2, 14.9, 222, 4.8, 5.5, 3.4),
('Yolanda', 1680, 336, 24.8, 13.8, 232, 4.2, 5.8, 3.3)

ON CONFLICT (barangay_name) DO UPDATE SET
    population = EXCLUDED.population,
    households = EXCLUDED.households,
    poverty_rate = EXCLUDED.poverty_rate,
    malnutrition_rate = EXCLUDED.malnutrition_rate,
    vulnerable_population = EXCLUDED.vulnerable_population,
    distance_from_center = EXCLUDED.distance_from_center,
    food_security_score = EXCLUDED.food_security_score,
    urgency_score = EXCLUDED.urgency_score,
    updated_at = NOW();
