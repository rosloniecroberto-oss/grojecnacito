/*
  # Grójec na Cito - Core Database Schema
  
  ## Overview
  Complete database schema for the Grójec na Cito PWA application with modules for:
  pharmacies, waste collection, bus schedules, mass times, and admin functionality.
  
  ## New Tables
  
  ### 1. pharmacies
  - `id` (uuid, primary key)
  - `name` (text) - Pharmacy name
  - `address` (text) - Full address
  - `phone` (text, nullable) - Contact phone
  - `is_priority_duty` (boolean, default false) - Marks 24/7 duty pharmacy (Papaya 2)
  - `info_note` (text, nullable) - Additional info (e.g., "Okienko nocne")
  - `created_at` (timestamptz)
  
  ### 2. pharmacy_hours
  - `id` (uuid, primary key)
  - `pharmacy_id` (uuid, foreign key) - References pharmacies
  - `day_type` (text) - 'weekday', 'saturday', 'sunday', 'holiday'
  - `open_time` (time) - Opening time
  - `close_time` (time) - Closing time
  - `is_closed` (boolean, default false) - Closed on this day type
  
  ### 3. waste_areas
  - `id` (uuid, primary key)
  - `type` (text) - 'city' or 'village'
  - `name` (text) - Street name or village name
  - `created_at` (timestamptz)
  
  ### 4. waste_schedules
  - `id` (uuid, primary key)
  - `area_id` (uuid, foreign key) - References waste_areas
  - `waste_type` (text) - 'bio', 'mixed', 'plastic', 'paper', 'glass'
  - `collection_date` (date) - Collection date
  - `created_at` (timestamptz)
  
  ### 5. bus_schedules
  - `id` (uuid, primary key)
  - `route_type` (text) - 'PKS' or 'BUSY'
  - `destination` (text) - Destination name
  - `departure_time` (time) - Departure time
  - `days_filter` (text) - 'D', '6', '7G', 'S' (daily, monday-saturday, sunday/holiday, saturday)
  - `is_cancelled` (boolean, default false) - Manually cancelled by admin
  - `created_at` (timestamptz)
  
  ### 6. bus_reports
  - `id` (uuid, primary key)
  - `schedule_id` (uuid, foreign key) - References bus_schedules
  - `report_type` (text) - 'delay' or 'missing'
  - `report_date` (date) - Date of report
  - `report_count` (integer, default 1) - Number of reports
  - `created_at` (timestamptz)
  
  ### 7. parishes
  - `id` (uuid, primary key)
  - `name` (text) - Parish name
  - `address` (text, nullable)
  - `created_at` (timestamptz)
  
  ### 8. mass_schedules
  - `id` (uuid, primary key)
  - `parish_id` (uuid, foreign key) - References parishes
  - `day_type` (text) - 'weekday', 'saturday', 'sunday', 'holiday'
  - `time` (time) - Mass time
  - `title` (text, nullable) - e.g., "Msza święta", "Nieszpory"
  - `is_periodic` (boolean, default false) - Periodic services (e.g., Adoration)
  - `duration_minutes` (integer, default 60) - Event duration
  - `created_at` (timestamptz)
  
  ### 9. event_overrides
  - `id` (uuid, primary key)
  - `event_date` (date) - Specific date for override
  - `module_type` (text) - 'mass', 'pharmacy', 'bus', 'waste'
  - `title` (text) - Override event title
  - `description` (text, nullable)
  - `data` (jsonb, nullable) - Flexible data for different modules
  - `created_at` (timestamptz)
  
  ### 10. admin_settings
  - `id` (uuid, primary key)
  - `key` (text, unique) - Setting key
  - `value` (text) - Setting value
  - `updated_at` (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Public read access for all data tables
  - Admin write access requires authentication (to be implemented)
*/

-- Create pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  is_priority_duty boolean DEFAULT false,
  info_note text,
  created_at timestamptz DEFAULT now()
);

-- Create pharmacy_hours table
CREATE TABLE IF NOT EXISTS pharmacy_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  day_type text NOT NULL CHECK (day_type IN ('weekday', 'saturday', 'sunday', 'holiday')),
  open_time time,
  close_time time,
  is_closed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create waste_areas table
CREATE TABLE IF NOT EXISTS waste_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('city', 'village')),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create waste_schedules table
CREATE TABLE IF NOT EXISTS waste_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id uuid NOT NULL REFERENCES waste_areas(id) ON DELETE CASCADE,
  waste_type text NOT NULL CHECK (waste_type IN ('bio', 'mixed', 'plastic', 'paper', 'glass')),
  collection_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create bus_schedules table
CREATE TABLE IF NOT EXISTS bus_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_type text NOT NULL CHECK (route_type IN ('PKS', 'BUSY')),
  destination text NOT NULL,
  departure_time time NOT NULL,
  days_filter text NOT NULL CHECK (days_filter IN ('D', '6', '7G', 'S')),
  is_cancelled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create bus_reports table
CREATE TABLE IF NOT EXISTS bus_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES bus_schedules(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('delay', 'missing')),
  report_date date NOT NULL,
  report_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create parishes table
CREATE TABLE IF NOT EXISTS parishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  created_at timestamptz DEFAULT now()
);

-- Create mass_schedules table
CREATE TABLE IF NOT EXISTS mass_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  day_type text NOT NULL CHECK (day_type IN ('weekday', 'saturday', 'sunday', 'holiday')),
  time time NOT NULL,
  title text,
  is_periodic boolean DEFAULT false,
  duration_minutes integer DEFAULT 60,
  created_at timestamptz DEFAULT now()
);

-- Create event_overrides table
CREATE TABLE IF NOT EXISTS event_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date date NOT NULL,
  module_type text NOT NULL CHECK (module_type IN ('mass', 'pharmacy', 'bus', 'waste')),
  title text NOT NULL,
  description text,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE parishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mass_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies for all data tables
CREATE POLICY "Public can read pharmacies"
  ON pharmacies FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read pharmacy_hours"
  ON pharmacy_hours FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read waste_areas"
  ON waste_areas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read waste_schedules"
  ON waste_schedules FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read bus_schedules"
  ON bus_schedules FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read bus_reports"
  ON bus_reports FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert bus_reports"
  ON bus_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can read parishes"
  ON parishes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read mass_schedules"
  ON mass_schedules FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read event_overrides"
  ON event_overrides FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read admin_settings"
  ON admin_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin write policies (authenticated users can write - will be restricted in app logic)
CREATE POLICY "Authenticated can write pharmacies"
  ON pharmacies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can write pharmacy_hours"
  ON pharmacy_hours FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can write waste_areas"
  ON waste_areas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can write waste_schedules"
  ON waste_schedules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can write bus_schedules"
  ON bus_schedules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can write parishes"
  ON parishes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can write mass_schedules"
  ON mass_schedules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can write event_overrides"
  ON event_overrides FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can write admin_settings"
  ON admin_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pharmacy_hours_pharmacy_id ON pharmacy_hours(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_waste_schedules_area_id ON waste_schedules(area_id);
CREATE INDEX IF NOT EXISTS idx_waste_schedules_date ON waste_schedules(collection_date);
CREATE INDEX IF NOT EXISTS idx_bus_reports_schedule_id ON bus_reports(schedule_id);
CREATE INDEX IF NOT EXISTS idx_bus_reports_date ON bus_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_mass_schedules_parish_id ON mass_schedules(parish_id);
CREATE INDEX IF NOT EXISTS idx_event_overrides_date ON event_overrides(event_date);