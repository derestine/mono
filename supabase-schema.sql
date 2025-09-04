-- ===== LOYALTY SYSTEM DATABASE SCHEMA FOR SUPABASE =====
-- Designed for the merchant portal with QR code scanning and transaction processing
-- Optimized for Supabase's PostgreSQL environment with RLS and auth integration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== CORE TABLES =====

-- Merchants table - stores merchant information
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255) UNIQUE NOT NULL,
    business_phone VARCHAR(20),
    business_address TEXT,
    tax_id VARCHAR(50),
    merchant_code VARCHAR(50) UNIQUE NOT NULL, -- Unique identifier for QR codes
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    subscription_plan VARCHAR(20) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- Supabase auth integration (optional)
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Customers table - stores customer information
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code VARCHAR(50) UNIQUE NOT NULL, -- QR code identifier
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    total_transactions INTEGER DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_visit_at TIMESTAMPTZ,
    
    -- Supabase auth integration (optional)
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ===== TRANSACTION TABLES =====

-- Transactions table - stores all customer transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    transaction_code VARCHAR(50) UNIQUE NOT NULL, -- Internal transaction reference
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    transaction_type VARCHAR(20) DEFAULT 'purchase' CHECK (transaction_type IN ('purchase', 'refund', 'adjustment')),
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'mobile', 'other')),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction items table - for detailed line items (optional)
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== LOYALTY SYSTEM TABLES =====

-- Loyalty programs table - merchant-specific loyalty configurations
CREATE TABLE loyalty_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    program_name VARCHAR(255) NOT NULL,
    points_per_dollar DECIMAL(5,2) DEFAULT 1.00,
    minimum_redemption_points INTEGER DEFAULT 100,
    point_value_in_cents INTEGER DEFAULT 1, -- 1 point = 1 cent
    expiration_days INTEGER, -- NULL means no expiration
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(merchant_id, program_name)
);

-- Customer loyalty accounts table - tracks points per merchant
CREATE TABLE customer_loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
    current_points INTEGER DEFAULT 0,
    total_points_earned INTEGER DEFAULT 0,
    total_points_redeemed INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(customer_id, merchant_id)
);

-- Points transactions table - tracks all point movements
CREATE TABLE points_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_loyalty_account_id UUID NOT NULL REFERENCES customer_loyalty_accounts(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    points_change INTEGER NOT NULL, -- Positive for earned, negative for redeemed
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'adjusted')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== ANALYTICS & REPORTING TABLES =====

-- Daily merchant analytics - aggregated daily stats
CREATE TABLE merchant_daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_sales DECIMAL(12,2) DEFAULT 0.00,
    total_transactions INTEGER DEFAULT 0,
    unique_customers INTEGER DEFAULT 0,
    average_transaction_value DECIMAL(10,2) DEFAULT 0.00,
    total_points_earned INTEGER DEFAULT 0,
    total_points_redeemed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(merchant_id, date)
);

-- Customer visit tracking - for customer analytics
CREATE TABLE customer_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    visit_count INTEGER DEFAULT 1,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(customer_id, merchant_id, visit_date)
);

-- ===== SYSTEM TABLES =====

