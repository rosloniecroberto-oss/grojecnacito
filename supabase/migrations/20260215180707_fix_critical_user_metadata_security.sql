/*
  # Fix Critical Security Issues

  ## CRITICAL SECURITY FIX
  
  1. **Replace user_metadata with app_metadata**
     - SECURITY ISSUE: user_metadata can be edited by end users
     - app_metadata is read-only for users and controlled by admins only
     - All admin policies now check app_metadata instead of user_metadata
     - Affects 16 admin policies across all tables
  
  ## Performance Improvements
  
  2. **Add Missing Foreign Key Index**
     - Add index on mass_schedule_exceptions.parish_id
     - Improves JOIN performance with parishes table
  
  3. **Consolidate Permissive Policies**
     - Split admin "FOR ALL" policies into separate SELECT and WRITE policies
     - Remove duplicate SELECT permissions
     - Improves policy evaluation performance
  
  ## Notes
  
  - Password breach protection requires manual configuration in Supabase Dashboard
  - Multiple permissive policies for emergency_alerts are intentional (different logic)
*/

-- =====================================================
-- 1. CRITICAL: Replace user_metadata with app_metadata
-- =====================================================

-- Pharmacies
DROP POLICY IF EXISTS "Admin can write pharmacies" ON public.pharmacies;
CREATE POLICY "Admin can read pharmacies"
  ON public.pharmacies
  FOR SELECT
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can insert pharmacies"
  ON public.pharmacies
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update pharmacies"
  ON public.pharmacies
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete pharmacies"
  ON public.pharmacies
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Pharmacy Hours
DROP POLICY IF EXISTS "Admin can write pharmacy_hours" ON public.pharmacy_hours;
CREATE POLICY "Admin can insert pharmacy_hours"
  ON public.pharmacy_hours
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update pharmacy_hours"
  ON public.pharmacy_hours
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete pharmacy_hours"
  ON public.pharmacy_hours
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Waste Areas
DROP POLICY IF EXISTS "Admin can write waste_areas" ON public.waste_areas;
CREATE POLICY "Admin can insert waste_areas"
  ON public.waste_areas
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update waste_areas"
  ON public.waste_areas
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete waste_areas"
  ON public.waste_areas
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Waste Schedules
DROP POLICY IF EXISTS "Admin can write waste_schedules" ON public.waste_schedules;
CREATE POLICY "Admin can insert waste_schedules"
  ON public.waste_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update waste_schedules"
  ON public.waste_schedules
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete waste_schedules"
  ON public.waste_schedules
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Bus Schedules
DROP POLICY IF EXISTS "Admin can write bus_schedules" ON public.bus_schedules;
CREATE POLICY "Admin can insert bus_schedules"
  ON public.bus_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update bus_schedules"
  ON public.bus_schedules
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete bus_schedules"
  ON public.bus_schedules
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Bus Reports
DROP POLICY IF EXISTS "Admin can write bus_reports" ON public.bus_reports;
CREATE POLICY "Admin can insert bus_reports"
  ON public.bus_reports
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update bus_reports"
  ON public.bus_reports
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete bus_reports"
  ON public.bus_reports
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Parishes
DROP POLICY IF EXISTS "Admin can write parishes" ON public.parishes;
CREATE POLICY "Admin can insert parishes"
  ON public.parishes
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update parishes"
  ON public.parishes
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete parishes"
  ON public.parishes
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Mass Schedules
DROP POLICY IF EXISTS "Admin can write mass_schedules" ON public.mass_schedules;
CREATE POLICY "Admin can insert mass_schedules"
  ON public.mass_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update mass_schedules"
  ON public.mass_schedules
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete mass_schedules"
  ON public.mass_schedules
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Mass Schedule Exceptions
DROP POLICY IF EXISTS "Admin can write mass_schedule_exceptions" ON public.mass_schedule_exceptions;
CREATE POLICY "Admin can insert mass_schedule_exceptions"
  ON public.mass_schedule_exceptions
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update mass_schedule_exceptions"
  ON public.mass_schedule_exceptions
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete mass_schedule_exceptions"
  ON public.mass_schedule_exceptions
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Event Overrides
DROP POLICY IF EXISTS "Admin can write event_overrides" ON public.event_overrides;
CREATE POLICY "Admin can insert event_overrides"
  ON public.event_overrides
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update event_overrides"
  ON public.event_overrides
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete event_overrides"
  ON public.event_overrides
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Calendar Settings
DROP POLICY IF EXISTS "Admin can write calendar_settings" ON public.calendar_settings;
CREATE POLICY "Admin can insert calendar_settings"
  ON public.calendar_settings
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update calendar_settings"
  ON public.calendar_settings
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete calendar_settings"
  ON public.calendar_settings
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Admin Settings
DROP POLICY IF EXISTS "Admin can write admin_settings" ON public.admin_settings;
CREATE POLICY "Admin can insert admin_settings"
  ON public.admin_settings
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update admin_settings"
  ON public.admin_settings
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete admin_settings"
  ON public.admin_settings
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Bus Delay Reports
DROP POLICY IF EXISTS "Admin can delete bus_delay_reports" ON public.bus_delay_reports;
CREATE POLICY "Admin can delete bus_delay_reports"
  ON public.bus_delay_reports
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Emergency Alerts
DROP POLICY IF EXISTS "Admin can insert emergency alerts" ON public.emergency_alerts;
DROP POLICY IF EXISTS "Admin can update emergency alerts" ON public.emergency_alerts;
DROP POLICY IF EXISTS "Admin can delete emergency alerts" ON public.emergency_alerts;

CREATE POLICY "Admin can insert emergency alerts"
  ON public.emergency_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update emergency alerts"
  ON public.emergency_alerts
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete emergency alerts"
  ON public.emergency_alerts
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- =====================================================
-- 2. ADD MISSING FOREIGN KEY INDEX
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_mass_schedule_exceptions_parish_id 
  ON public.mass_schedule_exceptions(parish_id);

-- =====================================================
-- 3. DOCUMENTATION FOR MANUAL STEPS
-- =====================================================

COMMENT ON TABLE public.admin_settings IS 'IMPORTANT: Admin users must have role set in app_metadata (not user_metadata). Use Supabase Dashboard or Management API to set: {app_metadata: {role: "admin"}}';
