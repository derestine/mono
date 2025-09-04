-- ===== LOYALTY PROGRAMS RLS POLICIES FIX =====
-- This adds the missing UPDATE and DELETE policies for loyalty_programs table

-- First, enable RLS on loyalty_programs (in case it's not enabled)
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Merchants can view own loyalty programs" ON loyalty_programs;
DROP POLICY IF EXISTS "Merchants can insert own loyalty programs" ON loyalty_programs;
DROP POLICY IF EXISTS "Merchants can update own loyalty programs" ON loyalty_programs;
DROP POLICY IF EXISTS "Merchants can delete own loyalty programs" ON loyalty_programs;

-- Recreate all necessary policies
CREATE POLICY "Merchants can view own loyalty programs" ON loyalty_programs
    FOR SELECT USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Merchants can insert own loyalty programs" ON loyalty_programs
    FOR INSERT WITH CHECK (
        merchant_id IN (
            SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Merchants can update own loyalty programs" ON loyalty_programs
    FOR UPDATE USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        merchant_id IN (
            SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Merchants can delete own loyalty programs" ON loyalty_programs
    FOR DELETE USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        )
    );

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'loyalty_programs';

-- Test that the current user can access their loyalty programs
-- This will help debug if there are still issues
SELECT 'RLS Test: Can view loyalty programs' as test_name,
       COUNT(*) as count
FROM loyalty_programs
WHERE merchant_id IN (
    SELECT id FROM merchants WHERE auth_user_id = auth.uid()
);