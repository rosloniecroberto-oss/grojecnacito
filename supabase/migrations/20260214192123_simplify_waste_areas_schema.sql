/*
  # Simplify waste areas schema
  
  1. Changes
    - Remove `zone` column (not needed for UX)
    - Remove `streets` array column (each street = separate record)
    - Keep simple structure: type (city/village) + name (street/village name)
  
  2. Purpose
    - Simplify data entry - one record per street/village
    - Better UX - search by street name directly
    - Easier maintenance
*/

-- Drop the zone column
ALTER TABLE waste_areas DROP COLUMN IF EXISTS zone;

-- Drop the streets array column
ALTER TABLE waste_areas DROP COLUMN IF EXISTS streets;

-- Drop indexes that are no longer needed
DROP INDEX IF EXISTS idx_waste_areas_zone;
DROP INDEX IF EXISTS idx_waste_areas_streets;
