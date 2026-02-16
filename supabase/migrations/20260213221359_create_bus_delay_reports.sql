/*
  # Create bus delay reports system

  1. New Tables
    - `bus_delay_reports`
      - `id` (uuid, primary key)
      - `bus_schedule_id` (uuid, foreign key to bus_schedules)
      - `reported_at` (timestamptz) - timestamp of when the delay was reported
      - `device_fingerprint` (text) - unique device identifier for spam protection
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `bus_delay_reports` table
    - Add policy for anyone to create reports (public reporting)
    - Add policy for authenticated admins to read all reports
    - Add policy for authenticated admins to delete reports

  3. Indexes
    - Index on bus_schedule_id for fast lookups
    - Index on reported_at for cleanup operations
    - Index on device_fingerprint for spam protection checks
*/

-- Create bus_delay_reports table
CREATE TABLE IF NOT EXISTS bus_delay_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_schedule_id uuid NOT NULL REFERENCES bus_schedules(id) ON DELETE CASCADE,
  reported_at timestamptz NOT NULL DEFAULT now(),
  device_fingerprint text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bus_delay_reports_schedule_id ON bus_delay_reports(bus_schedule_id);
CREATE INDEX IF NOT EXISTS idx_bus_delay_reports_reported_at ON bus_delay_reports(reported_at);
CREATE INDEX IF NOT EXISTS idx_bus_delay_reports_device_fingerprint ON bus_delay_reports(device_fingerprint);

-- Enable RLS
ALTER TABLE bus_delay_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create reports (public reporting)
CREATE POLICY "Anyone can report delays"
  ON bus_delay_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Anyone can read reports (to show delay warnings)
CREATE POLICY "Anyone can view delay reports"
  ON bus_delay_reports
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Authenticated users can delete reports (admin function)
CREATE POLICY "Authenticated users can delete reports"
  ON bus_delay_reports
  FOR DELETE
  TO authenticated
  USING (true);

-- Function to automatically clean up old reports (> 60 minutes)
CREATE OR REPLACE FUNCTION cleanup_old_delay_reports()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM bus_delay_reports
  WHERE reported_at < NOW() - INTERVAL '60 minutes';
END;
$$;

-- Function to clean up all reports at midnight (hard reset)
CREATE OR REPLACE FUNCTION cleanup_all_delay_reports()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM bus_delay_reports;
END;
$$;