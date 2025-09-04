-- ===== MERCHANT BUSINESS INFORMATION MIGRATION =====
-- Adds location, currency, and business details to merchants table

-- Add new columns to merchants table
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS country VARCHAR(3) DEFAULT 'SGP', -- ISO country codes
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'SGD', -- ISO currency codes
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Singapore',
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS website VARCHAR(255);

-- Set default values based on country for existing records
UPDATE merchants 
SET currency = CASE 
    WHEN country = 'MYS' THEN 'MYR'
    WHEN country = 'SGP' THEN 'SGD'
    ELSE 'SGD'
END
WHERE currency IS NULL OR currency = 'SGD';

UPDATE merchants 
SET timezone = CASE 
    WHEN country = 'MYS' THEN 'Asia/Kuala_Lumpur'
    WHEN country = 'SGP' THEN 'Asia/Singapore'
    ELSE 'Asia/Singapore'
END
WHERE timezone IS NULL OR timezone = 'Asia/Singapore';

-- Add constraints to ensure valid values
ALTER TABLE merchants 
ADD CONSTRAINT check_country 
CHECK (country IN ('SGP', 'MYS'));

ALTER TABLE merchants 
ADD CONSTRAINT check_currency 
CHECK (currency IN ('SGD', 'MYR'));

-- Create index for better performance on location-based queries
CREATE INDEX IF NOT EXISTS idx_merchants_country_currency 
ON merchants(country, currency);

-- Update loyalty_programs to automatically use correct points_per_dollar based on merchant currency
-- This ensures existing programs get the correct conversion rate
UPDATE loyalty_programs 
SET points_per_dollar = 1.0
WHERE merchant_id IN (
    SELECT id FROM merchants WHERE currency IN ('SGD', 'MYR')
);

-- Add default opening hours for existing merchants
UPDATE merchants 
SET opening_hours = '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "09:00", "close": "17:00", "closed": false},
    "sunday": {"open": "10:00", "close": "16:00", "closed": false}
}'::jsonb
WHERE opening_hours IS NULL OR opening_hours = '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN merchants.country IS 'ISO 3166-1 alpha-3 country code (SGP, MYS)';
COMMENT ON COLUMN merchants.currency IS 'ISO 4217 currency code (SGD, MYR)';
COMMENT ON COLUMN merchants.opening_hours IS 'JSON object with opening hours for each day of the week';
COMMENT ON COLUMN merchants.timezone IS 'Timezone identifier for business location';

-- Verify the migration
SELECT 
    business_name,
    country,
    currency,
    timezone,
    CASE 
        WHEN opening_hours IS NOT NULL THEN 'Set'
        ELSE 'Not Set'
    END as opening_hours_status
FROM merchants
LIMIT 5;