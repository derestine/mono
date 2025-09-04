-- ===== CLEAN UP AUTH STATE =====
-- Run this to clean up any broken auth/merchant records

-- Option 1: Delete all existing users and merchants (if you want to start fresh)
-- DELETE FROM merchants WHERE id IS NOT NULL;
-- DELETE FROM auth.users WHERE id IS NOT NULL;

-- Option 2: Just check what exists first
SELECT 'Users' as table_type, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'Merchants' as table_type, COUNT(*) as count FROM merchants;

-- Show users without merchant profiles
SELECT 
    u.id as user_id,
    u.email,
    u.created_at,
    CASE WHEN m.id IS NULL THEN 'NO MERCHANT PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users u
LEFT JOIN merchants m ON u.id = m.auth_user_id
ORDER BY u.created_at DESC;