/*
  # Force Refresh Bus Delay Reports INSERT Policy
  
  ## Problem
  PostgREST cache is not refreshing the INSERT policy for bus_delay_reports.
  Users still getting 42501 error despite correct policy configuration.
  
  ## Solution
  1. Drop ALL existing policies completely
  2. Recreate them with slightly different names to force cache invalidation
  3. Send NOTIFY to PostgREST to reload schema
  
  ## Security
  - Maintains same security model
  - Public can INSERT with validation
  - Public can SELECT
  - Only admin can DELETE
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Public can report bus delays" ON public.bus_delay_reports;
DROP POLICY IF EXISTS "Anyone can report bus delays" ON public.bus_delay_reports;
DROP POLICY IF EXISTS "Public read bus_delay_reports" ON public.bus_delay_reports;
DROP POLICY IF EXISTS "Admin can delete bus_delay_reports" ON public.bus_delay_reports;

-- Recreate SELECT policy with new name
CREATE POLICY "Allow public to view delay reports"
  ON public.bus_delay_reports
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Recreate INSERT policy with new name and validation
CREATE POLICY "Allow public to submit delay reports"
  ON public.bus_delay_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bus_schedule_id IS NOT NULL 
    AND device_fingerprint IS NOT NULL
    AND LENGTH(device_fingerprint) >= 10
  );

-- Recreate DELETE policy for admin only
CREATE POLICY "Allow admin to delete delay reports"
  ON public.bus_delay_reports
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