-- QR code logs - tracks QR code scans for security
CREATE TABLE qr_scan_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    scanned_code VARCHAR(50) NOT NULL,
    scan_result VARCHAR(20) NOT NULL CHECK (scan_result IN ('success', 'invalid', 'expired', 'blocked')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System settings - configuration table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== AUDIT TABLES =====

-- Audit logs - tracks important system changes
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID, -- Could reference auth.users if using Supabase auth
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDEXES FOR PERFORMANCE =====

-- Transaction indexes
CREATE INDEX idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_merchant_date ON transactions(merchant_id, created_at);
CREATE INDEX idx_transactions_customer_date ON transactions(customer_id, created_at);

-- Customer indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_customer_code ON customers(customer_code);

-- Merchant indexes
CREATE INDEX idx_merchants_merchant_code ON merchants(merchant_code);
CREATE INDEX idx_merchants_email ON merchants(business_email);

-- Loyalty indexes
CREATE INDEX idx_loyalty_programs_merchant_id ON loyalty_programs(merchant_id);
CREATE INDEX idx_customer_loyalty_accounts_customer_id ON customer_loyalty_accounts(customer_id);
CREATE INDEX idx_customer_loyalty_accounts_merchant_id ON customer_loyalty_accounts(merchant_id);
CREATE INDEX idx_points_transactions_account_id ON points_transactions(customer_loyalty_account_id);
CREATE INDEX idx_points_transactions_created_at ON points_transactions(created_at);

-- Analytics indexes
CREATE INDEX idx_merchant_daily_analytics_merchant_id ON merchant_daily_analytics(merchant_id);
CREATE INDEX idx_merchant_daily_analytics_date ON merchant_daily_analytics(date);
CREATE INDEX idx_customer_visits_customer_id ON customer_visits(customer_id);
CREATE INDEX idx_customer_visits_merchant_id ON customer_visits(merchant_id);
CREATE INDEX idx_customer_visits_visit_date ON customer_visits(visit_date);

-- QR scan indexes
CREATE INDEX idx_qr_scan_logs_merchant_id ON qr_scan_logs(merchant_id);
CREATE INDEX idx_qr_scan_logs_customer_id ON qr_scan_logs(customer_id);
CREATE INDEX idx_qr_scan_logs_created_at ON qr_scan_logs(created_at);

-- Audit indexes
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at);

-- ===== VIEWS FOR COMMON QUERIES =====

-- Merchant dashboard view
CREATE VIEW merchant_dashboard AS
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
    COALESCE(SUM(pta.points_change), 0) as total_points_earned,
    COALESCE(SUM(CASE WHEN pta.transaction_type = 'redeemed' THEN ABS(pta.points_change) ELSE 0 END), 0) as total_points_redeemed
FROM merchants m
LEFT JOIN transactions t ON m.id = t.merchant_id AND t.status = 'completed'
LEFT JOIN points_transactions pta ON t.id = pta.transaction_id AND pta.transaction_type = 'earned'
GROUP BY m.id, m.business_name, m.merchant_code, m.status;

-- Customer summary view
CREATE VIEW customer_summary AS
SELECT 
    c.id as customer_id,
    c.customer_code,
    c.first_name,
    c.last_name,
    c.email,
    c.total_spent,
    c.total_transactions,
    c.loyalty_points,
    c.last_visit_at,
    COUNT(t.id) as recent_transactions,
    COALESCE(SUM(t.amount), 0) as recent_spent
FROM customers c
LEFT JOIN transactions t ON c.id = t.customer_id 
    AND t.created_at >= NOW() - INTERVAL '30 days'
    AND t.status = 'completed'
GROUP BY c.id, c.customer_code, c.first_name, c.last_name, c.email, 
         c.total_spent, c.total_transactions, c.loyalty_points, c.last_visit_at;

-- ===== TRIGGERS FOR DATA INTEGRITY =====

-- Update customer totals when transaction is created
CREATE OR REPLACE FUNCTION update_customer_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE customers 
        SET 
            total_spent = total_spent + NEW.amount,
            total_transactions = total_transactions + 1,
            last_visit_at = NEW.created_at,
            updated_at = NOW()
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_totals
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_totals();

