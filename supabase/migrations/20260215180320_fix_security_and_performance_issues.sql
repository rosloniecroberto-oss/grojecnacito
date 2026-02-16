/*
  # Fix Security and Performance Issues

  ## Performance Optimizations
  
  1. **RLS Auth Function Optimization**
     - Wrap all `auth.jwt()` calls with `(select auth.jwt())` to prevent re-evaluation per row
     - Affects 13 admin write policies across all tables
     - Significantly improves query performance at scale
  
  2. **Remove Unused Indexes**
     - Drop `idx_bus_reports_date` (unused)
     - Drop `idx_bus_delay_reports_device_fingerprint` (unused)
     - Drop `idx_mass_exceptions_parish_date` (unused)
     - Drop `idx_event_overrides_date` (unused)
     - Reduces database overhead and storage

  ## Security Improvements
  
  3. **Function Search Paths**
     - Set immutable search_path for security functions
     - Prevents search_path hijacking attacks
  
  4. **Restrict Overly Permissive Policies**
     - Add proper admin checks to emergency_alerts policies
     - Restrict bus delay reports to prevent abuse
  
  5. **Password Breach Protection**
     - MANUAL STEP REQUIRED: Enable "Hook for checking if user password has been compromised"
       in Supabase Dashboard > Authentication > Settings > Security and Protection
       This cannot be configured via SQL migration.

  ## Notes on Multiple Permissive Policies
  
  The warning about multiple permissive policies is informational. Our pattern is intentional:
  - Admin policy allows all operations (SELECT, INSERT, UPDATE, DELETE)
  - Public policy allows SELECT for everyone
  This provides clear separation of concerns and is a common best practice.
*/

-- =====================================================
-- 1. OPTIMIZE RLS POLICIES - Wrap auth.jwt() with select
-- =====================================================

-- Pharmacies
DROP POLICY IF EXISTS "Admin can write pharmacies" ON public.pharmacies;
CREATE POLICY "Admin can write pharmacies"
  ON public.pharmacies
  FOR ALL
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

-- Pharmacy Hours
DROP POLICY IF EXISTS "Admin can write pharmacy_hours" ON public.pharmacy_hours;
CREATE POLICY "Admin can write pharmacy_hours"
  ON public.pharmacy_hours
  FOR ALL
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

-- Waste Areas
DROP POLICY IF EXISTS "Admin can write waste_areas" ON public.waste_areas;
CREATE POLICY "Admin can write waste_areas"
  ON public.waste_areas
  FOR ALL
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

-- Waste Schedules
DROP POLICY IF EXISTS "Admin can write waste_schedules" ON public.waste_schedules;
CREATE POLICY "Admin can write waste_schedules"
  ON public.waste_schedules
  FOR ALL
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

-- Bus Schedules
DROP POLICY IF EXISTS "Admin can write bus_schedules" ON public.bus_schedules;
CREATE POLICY "Admin can write bus_schedules"
  ON public.bus_schedules
  FOR ALL
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

-- Bus Reports
DROP POLICY IF EXISTS "Admin can write bus_reports" ON public.bus_reports;
CREATE POLICY "Admin can write bus_reports"
  ON public.bus_reports
  FOR ALL
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

-- Parishes
DROP POLICY IF EXISTS "Admin can write parishes" ON public.parishes;
CREATE POLICY "Admin can write parishes"
  ON public.parishes
  FOR ALL
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

-- Mass Schedules
DROP POLICY IF EXISTS "Admin can write mass_schedules" ON public.mass_schedules;
CREATE POLICY "Admin can write mass_schedules"
  ON public.mass_schedules
  FOR ALL
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

-- Mass Schedule Exceptions
DROP POLICY IF EXISTS "Admin can write mass_schedule_exceptions" ON public.mass_schedule_exceptions;
CREATE POLICY "Admin can write mass_schedule_exceptions"
  ON public.mass_schedule_exceptions
  FOR ALL
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

-- Event Overrides
DROP POLICY IF EXISTS "Admin can write event_overrides" ON public.event_overrides;
CREATE POLICY "Admin can write event_overrides"
  ON public.event_overrides
  FOR ALL
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

-- Calendar Settings
DROP POLICY IF EXISTS "Admin can write calendar_settings" ON public.calendar_settings;
CREATE POLICY "Admin can write calendar_settings"
  ON public.calendar_settings
  FOR ALL
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

-- Admin Settings
DROP POLICY IF EXISTS "Admin can write admin_settings" ON public.admin_settings;
CREATE POLICY "Admin can write admin_settings"
  ON public.admin_settings
  FOR ALL
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

-- Bus Delay Reports - Delete policy
DROP POLICY IF EXISTS "Admin can delete bus_delay_reports" ON public.bus_delay_reports;
CREATE POLICY "Admin can delete bus_delay_reports"
  ON public.bus_delay_reports
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

-- =====================================================
-- 2. REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_bus_reports_date;
DROP INDEX IF EXISTS idx_bus_delay_reports_device_fingerprint;
DROP INDEX IF EXISTS idx_mass_exceptions_parish_date;
DROP INDEX IF EXISTS idx_event_overrides_date;

-- =====================================================
-- 3. FIX FUNCTION SEARCH PATHS
-- =====================================================

-- Recreate functions with immutable search_path
CREATE OR REPLACE FUNCTION public.cleanup_old_delay_reports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM bus_delay_reports
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_all_delay_reports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM bus_delay_reports;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_emergency_alerts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================
-- 4. FIX OVERLY PERMISSIVE RLS POLICIES
-- =====================================================

-- Emergency Alerts - Restrict to admin only
DROP POLICY IF EXISTS "Authenticated users can insert emergency alerts" ON public.emergency_alerts;
DROP POLICY IF EXISTS "Authenticated users can update emergency alerts" ON public.emergency_alerts;
DROP POLICY IF EXISTS "Authenticated users can delete emergency alerts" ON public.emergency_alerts;

CREATE POLICY "Admin can insert emergency alerts"
  ON public.emergency_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update emergency alerts"
  ON public.emergency_alerts
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete emergency alerts"
  ON public.emergency_alerts
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'user_metadata' ->> 'role' = 'admin');

-- Bus Delay Reports - Add validation requirements
DROP POLICY IF EXISTS "Anyone can report bus delays" ON public.bus_delay_reports;
CREATE POLICY "Anyone can report bus delays"
  ON public.bus_delay_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bus_schedule_id IS NOT NULL 
    AND device_fingerprint IS NOT NULL
    AND LENGTH(device_fingerprint) >= 10
  );
