-- ===== LOYALTY SYSTEM DATABASE SCHEMA =====
-- Designed for the merchant portal with QR code scanning and transaction processing

-- ===== CORE TABLES =====

-- Merchants table - stores merchant information
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255) UNIQUE NOT NULL,
    business_phone VARCHAR(20),
    business_address TEXT,
    tax_id VARCHAR(50),
    merchant_code VARCHAR(50) UNIQUE NOT NULL, -- Unique identifier for QR codes
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    subscription_plan VARCHAR(20) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Customers table - stores customer information
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit_at TIMESTAMP WITH TIME ZONE
);

-- ===== TRANSACTION TABLES =====

-- Transactions table - stores all customer transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    transaction_code VARCHAR(50) UNIQUE NOT NULL, -- Internal transaction reference
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    transaction_type VARCHAR(20) DEFAULT 'purchase' CHECK (transaction_type IN ('purchase', 'refund', 'adjustment')),
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'mobile', 'other')),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_transactions_merchant_id (merchant_id),
    INDEX idx_transactions_customer_id (customer_id),
    INDEX idx_transactions_created_at (created_at),
    INDEX idx_transactions_status (status)
);

-- Transaction items table - for detailed line items (optional)
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_transaction_items_transaction_id (transaction_id)
);

-- ===== LOYALTY SYSTEM TABLES =====

-- Loyalty programs table - merchant-specific loyalty configurations
CREATE TABLE loyalty_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    program_name VARCHAR(255) NOT NULL,
    points_per_dollar DECIMAL(5,2) DEFAULT 1.00,
    minimum_redemption_points INTEGER DEFAULT 100,
    point_value_in_cents INTEGER DEFAULT 1, -- 1 point = 1 cent
    expiration_days INTEGER, -- NULL means no expiration
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(merchant_id, program_name),
    INDEX idx_loyalty_programs_merchant_id (merchant_id)
);

-- Customer loyalty accounts table - tracks points per merchant
CREATE TABLE customer_loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
    current_points INTEGER DEFAULT 0,
    total_points_earned INTEGER DEFAULT 0,
    total_points_redeemed INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(customer_id, merchant_id),
    INDEX idx_customer_loyalty_accounts_customer_id (customer_id),
    INDEX idx_customer_loyalty_accounts_merchant_id (merchant_id)
);

-- Points transactions table - tracks all point movements
CREATE TABLE points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_loyalty_account_id UUID NOT NULL REFERENCES customer_loyalty_accounts(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    points_change INTEGER NOT NULL, -- Positive for earned, negative for redeemed
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'adjusted')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_points_transactions_account_id (customer_loyalty_account_id),
    INDEX idx_points_transactions_created_at (created_at)
);

-- ===== ANALYTICS & REPORTING TABLES =====

-- Daily merchant analytics - aggregated daily stats
CREATE TABLE merchant_daily_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_sales DECIMAL(12,2) DEFAULT 0.00,
    total_transactions INTEGER DEFAULT 0,
    unique_customers INTEGER DEFAULT 0,
    average_transaction_value DECIMAL(10,2) DEFAULT 0.00,
    total_points_earned INTEGER DEFAULT 0,
    total_points_redeemed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(merchant_id, date),
    INDEX idx_merchant_daily_analytics_merchant_id (merchant_id),
    INDEX idx_merchant_daily_analytics_date (date)
);

-- Customer visit tracking - for customer analytics
CREATE TABLE customer_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    visit_count INTEGER DEFAULT 1,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(customer_id, merchant_id, visit_date),
    INDEX idx_customer_visits_customer_id (customer_id),
    INDEX idx_customer_visits_merchant_id (merchant_id),
    INDEX idx_customer_visits_visit_date (visit_date)
);

-- ===== SYSTEM TABLES =====

-- QR code logs - tracks QR code scans for security
CREATE TABLE qr_scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    scanned_code VARCHAR(50) NOT NULL,
    scan_result VARCHAR(20) NOT NULL CHECK (scan_result IN ('success', 'invalid', 'expired', 'blocked')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_qr_scan_logs_merchant_id (merchant_id),
    INDEX idx_qr_scan_logs_customer_id (customer_id),
    INDEX idx_qr_scan_logs_created_at (created_at)
);

-- System settings - configuration table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== AUDIT TABLES =====

-- Audit logs - tracks important system changes
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID, -- Could reference a users table if implemented
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_audit_logs_table_name (table_name),
    INDEX idx_audit_logs_record_id (record_id),
    INDEX idx_audit_logs_changed_at (changed_at)
);

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

-- ===== INDEXES FOR PERFORMANCE =====

-- Additional indexes for common query patterns
CREATE INDEX idx_transactions_merchant_date ON transactions(merchant_id, created_at);
CREATE INDEX idx_transactions_customer_date ON transactions(customer_id, created_at);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_customer_code ON customers(customer_code);
CREATE INDEX idx_merchants_merchant_code ON merchants(merchant_code);
CREATE INDEX idx_merchants_email ON merchants(business_email);
