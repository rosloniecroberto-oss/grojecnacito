/*
  # Add waste zones and streets support

  1. Schema Changes
    - Add `zone` column to waste_areas (e.g., "M1", "M2", "W1")
    - Add `streets` column as text array to store multiple streets per zone
    - Extend waste_type enum to include additional types from official schedule:
      - 'green' (zielone - trawa, liście, kwiaty, gałęzie)
      - 'bulky' (wielkogabarytowe)
      - 'ash' (popiół)
      - 'textiles' (tekstylia)

  2. Purpose
    - Support zone-based waste collection schedules
    - Allow multiple streets per zone
    - Match official municipality schedule format
*/

-- Add zone column to waste_areas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'waste_areas' AND column_name = 'zone'
  ) THEN
    ALTER TABLE waste_areas ADD COLUMN zone text;
  END IF;
END $$;

-- Add streets column as text array
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'waste_areas' AND column_name = 'streets'
  ) THEN
    ALTER TABLE waste_areas ADD COLUMN streets text[] DEFAULT '{}';
  END IF;
END $$;

-- Drop and recreate the constraint with extended waste types
ALTER TABLE waste_schedules DROP CONSTRAINT IF EXISTS waste_schedules_waste_type_check;

ALTER TABLE waste_schedules
  ADD CONSTRAINT waste_schedules_waste_type_check
  CHECK (waste_type IN ('bio', 'mixed', 'plastic', 'paper', 'glass', 'green', 'bulky', 'ash', 'textiles'));

-- Add index on zone for faster lookups
CREATE INDEX IF NOT EXISTS idx_waste_areas_zone ON waste_areas(zone);

-- Add index on streets for array searches
CREATE INDEX IF NOT EXISTS idx_waste_areas_streets ON waste_areas USING GIN(streets);
