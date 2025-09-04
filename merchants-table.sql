-- ===== MERCHANTS TABLE SETUP =====
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== MERCHANTS TABLE =====
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255) NOT NULL,
    merchant_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    subscription_plan VARCHAR(20) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_merchants_auth_user_id ON merchants(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_merchants_merchant_code ON merchants(merchant_code);
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);
CREATE INDEX IF NOT EXISTS idx_merchants_created_at ON merchants(created_at);

-- ===== ROW LEVEL SECURITY (RLS) =====
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- Policy: Merchants can only see their own profile
CREATE POLICY "Merchants can view own profile" ON merchants
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Policy: Merchants can update their own profile
CREATE POLICY "Merchants can update own profile" ON merchants
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Policy: Allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users" ON merchants
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- ===== FUNCTION TO CREATE MERCHANT PROFILE =====
CREATE OR REPLACE FUNCTION create_merchant_profile(
    user_id UUID,
    business_name_param VARCHAR(255)
)
RETURNS merchants
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_email VARCHAR(255);
    merchant_code_val VARCHAR(50);
    new_merchant merchants;
BEGIN
    -- Get user email from auth.users
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = user_id;
    
    IF user_email IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Generate unique merchant code
    merchant_code_val := 'MERCH-' || encode(gen_random_bytes(4), 'hex');
    
    -- Create merchant profile
    INSERT INTO merchants (
        auth_user_id,
        business_name,
        business_email,
        merchant_code,
        status,
        subscription_plan
    ) VALUES (
        user_id,
        business_name_param,
        user_email,
        merchant_code_val,
        'active',
        'basic'
    )
    RETURNING * INTO new_merchant;
    
    RETURN new_merchant;
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create merchant profile: %', SQLERRM;
END;
$$;

-- ===== GRANT PERMISSIONS =====
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON merchants TO authenticated;
GRANT EXECUTE ON FUNCTION create_merchant_profile TO authenticated;

-- ===== VERIFICATION QUERIES =====
-- Check if table exists
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'merchants';

-- Check if RLS is enabled
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'merchants';

-- Check policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'merchants';

-- Check function exists
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'create_merchant_profile';
