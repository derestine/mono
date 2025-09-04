-- ===== LOYALTY PROGRAM STAMPS SUPPORT MIGRATION =====
-- This adds support for both points and stamps-based loyalty programs

-- Add missing columns to loyalty_programs table
ALTER TABLE loyalty_programs 
ADD COLUMN IF NOT EXISTS program_type VARCHAR(20) DEFAULT 'points',
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Update existing records to have the name field populated
UPDATE loyalty_programs 
SET name = program_name 
WHERE name IS NULL AND program_name IS NOT NULL;

-- Set default name for records that don't have program_name
UPDATE loyalty_programs 
SET name = 'Default Loyalty Program' 
WHERE name IS NULL;

-- Make name column NOT NULL after populating it
ALTER TABLE loyalty_programs 
ALTER COLUMN name SET NOT NULL;

-- Add check constraint to ensure program_type is valid
ALTER TABLE loyalty_programs 
ADD CONSTRAINT check_program_type 
CHECK (program_type IN ('points', 'stamps'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_loyalty_programs_merchant_type 
ON loyalty_programs(merchant_id, program_type);

-- Update the points calculation logic comment
COMMENT ON COLUMN loyalty_programs.program_type IS 'Type of loyalty program: points (earn based on spending) or stamps (earn based on visits)';
COMMENT ON COLUMN loyalty_programs.points_per_dollar IS 'For points programs: points earned per dollar spent. For stamps programs: not used (always 1 per visit)';