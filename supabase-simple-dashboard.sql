-- ===== SIMPLE DASHBOARD FUNCTION =====
-- Run this in your Supabase SQL Editor for a basic working dashboard

-- Drop the problematic function
DROP FUNCTION IF EXISTS get_merchant_dashboard(uuid);

-- Create a very simple dashboard function that just returns merchant info with zero stats
CREATE OR REPLACE FUNCTION get_merchant_dashboard(auth_user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'merchant_id', m.id,
        'business_name', m.business_name,
        'merchant_code', m.merchant_code,
        'merchant_status', m.status,
        'total_sales', 0.00,
        'total_transactions', 0,
        'unique_customers', 0,
        'average_transaction_value', 0.00,
        'total_points_earned', 0,
        'total_points_redeemed', 0
    ) INTO result
    FROM merchants m
    WHERE m.auth_user_id = auth_user_uuid;
    
    -- Return empty stats if merchant not found
    IF result IS NULL THEN
        result := json_build_object(
            'merchant_id', auth_user_uuid,
            'business_name', 'Your Business',
            'merchant_code', 'TEMP',
            'merchant_status', 'active',
            'total_sales', 0.00,
            'total_transactions', 0,
            'unique_customers', 0,
            'average_transaction_value', 0.00,
            'total_points_earned', 0,
            'total_points_redeemed', 0
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_merchant_dashboard TO authenticated;