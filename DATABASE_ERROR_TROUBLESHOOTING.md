# Database Error Troubleshooting

## Common Database Errors When Saving New User

### 1. Trigger Function Errors

**Error**: `function handle_new_user() does not exist`
**Solution**: Run the fixed trigger function:
```sql
-- Run this in Supabase SQL Editor
\i supabase-schema-fixed.sql
```

**Error**: `permission denied for table merchants`
**Solution**: Check RLS policies and ensure the trigger function has proper permissions.

### 2. RLS Policy Issues

**Error**: `new row violates row-level security policy`
**Solution**: Temporarily disable RLS for testing:
```sql
ALTER TABLE merchants DISABLE ROW LEVEL SECURITY;
-- Test user creation
-- Re-enable when working: ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
```

### 3. Metadata Access Issues

**Error**: `column "raw_user_meta_data" does not exist`
**Solution**: The trigger function has been updated to handle this safely.

### 4. Manual Profile Creation

If the trigger continues to fail, the app now has a fallback:
- User signup will still work
- Merchant profile creation happens manually in the frontend
- User sees a "Complete Your Profile" form if needed

## Quick Fixes

### Option 1: Use Fixed Schema
1. Go to Supabase Dashboard → SQL Editor
2. Run the contents of `supabase-schema-fixed.sql`
3. Test user registration

### Option 2: Disable Trigger Temporarily
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

### Option 3: Manual Profile Creation Only
The app now creates merchant profiles manually in the frontend, so you can:
1. Disable the trigger completely
2. Let the frontend handle profile creation
3. Users will see the setup form if needed

## Testing Steps

1. **Check if trigger exists:**
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. **Check if function exists:**
   ```sql
   SELECT * FROM information_schema.routines 
   WHERE routine_name = 'handle_new_user';
   ```

3. **Test manual profile creation:**
   ```sql
   INSERT INTO merchants (auth_user_id, business_name, business_email, merchant_code, status, subscription_plan)
   VALUES ('test-uuid', 'Test Business', 'test@example.com', 'MERCH-TEST123', 'active', 'basic');
   ```

4. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'merchants';
   ```

## Error Logging

The updated trigger function now includes error handling:
- Errors are logged as warnings
- User creation doesn't fail if trigger fails
- Check Supabase logs for detailed error messages

## Fallback Strategy

If database triggers continue to cause issues:
1. Disable the trigger completely
2. Use frontend-only profile creation
3. Users will see the setup form after signup
4. All functionality will still work

## Contact Support

If issues persist:
1. Check Supabase logs for detailed error messages
2. Verify database permissions
3. Test with a fresh database instance
4. Consider using the manual profile creation approach

