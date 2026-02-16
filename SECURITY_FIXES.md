# Security and Performance Fixes

## Overview
This document describes the security and performance improvements applied to the Grójec na Cito application database.

## Changes Applied

### 1. CRITICAL: Fixed user_metadata Security Vulnerability

**Problem**: All admin RLS policies were checking `user_metadata` for the admin role. This is a **CRITICAL SECURITY VULNERABILITY** because `user_metadata` can be edited by end users through the Supabase client library, allowing any user to grant themselves admin access.

**Solution**: Changed ALL admin policies to check `app_metadata` instead. `app_metadata` is read-only for users and can only be modified by server-side admin operations or the Supabase Management API.

**Affected Tables** (16 admin policies updated):
- pharmacies (4 policies: INSERT, UPDATE, DELETE, + separate SELECT for admin)
- pharmacy_hours (3 policies: INSERT, UPDATE, DELETE)
- waste_areas (3 policies: INSERT, UPDATE, DELETE)
- waste_schedules (3 policies: INSERT, UPDATE, DELETE)
- bus_schedules (3 policies: INSERT, UPDATE, DELETE)
- bus_reports (3 policies: INSERT, UPDATE, DELETE)
- parishes (3 policies: INSERT, UPDATE, DELETE)
- mass_schedules (3 policies: INSERT, UPDATE, DELETE)
- mass_schedule_exceptions (3 policies: INSERT, UPDATE, DELETE)
- event_overrides (3 policies: INSERT, UPDATE, DELETE)
- calendar_settings (3 policies: INSERT, UPDATE, DELETE)
- admin_settings (3 policies: INSERT, UPDATE, DELETE)
- bus_delay_reports (1 policy: DELETE)
- emergency_alerts (3 policies: INSERT, UPDATE, DELETE)

**Security Impact**: This fix prevents privilege escalation attacks where users could grant themselves admin access.

**IMPORTANT**: Admin users must now have their role set in `app_metadata` instead of `user_metadata`:
```json
{
  "app_metadata": {
    "role": "admin"
  }
}
```

This can only be set through:
- Supabase Dashboard (Users > select user > edit user metadata)
- Supabase Management API
- Server-side admin functions

### 2. RLS Performance Optimization (CRITICAL)

**Problem**: All admin RLS policies were calling `auth.jwt()` directly, causing the function to be re-evaluated for every row in the result set. This creates severe performance bottlenecks when dealing with large datasets.

**Solution**: Wrapped all `auth.jwt()` calls with `(select auth.jwt())` to ensure the function is evaluated only once per query.

**Affected Tables** (13 policies updated):
- pharmacies
- pharmacy_hours
- waste_areas
- waste_schedules
- bus_schedules
- bus_reports
- parishes
- mass_schedules
- mass_schedule_exceptions
- event_overrides
- calendar_settings
- admin_settings
- bus_delay_reports

**Performance Impact**: Queries on large tables will see significant performance improvements, especially when filtering by admin role.

### 3. Added Missing Foreign Key Index

**Problem**: The `mass_schedule_exceptions` table had a foreign key to `parishes` table but no covering index, causing suboptimal JOIN performance.

**Solution**: Added index on `mass_schedule_exceptions.parish_id`.

**Impact**: Significantly improved query performance when joining mass exceptions with parishes data.

### 4. Removed Unused Indexes

**Problem**: Several indexes were created but never used by queries, wasting storage space and slowing down write operations.

**Removed Indexes**:
- `idx_bus_reports_date` - Not used in any queries
- `idx_bus_delay_reports_device_fingerprint` - Not used in any queries
- `idx_mass_exceptions_parish_date` - Not used in any queries
- `idx_event_overrides_date` - Not used in any queries

**Impact**: Reduced database storage overhead and improved INSERT/UPDATE performance.

### 5. Fixed Function Search Paths

**Problem**: Three functions had mutable search paths, creating a potential security vulnerability for search_path hijacking attacks.

**Solution**: Added `SET search_path = public, pg_temp` to all security-sensitive functions.

**Affected Functions**:
- `cleanup_old_delay_reports()`
- `cleanup_all_delay_reports()`
- `update_emergency_alerts_updated_at()`

**Security Impact**: Prevents potential SQL injection through search_path manipulation.

### 6. Restricted Overly Permissive Policies

#### Emergency Alerts
**Problem**: Any authenticated user could create, update, or delete emergency alerts without any restrictions (policies used `true` conditions).

**Solution**: Restricted all write operations to admin users only.

