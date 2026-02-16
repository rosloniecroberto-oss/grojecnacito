# Admin User Setup Guide

## IMPORTANT SECURITY UPDATE

Due to a critical security fix, admin users must now have their role set in `app_metadata` instead of `user_metadata`. This prevents users from granting themselves admin access.

## How to Grant Admin Access

### Option 1: Via Supabase Dashboard (Recommended)

1. Log in to your Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Find and click on the user you want to make an admin
4. Scroll down to the **App Metadata** section (NOT "User Metadata")
5. Click **Edit** next to "App Metadata"
6. Add the following JSON (or merge with existing metadata):
   ```json
   {
     "role": "admin"
   }
   ```
7. Click **Save**
8. The user will need to log out and log back in for changes to take effect

### Option 2: Via Management API

If you have server-side code with service role access:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key!
)

const { data, error } = await supabase.auth.admin.updateUserById(
  'user-id-here',
  {
    app_metadata: { role: 'admin' }
  }
)

if (error) {
  console.error('Error setting admin role:', error)
} else {
  console.log('Admin role set successfully')
}
```

### Option 3: Via SQL (Direct Database Access)

**CAUTION**: Only use this if you have direct database access and understand the risks.

```sql
-- Find the user first
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Update their app_metadata
UPDATE auth.users
SET raw_app_meta_data =
  jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
WHERE id = 'user-uuid-here';
```

## Verifying Admin Access

After setting the admin role:

1. The user should log out of the application
2. Log back in
3. Try accessing the admin panel at `/admin` (or your admin route)
4. If access is denied, check:
   - The role is in `app_metadata`, not `user_metadata`
   - The value is exactly `"admin"` (lowercase)
   - The user has logged out and back in to refresh their JWT token

## Troubleshooting

### Admin Panel Not Accessible

**Problem**: User cannot access admin features after setting the role.

**Solutions**:
- Ensure the role is in **App Metadata**, not User Metadata
- User must log out and log back in after role is set
- Check browser console for any JWT or authentication errors
- Verify the role value is exactly `"admin"` (lowercase, in quotes)

### Role Keeps Resetting

**Problem**: Admin role disappears after user updates their profile.

**Solution**: This should NOT happen with `app_metadata`. If it does:
- Verify you're using the latest migration
- Check that RLS policies reference `app_metadata` not `user_metadata`
- Run: `SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 1;`
- Should show migration `20260215xxxxxx_fix_critical_user_metadata_security`

### Multiple Admins Needed

To set up multiple admins, repeat the process for each user. There's no limit to the number of admin users.

## Security Notes

- **NEVER** set the role in `user_metadata` - users can modify it themselves
- **ALWAYS** use `app_metadata` for roles and permissions
- Only users with service role access can modify `app_metadata`
- Regular users cannot see or modify `app_metadata`
- Admin access grants full control over all application data

## Removing Admin Access

To remove admin privileges from a user:

1. Go to Supabase Dashboard > Authentication > Users
2. Select the user
3. Edit their App Metadata
4. Remove the `role` field or set it to `null`
5. Save changes
6. User must log out and back in

Or via API:

```javascript
const { data, error } = await supabase.auth.admin.updateUserById(
  userId,
  {
    app_metadata: { role: null }
  }
)
```

## First-Time Setup

If this is your first time setting up an admin after the security update:

1. Create a user account through your application's registration
2. Note the user's email address
3. Follow Option 1 (Dashboard) above to grant admin access
4. User logs out and back in
5. Admin panel should now be accessible

## Questions or Issues?

If you encounter any issues with admin setup:

1. Check the `SECURITY_FIXES.md` file for detailed technical information
2. Verify your database migrations are up to date
3. Check Supabase logs for any authentication errors
4. Ensure you're using the latest version of `@supabase/supabase-js`