-- Update loyalty points when transaction is completed
CREATE OR REPLACE FUNCTION update_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
    points_to_award INTEGER;
    loyalty_account_id UUID;
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Get loyalty program points per dollar
        SELECT 
            lp.points_per_dollar * NEW.amount,
            cla.id
        INTO points_to_award, loyalty_account_id
        FROM loyalty_programs lp
        JOIN customer_loyalty_accounts cla ON lp.id = cla.loyalty_program_id
        WHERE lp.merchant_id = NEW.merchant_id 
        AND cla.customer_id = NEW.customer_id
        AND lp.status = 'active';
        
        IF points_to_award > 0 AND loyalty_account_id IS NOT NULL THEN
            -- Insert points transaction
            INSERT INTO points_transactions (
                customer_loyalty_account_id,
                transaction_id,
                points_change,
                transaction_type,
                description
            ) VALUES (
                loyalty_account_id,
                NEW.id,
                points_to_award,
                'earned',
                'Points earned from transaction'
            );
            
            -- Update loyalty account
            UPDATE customer_loyalty_accounts
            SET 
                current_points = current_points + points_to_award,
                total_points_earned = total_points_earned + points_to_award,
                last_activity_at = NOW(),
                updated_at = NOW()
            WHERE id = loyalty_account_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_loyalty_points
    AFTER UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_loyalty_points();

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_programs_updated_at BEFORE UPDATE ON loyalty_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_loyalty_accounts_updated_at BEFORE UPDATE ON customer_loyalty_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merchant_daily_analytics_updated_at BEFORE UPDATE ON merchant_daily_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_visits_updated_at BEFORE UPDATE ON customer_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== ROW LEVEL SECURITY (RLS) POLICIES =====

-- Enable RLS on all tables
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Merchant policies (merchants can only access their own data)
CREATE POLICY "Merchants can view own data" ON merchants FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Merchants can update own data" ON merchants FOR UPDATE USING (auth.uid() = auth_user_id);

-- Customer policies (customers can only access their own data)
CREATE POLICY "Customers can view own data" ON customers FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Customers can update own data" ON customers FOR UPDATE USING (auth.uid() = auth_user_id);

