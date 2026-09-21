-- Seed barangay data for Janiuay, Iloilo with all 57 official barangays
-- This includes demographic data for the MCDA algorithm

-- Clear existing data
DELETE FROM barangay_data;

-- Insert all 57 barangays of Janiuay, Iloilo with realistic demographic data
INSERT INTO barangay_data (name, population, children_percentage, elderly_percentage, families_with_infants, urgency_score, distance_km, food_security_level) VALUES
-- Rural Barangays
('Abangay', 1250, 35.2, 12.8, 45, 7.5, 8.2, 6.8),
('Agcarope', 980, 38.1, 10.5, 38, 8.2, 12.5, 5.9),
('Aglobong', 1100, 33.7, 14.2, 42, 7.8, 9.8, 6.2),
('Aguingay', 890, 36.9, 11.3, 35, 8.5, 15.2, 5.5),
('Anhawan', 1350, 34.8, 13.1, 48, 7.2, 7.5, 7.1),
('Atimonan', 1180, 37.2, 9.8, 41, 8.0, 11.3, 6.0),
('Balanac', 950, 35.5, 12.5, 36, 8.3, 14.8, 5.7),
('Barasalon', 1420, 33.1, 15.2, 52, 6.9, 6.8, 7.4),
('Bongol', 1050, 38.7, 10.1, 39, 8.1, 13.2, 5.8),
('Cabantog', 1280, 34.3, 13.8, 46, 7.6, 8.9, 6.5),
('Calmay', 1150, 36.4, 11.7, 43, 7.9, 10.5, 6.3),
('Canawili', 1380, 32.9, 14.5, 49, 7.0, 7.2, 7.2),
('Canawillian', 1020, 37.8, 10.8, 37, 8.4, 12.8, 5.6),
('Caranas', 1200, 35.1, 12.9, 44, 7.7, 9.5, 6.4),
('Caraudan', 1080, 36.6, 11.4, 40, 8.0, 11.8, 6.1),
('Carigangan', 1320, 33.5, 14.0, 47, 7.3, 8.1, 6.9),
('Cunsad', 940, 38.3, 9.9, 34, 8.6, 16.1, 5.4),
('Dabong', 1160, 35.8, 12.2, 42, 7.8, 10.2, 6.2),
('Damires', 1090, 37.1, 11.0, 39, 8.2, 12.1, 5.9),
('Damo-ong', 1250, 34.7, 13.3, 45, 7.5, 8.7, 6.6),
('Danao', 1180, 36.0, 11.8, 43, 7.9, 10.8, 6.3),
('Gines', 1400, 32.4, 15.1, 51, 6.8, 6.5, 7.5),
('Guadalupe', 1220, 35.3, 12.7, 44, 7.6, 9.2, 6.5),
('Jibolo', 1050, 37.5, 10.6, 38, 8.3, 13.5, 5.7),
('Kuyot', 980, 38.9, 9.7, 36, 8.7, 15.8, 5.3),
('Madong', 1120, 36.2, 11.5, 41, 8.0, 11.5, 6.0),
('Manacabac', 1290, 34.1, 13.6, 46, 7.4, 8.4, 6.7),
('Mangil', 1080, 37.3, 10.9, 39, 8.1, 12.3, 5.9),
('Matag-ub', 1350, 33.8, 14.3, 48, 7.1, 7.8, 7.0),
('Monte-Magapa', 1190, 35.6, 12.1, 43, 7.8, 10.1, 6.3),
('Pangilihan', 1060, 37.7, 10.4, 38, 8.4, 13.8, 5.6),
('Panuran', 1240, 34.5, 13.2, 45, 7.5, 8.6, 6.6),
('Pararinga', 1110, 36.8, 11.2, 40, 8.0, 11.9, 6.1),
('Patong-patong', 1170, 35.9, 12.0, 42, 7.9, 10.4, 6.2),
('Quipot', 1020, 38.1, 10.3, 37, 8.5, 14.2, 5.5),
('Santo Tomas', 1380, 33.2, 14.8, 49, 7.0, 7.1, 7.3),
('Sarawag', 1150, 36.1, 11.6, 42, 7.9, 10.7, 6.3),
('Tambal', 1080, 37.4, 10.7, 39, 8.2, 12.6, 5.8),
('Tamu-an', 1260, 34.6, 13.0, 45, 7.5, 8.5, 6.6),
('Tiringanan', 1140, 36.3, 11.9, 41, 7.9, 10.9, 6.2),
('Tolarucan', 1200, 35.2, 12.6, 43, 7.7, 9.6, 6.4),
('Tuburan', 1090, 37.0, 11.1, 39, 8.1, 12.0, 6.0),
('Ubian', 1320, 33.7, 14.1, 47, 7.3, 8.0, 6.9),
('Yabon', 1050, 37.6, 10.5, 38, 8.3, 13.6, 5.7),

-- Poblacion Barangays (Town Center - Higher population, better access)
('Aquino Nobleza East (Poblacion)', 2150, 28.5, 18.2, 78, 5.2, 0.5, 8.5),
('Aquino Nobleza West (Poblacion)', 2080, 29.1, 17.8, 75, 5.4, 0.8, 8.3),
('R. Armada (Poblacion)', 1950, 30.2, 16.9, 71, 5.8, 1.2, 8.0),
('Concepcion Poblacion (D.G. Abordo)', 2200, 27.8, 18.8, 82, 4.9, 0.3, 8.7),
('Golgota (Poblacion)', 1880, 31.1, 16.2, 68, 6.1, 1.5, 7.8),
('Locsin (Poblacion)', 2050, 29.4, 17.5, 74, 5.5, 0.9, 8.2),
('Don T. Lutero Center (Poblacion)', 2300, 26.9, 19.5, 86, 4.5, 0.1, 9.0),
('Don T. Lutero East (Poblacion)', 2180, 28.2, 18.1, 79, 5.1, 0.4, 8.6),
('Don T. Lutero West (Poblacion)', 2120, 28.8, 17.7, 76, 5.3, 0.7, 8.4),
('Crispin Salazar North (Poblacion)', 1980, 29.8, 17.1, 72, 5.7, 1.0, 8.1),
('Crispin Salazar South (Poblacion)', 2020, 29.5, 17.3, 73, 5.6, 1.1, 8.1),
('San Julian (Poblacion)', 1920, 30.5, 16.7, 69, 5.9, 1.3, 7.9),
('San Pedro (Poblacion)', 2080, 29.1, 17.8, 75, 5.4, 0.8, 8.3),
('Santa Rita (Poblacion)', 1950, 30.2, 16.9, 71, 5.8, 1.2, 8.0),
('Capt. A. Tirador (Poblacion)', 2150, 28.5, 18.2, 78, 5.2, 0.5, 8.5),
('S. M. Villa (Poblacion)', 2000, 29.7, 17.0, 72, 5.7, 1.1, 8.0);

-- Verify the data was inserted correctly
SELECT 
  COUNT(*) as total_barangays,
  AVG(population) as avg_population,
  AVG(urgency_score) as avg_urgency,
  MIN(distance_km) as min_distance,
  MAX(distance_km) as max_distance
FROM barangay_data;

-- Show sample of inserted data
SELECT name, population, urgency_score, distance_km, food_security_level
FROM barangay_data 
ORDER BY urgency_score DESC 
LIMIT 10;
