-- Add opening_hours column to merchants table
-- This migration adds support for storing business operating hours

-- Add the opening_hours column as JSONB to store structured hours data
ALTER TABLE merchants 
ADD COLUMN opening_hours JSONB DEFAULT '{
  "monday": {"open": "09:00", "close": "18:00", "closed": false},
  "tuesday": {"open": "09:00", "close": "18:00", "closed": false}, 
  "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
  "thursday": {"open": "09:00", "close": "18:00", "closed": false},
  "friday": {"open": "09:00", "close": "18:00", "closed": false},
  "saturday": {"open": "09:00", "close": "17:00", "closed": false},
  "sunday": {"open": "10:00", "close": "16:00", "closed": false}
}'::jsonb;

-- Update existing merchants with default opening hours if they don't have any
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
WHERE opening_hours IS NULL;

-- Add a comment to document the column
COMMENT ON COLUMN merchants.opening_hours IS 'Business operating hours stored as JSONB with format: {"day": {"open": "HH:MM", "close": "HH:MM", "closed": boolean}}';