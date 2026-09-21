-- Seed barangay demographic data for Janiuay, Iloilo
-- Data based on municipal records and estimates for MCDA algorithm

INSERT INTO barangay_data (
  name, 
  population, 
  urgency_score, 
  distance_km,
  children_population,
  elderly_population,
  pregnant_women,
  families_with_infants,
  malnourished_children,
  food_security_level
) VALUES
  -- Rural Barangays (Generally higher need, farther distance)
  ('Abangay', 2150, 7.5, 12.5, 580, 215, 18, 45, 32, 4),
  ('Agcarope', 1890, 7.0, 10.2, 510, 189, 15, 38, 28, 4),
  ('Aglobong', 2340, 8.0, 14.3, 632, 234, 20, 52, 38, 3),
  ('Aguingay', 1650, 6.5, 9.8, 445, 165, 14, 35, 25, 5),
  ('Anhawan', 2580, 8.5, 15.7, 697, 258, 22, 58, 42, 3),
  ('Atimonan', 1920, 7.2, 11.4, 518, 192, 16, 40, 30, 4),
  ('Balanac', 2010, 7.3, 13.1, 543, 201, 17, 42, 31, 4),
  ('Barasalon', 1780, 6.8, 10.5, 481, 178, 15, 37, 27, 5),
  ('Bongol', 2450, 8.2, 16.2, 662, 245, 21, 54, 40, 3),
  ('Cabantog', 1590, 6.2, 8.9, 429, 159, 13, 33, 24, 5),
  
  ('Calmay', 2120, 7.6, 12.8, 572, 212, 18, 44, 32, 4),
  ('Canawili', 1970, 7.1, 11.7, 532, 197, 17, 41, 30, 4),
  ('Canawillian', 1850, 6.9, 10.8, 500, 185, 16, 39, 28, 5),
  ('Caranas', 2290, 7.9, 14.6, 618, 229, 19, 48, 36, 4),
  ('Caraudan', 2035, 7.4, 13.3, 550, 204, 17, 43, 31, 4),
  ('Carigangan', 1740, 6.7, 10.1, 470, 174, 15, 36, 26, 5),
  ('Cunsad', 2180, 7.7, 13.5, 588, 218, 18, 46, 33, 4),
  ('Dabong', 1680, 6.6, 9.6, 454, 168, 14, 35, 26, 5),
  ('Damires', 2370, 8.1, 15.1, 640, 237, 20, 50, 37, 3),
  ('Damo-ong', 1925, 7.2, 11.9, 520, 193, 16, 40, 29, 4),
  
  ('Danao', 2510, 8.4, 16.5, 678, 251, 21, 55, 41, 3),
  ('Gines', 2075, 7.5, 12.2, 560, 208, 18, 43, 32, 4),
  ('Guadalupe', 1820, 6.9, 10.4, 491, 182, 15, 38, 27, 5),
  ('Jibolo', 2430, 8.3, 15.8, 656, 243, 21, 54, 39, 3),
  ('Kuyot', 1760, 6.8, 10.2, 475, 176, 15, 37, 27, 5),
  ('Madong', 2250, 7.8, 14.2, 608, 225, 19, 47, 35, 4),
  ('Manacabac', 1895, 7.1, 11.5, 512, 190, 16, 40, 29, 4),
  ('Mangil', 2140, 7.6, 13.0, 578, 214, 18, 45, 33, 4),
  ('Matag-ub', 1670, 6.6, 9.5, 451, 167, 14, 35, 25, 5),
  ('Monte-Magapa', 2310, 8.0, 14.8, 624, 231, 20, 49, 37, 4),
  
  ('Pangilihan', 1950, 7.3, 11.8, 527, 195, 17, 41, 30, 4),
  ('Panuran', 2095, 7.5, 12.6, 566, 210, 18, 44, 32, 4),
  ('Pararinga', 1805, 6.9, 10.6, 487, 181, 15, 38, 27, 5),
  ('Patong-patong', 2280, 7.9, 14.5, 616, 228, 19, 48, 36, 4),
  ('Quipot', 1715, 6.7, 9.9, 463, 172, 14, 36, 26, 5),
  ('Santo Tomas', 2195, 7.7, 13.7, 593, 220, 19, 46, 34, 4),
  ('Sarawag', 1885, 7.0, 11.3, 509, 189, 16, 39, 29, 4),
  ('Tambal', 2415, 8.2, 15.6, 652, 242, 21, 53, 39, 3),
  ('Tamu-an', 1640, 6.5, 9.3, 443, 164, 14, 34, 25, 5),
  ('Tiringanan', 2160, 7.7, 13.2, 583, 216, 18, 45, 33, 4),
  
  ('Tolarucan', 1795, 6.9, 10.5, 485, 180, 15, 38, 27, 5),
  ('Tuburan', 2345, 8.0, 14.9, 633, 235, 20, 51, 38, 3),
  ('Ubian', 1710, 6.7, 9.8, 462, 171, 14, 36, 26, 5),
  ('Yabon', 2265, 7.9, 14.3, 611, 227, 19, 47, 35, 4),
  
  -- Poblacion Barangays (Urban, generally lower need, closer distance)
  ('Aquino Nobleza East (Poblacion)', 1250, 4.5, 0.5, 313, 125, 11, 26, 15, 7),
  ('Aquino Nobleza West (Poblacion)', 1180, 4.3, 0.6, 295, 118, 10, 25, 14, 7),
  ('R. Armada (Poblacion)', 1420, 5.0, 0.8, 355, 142, 12, 30, 17, 6),
  ('Concepcion Poblacion (D.G. Abordo)', 1310, 4.7, 0.7, 327, 131, 11, 27, 16, 7),
  ('Golgota (Poblacion)', 1095, 4.0, 0.4, 274, 110, 9, 23, 13, 8),
  ('Locsin (Poblacion)', 1385, 4.9, 0.9, 346, 139, 12, 29, 17, 6),
  ('Don T. Lutero Center (Poblacion)', 1520, 5.2, 0.3, 380, 152, 13, 32, 18, 6),
  ('Don T. Lutero East (Poblacion)', 1275, 4.6, 0.5, 319, 128, 11, 27, 15, 7),
  ('Don T. Lutero West (Poblacion)', 1195, 4.4, 0.6, 299, 120, 10, 25, 14, 7),
  ('Crispin Salazar North (Poblacion)', 1340, 4.8, 0.7, 335, 134, 11, 28, 16, 7),
  ('Crispin Salazar South (Poblacion)', 1225, 4.5, 0.8, 306, 123, 10, 26, 15, 7),
  ('San Julian (Poblacion)', 1465, 5.1, 1.0, 366, 147, 12, 31, 18, 6),
  ('San Pedro (Poblacion)', 1155, 4.2, 0.5, 289, 116, 10, 24, 14, 7),
  ('Santa Rita (Poblacion)', 1395, 4.9, 0.9, 349, 140, 12, 29, 17, 6),
  ('Capt. A. Tirador (Poblacion)', 1285, 4.7, 0.7, 321, 129, 11, 27, 15, 7),
  ('S. M. Villa (Poblacion)', 1105, 4.1, 0.4, 276, 111, 9, 23, 13, 8)
ON CONFLICT (name) DO NOTHING;

-- Verify inserted data
SELECT name, population, urgency_score, distance_km, food_security_level 
FROM barangay_data 
ORDER BY urgency_score DESC, name
LIMIT 20;
