-- ===== FIXED AUTH TRIGGERS =====

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS handle_new_user();

-- Function to handle new user registration (FIXED VERSION)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_business_name TEXT;
    v_merchant_code VARCHAR;
    v_merchant_id UUID;
    v_user_role TEXT;
    v_user_business_name TEXT;
BEGIN
    -- Safely extract metadata
    v_user_role := COALESCE(NEW.raw_user_meta_data->>'role', '');
    v_user_business_name := COALESCE(NEW.raw_user_meta_data->>'business_name', '');
    
    -- Only process if this is a merchant user
    IF v_user_role = 'merchant' THEN
        -- Extract business name from metadata
        v_business_name := COALESCE(v_user_business_name, 'Unnamed Business');
        
        -- Generate unique merchant code (simplified)
        v_merchant_code := 'MERCH-' || UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex') FROM 1 FOR 8));
        
        -- Create merchant record
        INSERT INTO merchants (
            auth_user_id,
            business_name,
            business_email,
            merchant_code,
            status,
            subscription_plan
        ) VALUES (
            NEW.id,
            v_business_name,
            COALESCE(NEW.email, ''),
            v_merchant_code,
            'active',
            'basic'
        ) RETURNING id INTO v_merchant_id;
        
        -- Create default loyalty program for the merchant
        INSERT INTO loyalty_programs (
            merchant_id,
            program_name,
            points_per_dollar,
            minimum_redemption_points,
            point_value_in_cents,
            status
        ) VALUES (
            v_merchant_id,
            'Default Rewards',
            1.00,
            100,
            1,
            'active'
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create merchant record when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
