-- ===== DEBUG: CHECK MERCHANTS TABLE =====
-- Run this in your Supabase SQL Editor to see what merchants exist

-- Check if merchants table exists and has data
SELECT 
    COUNT(*) as total_merchants,
    COUNT(CASE WHEN auth_user_id IS NOT NULL THEN 1 END) as merchants_with_auth
FROM merchants;

-- Show all merchants
SELECT 
    id,
    auth_user_id,
    business_name,
    business_email,
    merchant_code,
    status,
    created_at
FROM merchants
ORDER BY created_at DESC
LIMIT 10;

-- Check auth users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;