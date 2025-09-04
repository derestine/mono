-- ===== SUPABASE COMPLETE SCHEMA =====
-- Run this entire file in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== TABLES =====

-- Merchants table
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255) NOT NULL,
    merchant_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    subscription_plan VARCHAR(20) DEFAULT 'basic',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    total_visits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash',
    status VARCHAR(20) DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loyalty programs table
CREATE TABLE IF NOT EXISTS loyalty_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    program_name VARCHAR(255) NOT NULL,
    points_per_dollar DECIMAL(5,2) DEFAULT 1.00,
    minimum_redemption_points INTEGER DEFAULT 100,
    point_value_in_cents INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer loyalty accounts table
CREATE TABLE IF NOT EXISTS customer_loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    loyalty_program_id UUID REFERENCES loyalty_programs(id) ON DELETE CASCADE,
    current_points INTEGER DEFAULT 0,
    total_points_earned INTEGER DEFAULT 0,
    total_points_redeemed INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, merchant_id)
);

-- Points transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_loyalty_account_id UUID REFERENCES customer_loyalty_accounts(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    points_change INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- 'earned', 'redeemed', 'expired'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR scan logs table
CREATE TABLE IF NOT EXISTS qr_scan_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    scanned_code VARCHAR(100) NOT NULL,
    scan_result VARCHAR(20) NOT NULL, -- 'success', 'invalid', 'error'
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDEXES =====

CREATE INDEX IF NOT EXISTS idx_merchants_auth_user_id ON merchants(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_merchants_merchant_code ON merchants(merchant_code);
CREATE INDEX IF NOT EXISTS idx_customers_merchant_id ON customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customers_customer_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_programs_merchant_id ON loyalty_programs(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_accounts_customer_id ON customer_loyalty_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_accounts_merchant_id ON customer_loyalty_accounts(merchant_id);

-- ===== ROW LEVEL SECURITY (RLS) =====

-- Enable RLS on all tables
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scan_logs ENABLE ROW LEVEL SECURITY;

-- Merchants policies
CREATE POLICY "Merchants can view own profile" ON merchants
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Merchants can update own profile" ON merchants
    FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Merchants can insert own profile" ON merchants
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Customers policies
CREATE POLICY "Merchants can view own customers" ON customers
    FOR SELECT USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Merchants can insert own customers" ON customers
    FOR INSERT WITH CHECK (
        merchant_id IN (
            SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Merchants can update own customers" ON customers
    FOR UPDATE USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        )
    );

-- Transactions policies
CREATE POLICY "Merchants can view own transactions" ON transactions
    FOR SELECT USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Merchants can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (
        merchant_id IN (
            SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        )
    );

-- Loyalty programs policies
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

-- Customer loyalty accounts policies
CREATE POLICY "Merchants can view own customer loyalty accounts" ON customer_loyalty_accounts
    FOR SELECT USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Merchants can insert own customer loyalty accounts" ON customer_loyalty_accounts
    FOR INSERT WITH CHECK (
        merchant_id IN (
            SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        )
    );

-- Points transactions policies
CREATE POLICY "Merchants can view own points transactions" ON points_transactions
    FOR SELECT USING (
        customer_loyalty_account_id IN (
            SELECT cla.id FROM customer_loyalty_accounts cla
            JOIN merchants m ON cla.merchant_id = m.id
            WHERE m.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Merchants can insert own points transactions" ON points_transactions
    FOR INSERT WITH CHECK (
        customer_loyalty_account_id IN (
            SELECT cla.id FROM customer_loyalty_accounts cla
            JOIN merchants m ON cla.merchant_id = m.id
            WHERE m.auth_user_id = auth.uid()
        )
    );

-- QR scan logs policies
CREATE POLICY "Merchants can view own QR scan logs" ON qr_scan_logs
    FOR SELECT USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Merchants can insert own QR scan logs" ON qr_scan_logs
    FOR INSERT WITH CHECK (
        merchant_id IN (
            SELECT id FROM merchants WHERE auth_user_id = auth.uid()
        )
    );

-- ===== FUNCTIONS =====

-- Function to handle new user registration
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
        
        -- Generate unique merchant code
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

-- Function to get merchant dashboard data
CREATE OR REPLACE FUNCTION get_merchant_dashboard(merchant_uuid UUID)
RETURNS TABLE (
    total_sales DECIMAL(10,2),
    unique_customers BIGINT,
    average_spend DECIMAL(10,2),
    total_transactions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(t.amount), 0.00) as total_sales,
        COUNT(DISTINCT t.customer_id) as unique_customers,
        CASE 
            WHEN COUNT(t.id) > 0 THEN COALESCE(SUM(t.amount) / COUNT(t.id), 0.00)
            ELSE 0.00
        END as average_spend,
        COUNT(t.id) as total_transactions
    FROM transactions t
    WHERE t.merchant_id = merchant_uuid
    AND t.status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create transaction
CREATE OR REPLACE FUNCTION create_transaction(
    p_merchant_id UUID,
    p_customer_id UUID,
    p_amount DECIMAL(10,2),
    p_payment_method VARCHAR(50) DEFAULT 'cash',
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_transaction_code VARCHAR(50);
    v_loyalty_account_id UUID;
    v_points_earned INTEGER;
    v_loyalty_program_id UUID;
    v_points_per_dollar DECIMAL(5,2);
BEGIN
    -- Generate transaction code
    v_transaction_code := 'TXN-' || UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex') FROM 1 FOR 8));
    
    -- Create transaction
    INSERT INTO transactions (
        merchant_id,
        customer_id,
        transaction_code,
        amount,
        payment_method,
        notes
    ) VALUES (
        p_merchant_id,
        p_customer_id,
        v_transaction_code,
        p_amount,
        p_payment_method,
        p_notes
    ) RETURNING id INTO v_transaction_id;
    
    -- Get loyalty program for merchant
    SELECT id, points_per_dollar INTO v_loyalty_program_id, v_points_per_dollar
    FROM loyalty_programs
    WHERE merchant_id = p_merchant_id AND status = 'active'
    LIMIT 1;
    
    -- If loyalty program exists, handle points
    IF v_loyalty_program_id IS NOT NULL THEN
        -- Get or create customer loyalty account
        SELECT id INTO v_loyalty_account_id
        FROM customer_loyalty_accounts
        WHERE customer_id = p_customer_id AND merchant_id = p_merchant_id;
        
        IF v_loyalty_account_id IS NULL THEN
            INSERT INTO customer_loyalty_accounts (
                customer_id,
                merchant_id,
                loyalty_program_id,
                current_points,
                total_points_earned
            ) VALUES (
                p_customer_id,
                p_merchant_id,
                v_loyalty_program_id,
                0,
                0
            ) RETURNING id INTO v_loyalty_account_id;
        END IF;
        
        -- Calculate points earned
        v_points_earned := FLOOR(p_amount * v_points_per_dollar);
        
        -- Add points transaction
        INSERT INTO points_transactions (
            customer_loyalty_account_id,
            transaction_id,
            points_change,
            transaction_type,
            description
        ) VALUES (
            v_loyalty_account_id,
            v_transaction_id,
            v_points_earned,
            'earned',
            'Points earned from transaction'
        );
        
        -- Update customer loyalty account
        UPDATE customer_loyalty_accounts
        SET 
            current_points = current_points + v_points_earned,
            total_points_earned = total_points_earned + v_points_earned,
            updated_at = NOW()
        WHERE id = v_loyalty_account_id;
    END IF;
    
    -- Update customer total spent
    UPDATE customers
    SET 
        total_spent = total_spent + p_amount,
        total_visits = total_visits + 1,
        updated_at = NOW()
    WHERE id = p_customer_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to scan QR code
CREATE OR REPLACE FUNCTION scan_qr_code(
    p_merchant_id UUID,
    p_customer_code VARCHAR(50),
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    customer_id UUID,
    customer_name VARCHAR(255),
    current_points INTEGER,
    error_message TEXT
) AS $$
DECLARE
    v_customer_id UUID;
    v_customer_name VARCHAR(255);
    v_current_points INTEGER;
    v_scan_result VARCHAR(20);
BEGIN
    -- Find customer by code
    SELECT 
        c.id,
        c.first_name || ' ' || c.last_name,
        COALESCE(cla.current_points, 0)
    INTO v_customer_id, v_customer_name, v_current_points
    FROM customers c
    LEFT JOIN customer_loyalty_accounts cla ON c.id = cla.customer_id AND cla.merchant_id = p_merchant_id
    WHERE c.customer_code = p_customer_code AND c.status = 'active';
    
    -- Determine scan result
    IF v_customer_id IS NOT NULL THEN
        v_scan_result := 'success';
    ELSE
        v_scan_result := 'invalid';
    END IF;
    
    -- Log the scan
    INSERT INTO qr_scan_logs (
        merchant_id, 
        customer_id, 
        scanned_code, 
        scan_result, 
        ip_address, 
        user_agent
    ) VALUES (
        p_merchant_id, 
        v_customer_id, 
        p_customer_code, 
        v_scan_result, 
        p_ip_address, 
        p_user_agent
    );
    
    -- Return results
    IF v_customer_id IS NOT NULL THEN
        RETURN QUERY SELECT TRUE, v_customer_id, v_customer_name, v_current_points, NULL::TEXT;
    ELSE
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, 0, 'Customer not found or inactive';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== TRIGGERS =====

-- Trigger to create merchant record when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ===== SAMPLE DATA (OPTIONAL) =====

-- Insert a sample merchant for testing (optional)
-- INSERT INTO merchants (auth_user_id, business_name, business_email, merchant_code, status, subscription_plan)
-- VALUES (
--     'your-test-user-id-here',
--     'Test Business',
--     'test@example.com',
--     'MERCH-TEST123',
--     'active',
--     'basic'
-- );

-- ===== VERIFICATION QUERIES =====

-- Check if tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%merchant%' OR table_name LIKE '%customer%' OR table_name LIKE '%transaction%';

-- Check if trigger exists
-- SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';

-- Check if functions exist
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('handle_new_user', 'get_merchant_dashboard', 'create_transaction', 'scan_qr_code');
