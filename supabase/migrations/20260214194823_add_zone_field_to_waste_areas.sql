/*
  # Add zone field to waste_areas

  1. Changes
    - Add optional `zone` column to `waste_areas` table
    - This allows grouping streets/villages into zones (e.g., M1, M2, W1, W2)
    - Zone is only visible in admin panel, not on public site
    - Helps with bulk schedule management

  2. Notes
    - Zone is optional (nullable)
    - No impact on existing data or public-facing features
    - Purely for admin convenience
*/

ALTER TABLE waste_areas
ADD COLUMN IF NOT EXISTS zone text;

COMMENT ON COLUMN waste_areas.zone IS 'Optional zone/district identifier for grouping areas (e.g., M1, M2 for city, W1, W2 for villages). Used only in admin panel for bulk operations.';