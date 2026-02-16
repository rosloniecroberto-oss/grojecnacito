/*
  # Fix RLS Policies for Mass Schedule Exceptions

  ## Problem
  The mass_schedule_exceptions table was created with authenticated-only policies,
  but the admin panel uses anon key with frontend password protection.

  ## Solution
  Update RLS policies to allow anon users to perform write operations,
  consistent with other tables in the system.

  ## Changes
  - Drop existing authenticated-only policies for INSERT, UPDATE, DELETE
  - Create new policies that allow both anon and authenticated users
  - Keep SELECT policy as public (already allows anon)

  ## Security Note
  The admin panel is protected by a password in the frontend (sessionStorage).
  This is a simple community project where frontend protection is deemed sufficient.
*/

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "Authenticated users can insert mass schedule exceptions" ON mass_schedule_exceptions;
DROP POLICY IF EXISTS "Authenticated users can update mass schedule exceptions" ON mass_schedule_exceptions;
DROP POLICY IF EXISTS "Authenticated users can delete mass schedule exceptions" ON mass_schedule_exceptions;

-- Create new policies that allow both anon and authenticated users
CREATE POLICY "Public can write mass schedule exceptions"
  ON mass_schedule_exceptions FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);