/*
  # Extend Waste Types
  
  ## Overview
  Adds support for additional waste types to match Grójec municipal guidelines.
  
  ## Changes
  
  1. Modified Tables
    - `waste_schedules` - Extended waste_type constraint to include:
      - 'bulky' (Wielkogabarytowe)
      - 'ash' (Popiół)
      - 'textiles' (Tekstylia)
  
  ## Important Notes
  - This migration extends the existing CHECK constraint on waste_type
  - Existing data ('bio', 'mixed', 'plastic', 'paper', 'glass') remains valid
  - No data loss occurs as we're only adding new valid values
*/

-- Drop the existing CHECK constraint on waste_type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'waste_schedules_waste_type_check'
  ) THEN
    ALTER TABLE waste_schedules DROP CONSTRAINT waste_schedules_waste_type_check;
  END IF;
END $$;

-- Add the new constraint with extended waste types
ALTER TABLE waste_schedules 
ADD CONSTRAINT waste_schedules_waste_type_check 
CHECK (waste_type IN ('bio', 'mixed', 'plastic', 'paper', 'glass', 'bulky', 'ash', 'textiles'));