-- Transaction policies (merchants can access transactions for their business)
CREATE POLICY "Merchants can view own transactions" ON transactions FOR SELECT USING (
    merchant_id IN (SELECT id FROM merchants WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Merchants can create transactions" ON transactions FOR INSERT WITH CHECK (
    merchant_id IN (SELECT id FROM merchants WHERE auth_user_id = auth.uid())
);

-- Loyalty program policies
CREATE POLICY "Merchants can manage own loyalty programs" ON loyalty_programs FOR ALL USING (
    merchant_id IN (SELECT id FROM merchants WHERE auth_user_id = auth.uid())
);

-- Customer loyalty account policies
CREATE POLICY "Merchants can view customer loyalty accounts" ON customer_loyalty_accounts FOR SELECT USING (
    merchant_id IN (SELECT id FROM merchants WHERE auth_user_id = auth.uid())
);

-- Points transaction policies
CREATE POLICY "Merchants can view points transactions" ON points_transactions FOR SELECT USING (
    customer_loyalty_account_id IN (
        SELECT cla.id FROM customer_loyalty_accounts cla 
        JOIN merchants m ON cla.merchant_id = m.id 
        WHERE m.auth_user_id = auth.uid()
    )
);

-- Analytics policies
CREATE POLICY "Merchants can view own analytics" ON merchant_daily_analytics FOR SELECT USING (
    merchant_id IN (SELECT id FROM merchants WHERE auth_user_id = auth.uid())
);

-- QR scan log policies
CREATE POLICY "Merchants can view own scan logs" ON qr_scan_logs FOR SELECT USING (
    merchant_id IN (SELECT id FROM merchants WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Merchants can create scan logs" ON qr_scan_logs FOR INSERT WITH CHECK (
    merchant_id IN (SELECT id FROM merchants WHERE auth_user_id = auth.uid())
);

-- System settings policies (admin only)
CREATE POLICY "System settings admin only" ON system_settings FOR ALL USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@loyalty.com')
);

-- ===== SAMPLE DATA INSERTION =====

-- Insert sample merchant
INSERT INTO merchants (business_name, business_email, merchant_code) 
VALUES ('Sample Coffee Shop', 'coffee@example.com', 'COFFEE001');

-- Insert sample customer
INSERT INTO customers (customer_code, first_name, last_name, email) 
VALUES ('CUST001', 'John', 'Doe', 'john.doe@example.com');

-- Insert sample loyalty program
INSERT INTO loyalty_programs (merchant_id, program_name, points_per_dollar)
SELECT id, 'Coffee Rewards', 2.00 FROM merchants WHERE merchant_code = 'COFFEE001';

-- Insert sample customer loyalty account
INSERT INTO customer_loyalty_accounts (customer_id, merchant_id, loyalty_program_id)
SELECT 
    c.id, 
    m.id, 
    lp.id
FROM customers c, merchants m, loyalty_programs lp
WHERE c.customer_code = 'CUST001' 
AND m.merchant_code = 'COFFEE001'
AND lp.merchant_id = m.id;

-- Insert sample system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('default_points_per_dollar', '1.0', 'number', 'Default loyalty points per dollar spent'),
('qr_code_expiry_days', '365', 'number', 'Number of days before QR codes expire'),
('max_transaction_amount', '10000.00', 'number', 'Maximum transaction amount allowed'),
('enable_audit_logging', 'true', 'boolean', 'Enable comprehensive audit logging');

-- ===== SUPABASE SPECIFIC FUNCTIONS =====

-- Function to get merchant dashboard data
CREATE OR REPLACE FUNCTION get_merchant_dashboard(merchant_uuid UUID)
RETURNS TABLE (
    merchant_id UUID,
    business_name VARCHAR,
    merchant_code VARCHAR,
    merchant_status VARCHAR,
    total_sales DECIMAL,
    total_transactions BIGINT,
    unique_customers BIGINT,
    average_transaction_value DECIMAL,
    total_points_earned BIGINT,
    total_points_redeemed BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM merchant_dashboard WHERE merchant_id = merchant_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new transaction
CREATE OR REPLACE FUNCTION create_transaction(
    p_merchant_id UUID,
    p_customer_id UUID,
    p_amount DECIMAL,
    p_payment_method VARCHAR DEFAULT 'cash',
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
    transaction_id UUID,
    transaction_code VARCHAR,
    loyalty_points_earned INTEGER
) AS $$
DECLARE
    v_transaction_id UUID;
    v_transaction_code VARCHAR;
    v_points_earned INTEGER := 0;
BEGIN
    -- Generate transaction code
    v_transaction_code := 'TXN-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || FLOOR(RANDOM() * 1000)::TEXT;
    
    -- Insert transaction
    INSERT INTO transactions (
        merchant_id, 
        customer_id, 
        transaction_code, 
        amount, 
        payment_method, 
        notes,
        status
    ) VALUES (
        p_merchant_id, 
        p_customer_id, 
        v_transaction_code, 
        p_amount, 
        p_payment_method, 
        p_notes,
        'completed'
    ) RETURNING id INTO v_transaction_id;
    
    -- Get points earned
    SELECT COALESCE(lp.points_per_dollar * p_amount, 0) INTO v_points_earned
    FROM loyalty_programs lp
    JOIN customer_loyalty_accounts cla ON lp.id = cla.loyalty_program_id
    WHERE lp.merchant_id = p_merchant_id 
    AND cla.customer_id = p_customer_id
    AND lp.status = 'active';
    
    RETURN QUERY SELECT v_transaction_id, v_transaction_code, v_points_earned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to scan QR code and get customer info
CREATE OR REPLACE FUNCTION scan_qr_code(
    p_merchant_id UUID,
    p_customer_code VARCHAR,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    customer_id UUID,
    customer_name VARCHAR,
    current_points INTEGER,
    error_message TEXT
) AS $$
DECLARE
    v_customer_id UUID;
    v_customer_name VARCHAR;
    v_current_points INTEGER;
    v_scan_result VARCHAR;
BEGIN
    -- Check if customer exists
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

-- ===== AUTH TRIGGERS =====

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_business_name TEXT;
    v_merchant_code VARCHAR;
    v_merchant_id UUID;
BEGIN
    -- Only process if this is a merchant user
    IF NEW.raw_user_meta_data->>'role' = 'merchant' THEN
        -- Extract business name from metadata
        v_business_name := COALESCE(NEW.raw_user_meta_data->>'business_name', 'Unnamed Business');
        
        -- Generate unique merchant code
        v_merchant_code := 'MERCH-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        
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
            NEW.email,
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create merchant record when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
