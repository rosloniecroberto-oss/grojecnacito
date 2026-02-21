/*
  # Fix Bus Delay Reports INSERT Policy

  ## Problem
  The INSERT policy for bus_delay_reports was blocking anonymous users from reporting delays.
  Users were getting 401 Unauthorized with error: "new row violates row-level security policy"

  ## Solution
  1. Drop the incorrect INSERT policy
  2. Create a new public INSERT policy that allows both anonymous and authenticated users
  3. Keep validation checks (bus_schedule_id, device_fingerprint length >= 10)

  ## Security
  - Anonymous users can report delays (public feature)
  - Device fingerprint validation prevents basic spam
  - Time-based cleanup prevents data accumulation
  - Admin-only DELETE policy remains unchanged
*/

-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Anyone can report bus delays" ON public.bus_delay_reports;

-- Create correct public INSERT policy
CREATE POLICY "Public can report bus delays"
  ON public.bus_delay_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bus_schedule_id IS NOT NULL 
    AND device_fingerprint IS NOT NULL
    AND LENGTH(device_fingerprint) >= 10
  );
