-- ===== SUPABASE FUNCTIONS FIX V2 =====
-- Run this in your Supabase SQL Editor to fix the dashboard function

-- Drop the old function first
DROP FUNCTION IF EXISTS get_merchant_dashboard(uuid);

-- Function to get merchant dashboard data using auth_user_id
CREATE OR REPLACE FUNCTION get_merchant_dashboard(auth_user_uuid UUID)
RETURNS TABLE (
    merchant_id UUID,
    business_name VARCHAR,
    merchant_code VARCHAR,
    merchant_status VARCHAR,
    total_sales NUMERIC,
    total_transactions BIGINT,
    unique_customers BIGINT,
    average_transaction_value NUMERIC,
    total_points_earned BIGINT,
    total_points_redeemed BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as merchant_id,
        m.business_name,
        m.merchant_code,
        m.status as merchant_status,
        COALESCE(SUM(t.amount), 0) as total_sales,
        COUNT(t.id) as total_transactions,
        COUNT(DISTINCT t.customer_id) as unique_customers,
        CASE 
            WHEN COUNT(t.id) > 0 THEN AVG(t.amount)
            ELSE 0 
        END as average_transaction_value,
        COALESCE(SUM(CASE WHEN pta.transaction_type = 'earned' THEN pta.points_change ELSE 0 END), 0) as total_points_earned,
        COALESCE(SUM(CASE WHEN pta.transaction_type = 'redeemed' THEN ABS(pta.points_change) ELSE 0 END), 0) as total_points_redeemed
    FROM merchants m
    LEFT JOIN transactions t ON m.id = t.merchant_id AND t.status = 'completed'
    LEFT JOIN points_transactions pta ON t.id = pta.transaction_id
    WHERE m.auth_user_id = auth_user_uuid
    GROUP BY m.id, m.business_name, m.merchant_code, m.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_merchant_dashboard TO authenticated;