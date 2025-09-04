# Quick Fix for Registration Issues

## Step 1: Clean Up Your Current State

### Option A: Clear Browser Data (Easiest)
1. Open browser Dev Tools (F12)
2. Go to Application tab → Storage
3. Click "Clear storage" to remove all auth cookies/tokens
4. Refresh the page

### Option B: Clear Auth from Database
Run this in Supabase SQL Editor:
```sql
-- CAREFUL: This will delete all users and merchants
-- DELETE FROM merchants WHERE id IS NOT NULL;
-- DELETE FROM auth.users WHERE id IS NOT NULL;
```

## Step 2: Try New Signup Flow

1. **Go to**: http://localhost:3001/auth
2. **Click**: "Switch to Sign Up" 
3. **Fill out**:
   - Email: `test@example.com` (or any valid email)
   - Password: `password123` (6+ characters)
   - Confirm Password: `password123`
4. **Click**: "Create Account"

## Step 3: What Should Happen Now

✅ **With the fixes applied:**
- User should be signed up AND signed in immediately
- Should redirect to `/merchant` automatically
- Should show profile setup form if no merchant profile exists
- Can complete business profile setup right there

❌ **If it still doesn't work:**
- Check browser console for error messages
- Try the database cleanup option
- Let me know what errors you see

## Step 4: Alternative - Manual Profile Creation

If signup still fails, you can create a merchant profile manually:
1. First run the debug SQL to see your user ID
2. Then create a merchant profile using the `create_merchant_profile` function

## What I Fixed

1. **Removed email confirmation requirement** - signup now signs you in immediately
2. **Fixed redirect flow** - goes straight to merchant portal
3. **Better error handling** - shows profile setup if merchant profile missing
4. **Updated type signatures** - fixed TypeScript issues

The app should now work end-to-end!