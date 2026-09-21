-- Comprehensive check of representative accounts and system status

SELECT '=== SYSTEM STATUS CHECK ===' as section;

-- Check if required tables exist
SELECT 
    'Tables Status' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN '✅ profiles'
        ELSE '❌ profiles MISSING'
    END ||
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'barangay_data') THEN ' | ✅ barangay_data'
        ELSE ' | ❌ barangay_data MISSING'
    END ||
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'food_categories') THEN ' | ✅ food_categories'
        ELSE ' | ❌ food_categories MISSING'
    END as status;

-- Check auth users
SELECT '=== AUTH USERS ===' as section;
SELECT 
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- Check profiles table
SELECT '=== PROFILES ===' as section;
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    barangay,
    approval_status,
    created_at
FROM profiles 
WHERE role IN ('municipal', 'barangay', 'admin')
ORDER BY role, created_at DESC;

-- Check barangay data
SELECT '=== BARANGAY DATA ===' as section;
SELECT 
    COUNT(*) as total_barangays,
    COUNT(CASE WHEN name LIKE '%(Poblacion)%' THEN 1 END) as poblacion_count,
    COUNT(CASE WHEN name NOT LIKE '%(Poblacion)%' THEN 1 END) as rural_count,
    MIN(population) as min_population,
    MAX(population) as max_population,
    AVG(urgency_score)::DECIMAL(3,1) as avg_urgency
FROM barangay_data;

-- Show sample barangays
SELECT 'Sample Barangays:' as info;
SELECT name, population, urgency_score, food_security_level
FROM barangay_data 
ORDER BY urgency_score DESC 
LIMIT 5;

-- Check food categories
SELECT '=== FOOD CATEGORIES ===' as section;
SELECT 
    COUNT(*) as total_categories,
    STRING_AGG(category_name, ', ' ORDER BY nutritional_priority DESC) as categories
FROM food_categories;

-- Check for orphaned profiles (profiles without auth users)
SELECT '=== ORPHANED PROFILES ===' as section;
SELECT 
    p.id,
    p.email,
    p.role,
    'No matching auth user' as issue
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL AND p.role IN ('municipal', 'barangay');

-- Check for auth users without profiles
SELECT '=== AUTH USERS WITHOUT PROFILES ===' as section;
SELECT 
    u.id,
    u.email,
    'No profile created' as issue
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Final recommendations
SELECT '=== RECOMMENDATIONS ===' as section;
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM barangay_data) = 57 THEN '✅ All 57 Janiuay barangays loaded'
        ELSE '❌ Missing barangay data - run seed-janiuay-barangays.sql'
    END ||
    CASE 
        WHEN (SELECT COUNT(*) FROM food_categories) >= 6 THEN ' | ✅ Food categories loaded'
        ELSE ' | ❌ Missing food categories - run create-food-categories.sql'
    END ||
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE role = 'municipal' AND approval_status = 'approved') 
        THEN ' | ✅ Municipal rep ready'
        ELSE ' | ❌ No approved municipal rep - create auth user and profile'
    END as system_status;