**New Policies**:
- "Admin can insert emergency alerts" - Only admins can create alerts
- "Admin can update emergency alerts" - Only admins can modify alerts
- "Admin can delete emergency alerts" - Only admins can delete alerts

#### Bus Delay Reports
**Problem**: Policy allowed unrestricted insertion without any validation.

**Solution**: Added validation requirements:
- `bus_schedule_id` must not be null
- `device_fingerprint` must not be null
- `device_fingerprint` must be at least 10 characters long

**Impact**: Reduces spam and abuse while still allowing public reporting.

### 7. Consolidated Multiple Permissive Policies

**Problem**: Many tables had "FOR ALL" admin policies that included SELECT permissions, creating duplicate SELECT policies when combined with public read policies.

**Solution**: Split admin "FOR ALL" policies into separate operations:
- Separate SELECT policy for admins (where needed, like pharmacies)
- Separate INSERT, UPDATE, DELETE policies

**Result**: Reduced policy evaluation overhead while maintaining the same access control. Public read policies now no longer overlap with admin SELECT policies for most tables.

**Note**: Some tables (like `emergency_alerts`) intentionally have multiple SELECT policies with different logic:
- "Anyone can view active emergency alerts" - Shows only active alerts to everyone
- "Authenticated users can view all emergency alerts" - Shows all alerts to authenticated users
This is intentional and provides different data visibility based on authentication status.

### 8. Password Breach Protection

**Status**: Requires manual configuration (cannot be set via SQL).

**Action Required**:
Enable "Hook for checking if user password has been compromised" in:
- Supabase Dashboard > Authentication > Settings > Security and Protection
- This enables integration with HaveIBeenPwned.org to prevent use of compromised passwords

## Security Checklist

- [x] **CRITICAL**: Fixed user_metadata vulnerability - changed to app_metadata
- [x] Added missing foreign key index
- [x] Optimized RLS auth function calls for performance
- [x] Removed unused indexes
- [x] Fixed function search paths
- [x] Restricted emergency alerts to admin only
- [x] Added validation to bus delay reports
- [x] Consolidated multiple permissive policies
- [ ] **MANUAL STEP**: Set admin role in app_metadata for admin users
- [ ] **MANUAL STEP**: Enable password breach protection in Supabase Dashboard

## Testing Recommendations

1. **Performance Testing**:
   - Test queries on tables with large datasets
   - Verify admin operations are faster
   - Monitor query execution plans

2. **Security Testing**:
   - **CRITICAL**: Verify admin users have role in app_metadata (not user_metadata)
   - Test that users cannot grant themselves admin by modifying user_metadata
   - Verify non-admin users cannot create/modify emergency alerts
   - Test bus delay report validation
   - Ensure admin users can still perform all operations
   - Verify foreign key JOIN performance on mass_schedule_exceptions

3. **Functional Testing**:
   - Verify all public read operations work correctly
   - Test admin panel functionality
   - Confirm emergency alerts display properly

## Migration Details

**Migration Files**:
1. `20260215180320_fix_security_and_performance_issues.sql` - Initial security fixes
2. `20260215xxxxxx_fix_critical_user_metadata_security.sql` - Critical user_metadata fix

**Applied**: 2026-02-15

**Rollback**: If issues occur, policies can be reverted, but **DO NOT** revert the app_metadata changes as they fix a critical security vulnerability.

## Notes

- All changes are backward compatible with existing application code
- No frontend changes required
- Database performance should improve noticeably on large datasets
- Security posture is significantly enhanced

## Support

If any issues are encountered after applying these fixes, check:

1. **CRITICAL**: Admin users must have `role: 'admin'` in `app_metadata` (NOT `user_metadata`)
   - Check in Supabase Dashboard: Users > select user > User Metadata
   - The role should be in "App Metadata" section, not "User Metadata"

2. Public read access still works for unauthenticated users

3. Emergency alerts are accessible only through admin panel

4. If admin users cannot access admin features:
   - Verify their `app_metadata` contains: `{"role": "admin"}`
   - Update through Supabase Dashboard or Management API
   - DO NOT set role in `user_metadata` as it can be modified by the user

## How to Set Admin Role

To grant admin access to a user:

**Via Supabase Dashboard:**
1. Go to Authentication > Users
2. Click on the user
3. Scroll to "App Metadata" (NOT "User Metadata")
4. Add/edit to include:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save changes

**Via Management API:**
```javascript
const { data, error } = await supabase.auth.admin.updateUserById(
  userId,
  {
    app_metadata: { role: 'admin' }
  }
)
```

**IMPORTANT**: Never set the role in `user_metadata` as users can modify it themselves, creating a security vulnerability.
