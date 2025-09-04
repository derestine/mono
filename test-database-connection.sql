-- ===== TEST DATABASE CONNECTION =====
-- Run this in Supabase SQL Editor to verify everything is working

-- 1. Check if merchants table has data
SELECT COUNT(*) as merchant_count FROM merchants;

-- 2. Check specific merchant profiles  
SELECT 
    id,
    auth_user_id,
    business_name,
    business_email,
    merchant_code,
    created_at
FROM merchants
ORDER BY created_at DESC
LIMIT 5;

-- 3. Test the dashboard function
SELECT get_merchant_dashboard('YOUR_AUTH_USER_ID_HERE');
-- Replace YOUR_AUTH_USER_ID_HERE with an actual user ID from auth.users

-- 4. Check auth users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check if transactions table exists and has structure
SELECT COUNT(*) as transaction_count FROM transactions;

-- 6. Test the create_merchant_profile function
SELECT create_merchant_profile('YOUR_AUTH_USER_ID_HERE', 'Test Business Name');
-- This will either create a profile or show an error if user doesn't exist