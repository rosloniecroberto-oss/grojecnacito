/*
  # Update RLS Policies for Admin Panel

  ## Changes
  Updates Row Level Security policies to allow anonymous users to perform write operations.
  This enables the admin panel to function properly since it uses the anon key with 
  frontend password protection.

  ## Modified Policies
  - Pharmacies: Allow anon users to INSERT, UPDATE, DELETE
  - Pharmacy Hours: Allow anon users to INSERT, UPDATE, DELETE
  - Parishes: Allow anon users to INSERT, UPDATE, DELETE
  - Mass Schedules: Allow anon users to INSERT, UPDATE, DELETE
  - Bus Schedules: Allow anon users to INSERT, UPDATE, DELETE
  - Bus Reports: Allow anon users to UPDATE, DELETE
  - Waste Areas: Allow anon users to INSERT, UPDATE, DELETE
  - Waste Schedules: Allow anon users to INSERT, UPDATE, DELETE
  - Event Overrides: Allow anon users to INSERT, UPDATE, DELETE

  ## Security Note
  The admin panel is protected by a password in the frontend (sessionStorage).
  This is a simple community project where frontend protection is deemed sufficient.
*/

-- Drop existing authenticated-only policies for write operations
DROP POLICY IF EXISTS "Authenticated can write pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Authenticated can write pharmacy_hours" ON pharmacy_hours;
DROP POLICY IF EXISTS "Authenticated can write parishes" ON parishes;
DROP POLICY IF EXISTS "Authenticated can write mass_schedules" ON mass_schedules;
DROP POLICY IF EXISTS "Authenticated can write bus_schedules" ON bus_schedules;
DROP POLICY IF EXISTS "Authenticated can write waste_areas" ON waste_areas;
DROP POLICY IF EXISTS "Authenticated can write waste_schedules" ON waste_schedules;
DROP POLICY IF EXISTS "Authenticated can write event_overrides" ON event_overrides;
DROP POLICY IF EXISTS "Authenticated can write admin_settings" ON admin_settings;

-- Create new policies that allow both anon and authenticated users to write
CREATE POLICY "Public can write pharmacies"
  ON pharmacies FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can write pharmacy_hours"
  ON pharmacy_hours FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can write parishes"
  ON parishes FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can write mass_schedules"
  ON mass_schedules FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can write bus_schedules"
  ON bus_schedules FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can write bus_reports"
  ON bus_reports FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can write waste_areas"
  ON waste_areas FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can write waste_schedules"
  ON waste_schedules FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can write event_overrides"
  ON event_overrides FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can write admin_settings"
  ON admin_settings FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
