/*
  # Add Navigation Fields to Parishes

  1. Changes
    - Add `google_place_id` column to `parishes` table
    - Add `navigation_link` column to `parishes` table
    
  2. Purpose
    - Enable direct navigation to parish locations
    - Store Google Maps Place ID for accurate location data
*/

-- Add navigation fields to parishes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parishes' AND column_name = 'google_place_id'
  ) THEN
    ALTER TABLE parishes ADD COLUMN google_place_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parishes' AND column_name = 'navigation_link'
  ) THEN
    ALTER TABLE parishes ADD COLUMN navigation_link text;
  END IF;
END $$;