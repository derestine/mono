# Signup Troubleshooting Guide

## Issue: "Email address 'test@test.com' is invalid"

This error typically occurs due to one of the following reasons:

## 1. Missing Supabase Environment Variables

**Problem**: The app can't connect to Supabase because environment variables are missing.

**Solution**:
1. Create a `.env.local` file in your project root
2. Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. Restart your development server

**To get these values**:
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" and "anon public" key

## 2. Supabase Project Not Set Up

**Problem**: The Supabase project doesn't exist or isn't properly configured.

**Solution**:
1. Create a new Supabase project at https://supabase.com
2. Run the database schema from `supabase-schema.sql` in your Supabase SQL Editor
3. Update your `.env.local` with the new project credentials

## 3. Email Validation Issues

**Problem**: The email format is being rejected by Supabase.

**Solution**:
- Use a real email address (not test@test.com or example.com)
- Ensure the email follows standard format (user@domain.com)
- Check that the email isn't already registered
- **IMPORTANT**: Use a real email domain (gmail.com, outlook.com, etc.)

## 4. Database Schema Not Applied

**Problem**: The database tables and functions don't exist.

**Solution**:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the script

## 5. Authentication Settings

**Problem**: Supabase Auth settings are blocking signups.

**Solution**:
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Ensure "Enable email confirmations" is OFF for testing
4. Check that "Enable signups" is ON
5. Check "Site URL" is set to `http://localhost:3000` for development

## 6. 400 Error - Email Validation

**Problem**: Supabase is rejecting the email format with a 400 error.

**Common Causes**:
- Using example domains (example.com, test.com)
- Using invalid email formats
- Supabase project has strict email validation enabled

**Solution**:
1. Use a real email address with a valid domain:
   - `yourname@gmail.com`
   - `yourname@outlook.com`
   - `yourname@yahoo.com`
2. Check Supabase Auth settings for email restrictions
3. Ensure your Supabase project is properly configured

## Debugging Steps

1. **Check Browser Console**: Open Developer Tools and look for error messages
2. **Check Network Tab**: Look for failed requests to Supabase
3. **Verify Environment Variables**: The app will now show clear error messages if env vars are missing

## Quick Test

Try signing up with:
- Email: `your-real-name@gmail.com` (use your actual email)
- Password: `password123`
- Business Name: `Test Business`

## Common Error Messages

- **"Missing required Supabase environment variables"**: Set up your `.env.local` file
- **"Invalid email"**: Use a real email address with valid domain
- **"User already registered"**: Try a different email
- **"Database error"**: Apply the database schema
- **"400 Error"**: Check email format and Supabase Auth settings

## Still Having Issues?

1. Check the browser console for detailed error messages
2. Verify your Supabase project is active and accessible
3. Ensure you've applied the database schema
4. Try with a different email address using a real domain
5. Check your Supabase Auth settings for any restrictions
