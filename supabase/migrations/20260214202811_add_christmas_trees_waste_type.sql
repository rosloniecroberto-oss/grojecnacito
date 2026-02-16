/*
  # Add Christmas Trees Waste Type

  1. Changes
    - Drop existing waste_type constraint
    - Add new constraint including 'christmas_trees' type
    - This allows differentiation between regular green waste (grass, leaves, branches) 
      and special Christmas tree collection events

  2. Notes
    - 'green' type remains for regular organic waste (grass, leaves, branches)
    - 'christmas_trees' type is for special seasonal Christmas tree collection
    - This matches real-world municipal waste collection schedules
*/

ALTER TABLE waste_schedules
  DROP CONSTRAINT IF EXISTS waste_schedules_waste_type_check;

ALTER TABLE waste_schedules
  ADD CONSTRAINT waste_schedules_waste_type_check
  CHECK (waste_type IN ('bio', 'mixed', 'plastic', 'paper', 'glass', 'green', 'christmas_trees', 'bulky', 'ash', 'textiles'));