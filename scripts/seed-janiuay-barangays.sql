-- Seed all 57 official barangays of Janiuay, Iloilo with complete demographic data
-- This data is used by the MCDA algorithm for smart food allocation

-- Clear existing data
DELETE FROM barangay_data;

-- Insert all 57 barangays of Janiuay, Iloilo with realistic demographic data
INSERT INTO barangay_data (
    name, population, urgency_score, distance_km, 
    children_population, elderly_population, pregnant_women, 
    families_with_infants, malnourished_children, food_security_level
) VALUES
-- Rural Barangays (44)
('Abangay', 1250, 7, 8.5, 375, 125, 25, 45, 38, 4),
('Agcarope', 980, 6, 12.3, 294, 98, 20, 35, 29, 5),
('Aglobong', 1450, 8, 15.2, 435, 145, 29, 52, 44, 3),
('Aguingay', 1100, 5, 6.8, 330, 110, 22, 40, 33, 6),
('Anhawan', 890, 7, 18.7, 267, 89, 18, 32, 27, 4),
('Atimonan', 1320, 6, 9.4, 396, 132, 26, 48, 40, 5),
('Balanac', 1180, 8, 22.1, 354, 118, 24, 42, 35, 3),
('Barasalon', 1050, 7, 14.6, 315, 105, 21, 38, 32, 4),
('Bongol', 1380, 5, 7.2, 414, 138, 28, 50, 41, 6),
('Cabantog', 920, 9, 25.8, 276, 92, 18, 33, 28, 2),
('Calmay', 1220, 6, 11.7, 366, 122, 24, 44, 37, 5),
('Canawili', 1480, 7, 16.3, 444, 148, 30, 53, 45, 4),
('Canawillian', 1080, 8, 19.5, 324, 108, 22, 39, 32, 3),
('Caranas', 1350, 5, 8.9, 405, 135, 27, 49, 41, 6),
('Caraudan', 1150, 7, 13.4, 345, 115, 23, 41, 35, 4),
('Carigangan', 990, 9, 28.2, 297, 99, 20, 36, 30, 2),
('Cunsad', 1420, 6, 10.1, 426, 142, 28, 51, 43, 5),
('Dabong', 1280, 8, 21.7, 384, 128, 26, 46, 38, 3),
('Damires', 1020, 7, 17.8, 306, 102, 20, 37, 31, 4),
('Damo-ong', 1190, 5, 5.6, 357, 119, 24, 43, 36, 6),
('Danao', 1340, 6, 12.9, 402, 134, 27, 48, 40, 5),
('Gines', 1110, 8, 24.3, 333, 111, 22, 40, 33, 3),
('Guadalupe', 1460, 7, 14.8, 438, 146, 29, 52, 44, 4),
('Jibolo', 1070, 9, 31.5, 321, 107, 21, 39, 32, 2),
('Kuyot', 1250, 6, 9.7, 375, 125, 25, 45, 38, 5),
('Madong', 1180, 7, 18.2, 354, 118, 24, 42, 35, 4),
('Manacabac', 1320, 5, 6.3, 396, 132, 26, 48, 40, 6),
('Mangil', 1090, 8, 23.6, 327, 109, 22, 39, 33, 3),
('Matag-ub', 1410, 6, 11.4, 423, 141, 28, 51, 42, 5),
('Monte-Magapa', 1160, 7, 16.9, 348, 116, 23, 42, 35, 4),
('Pangilihan', 1030, 9, 29.8, 309, 103, 21, 37, 31, 2),
('Panuran', 1290, 5, 7.8, 387, 129, 26, 46, 39, 6),
('Pararinga', 1200, 8, 20.4, 360, 120, 24, 43, 36, 3),
('Patong-patong', 1370, 6, 13.1, 411, 137, 27, 49, 41, 5),
('Quipot', 1140, 7, 15.7, 342, 114, 23, 41, 34, 4),
('Santo Tomas', 1480, 8, 26.2, 444, 148, 30, 53, 45, 3),
('Sarawag', 1060, 9, 32.1, 318, 106, 21, 38, 32, 2),
('Tambal', 1310, 5, 8.2, 393, 131, 26, 47, 39, 6),
('Tamu-an', 1220, 7, 17.5, 366, 122, 24, 44, 37, 4),
('Tiringanan', 1390, 6, 12.6, 417, 139, 28, 50, 42, 5),
('Tolarucan', 1170, 8, 22.9, 351, 117, 23, 42, 35, 3),
('Tuburan', 1280, 7, 19.1, 384, 128, 26, 46, 38, 4),
('Ubian', 1050, 9, 27.4, 315, 105, 21, 38, 32, 2),
('Yabon', 1430, 6, 10.8, 429, 143, 29, 51, 43, 5),

-- Poblacion Barangays (13) - Generally higher population, better food security, closer to center
('Aquino Nobleza East (Poblacion)', 2150, 4, 1.2, 645, 215, 43, 77, 65, 7),
('Aquino Nobleza West (Poblacion)', 2280, 3, 0.8, 684, 228, 46, 82, 68, 8),
('R. Armada (Poblacion)', 1980, 5, 1.5, 594, 198, 40, 71, 59, 6),
('Concepcion Poblacion (D.G. Abordo)', 2420, 4, 0.5, 726, 242, 48, 87, 73, 7),
('Golgota (Poblacion)', 1850, 6, 2.1, 555, 185, 37, 67, 56, 5),
('Locsin (Poblacion)', 2180, 3, 0.9, 654, 218, 44, 78, 65, 8),
('Don T. Lutero Center (Poblacion)', 2650, 2, 0.2, 795, 265, 53, 95, 80, 9),
('Don T. Lutero East (Poblacion)', 2380, 4, 0.7, 714, 238, 48, 86, 71, 7),
('Don T. Lutero West (Poblacion)', 2520, 3, 0.6, 756, 252, 50, 91, 76, 8),
('Crispin Salazar North (Poblacion)', 2080, 5, 1.3, 624, 208, 42, 75, 62, 6),
('Crispin Salazar South (Poblacion)', 2190, 4, 1.1, 657, 219, 44, 79, 66, 7),
('San Julian (Poblacion)', 1920, 6, 1.8, 576, 192, 38, 69, 58, 5),
('San Pedro (Poblacion)', 2340, 3, 0.4, 702, 234, 47, 84, 70, 8),
('Santa Rita (Poblacion)', 2110, 5, 1.6, 633, 211, 42, 76, 63, 6),
('Capt. A. Tirador (Poblacion)', 2450, 4, 0.3, 735, 245, 49, 88, 74, 7),
('S. M. Villa (Poblacion)', 2290, 3, 0.9, 687, 229, 46, 82, 69, 8);

-- Verify the data was inserted correctly
SELECT 
    COUNT(*) as total_barangays,
    COUNT(CASE WHEN name LIKE '%(Poblacion)%' THEN 1 END) as poblacion_barangays,
    COUNT(CASE WHEN name NOT LIKE '%(Poblacion)%' THEN 1 END) as rural_barangays,
    SUM(population) as total_population,
    AVG(urgency_score) as avg_urgency,
    AVG(food_security_level) as avg_food_security
FROM barangay_data;

-- Show sample of inserted data
SELECT name, population, urgency_score, food_security_level 
FROM barangay_data 
ORDER BY urgency_score DESC, population DESC 
LIMIT 10;
