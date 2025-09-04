# Merchant Setup Flow

## Overview

The merchant setup flow ensures that when a user signs up, they get a complete merchant profile with all necessary components. This flow handles both automatic (via database trigger) and manual (via UI) profile creation.

## Flow Steps

### 1. User Registration
- User signs up via `/auth` page
- Supabase Auth creates user in `auth.users` table
- User metadata includes `business_name` and `role: 'merchant'`

### 2. Automatic Profile Creation (Database Trigger)
- `handle_new_user()` trigger fires on new user creation
- Creates merchant record in `merchants` table
- Creates default loyalty program in `loyalty_programs` table
- Generates unique merchant code

### 3. Email Confirmation
- User receives verification email
- Clicks link to verify account
- Returns to `/auth` page

### 4. Profile Verification
- User signs in to `/merchant` page
- System checks if merchant profile exists
- If profile exists: Show merchant portal
- If profile missing: Show profile setup form

### 5. Manual Profile Setup (Fallback)
- If database trigger failed, user sees setup form
- User enters business name
- System creates merchant profile manually
- Redirects to merchant portal

## Database Schema

### Tables Involved
1. **`auth.users`** - Supabase Auth user table
2. **`merchants`** - Merchant profiles
3. **`loyalty_programs`** - Default loyalty programs

### Trigger Function
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
-- Creates merchant profile and default loyalty program
-- for new users with role='merchant'
```

## Components

### 1. EmailConfirmation Component
- **Purpose**: Shows after successful signup
- **Location**: `src/components/auth/EmailConfirmation.tsx`
- **Features**: Email display, resend functionality, navigation

### 2. MerchantProfileSetup Component
- **Purpose**: Manual profile creation fallback
- **Location**: `src/components/auth/MerchantProfileSetup.tsx`
- **Features**: Business name input, profile creation, success feedback

### 3. MerchantContext
- **Purpose**: Manages merchant data and operations
- **Location**: `src/contexts/MerchantContext.tsx`
- **Features**: Profile loading, error handling, data refresh

## Error Handling

### Common Scenarios

1. **Database Trigger Fails**
   - User created but no merchant profile
   - System shows profile setup form
   - Manual profile creation

2. **Profile Not Found**
   - User exists but merchant profile missing
   - Graceful error handling
   - Setup form displayed

3. **Network Issues**
   - Retry mechanisms
   - Clear error messages
   - Fallback options

## Testing the Flow

### 1. Complete Flow Test
1. Sign up with new email
2. Check email confirmation
3. Verify email
4. Sign in to merchant portal
5. Verify profile exists

### 2. Fallback Test
1. Sign up with new email
2. Manually delete merchant profile from database
3. Sign in to merchant portal
4. Verify setup form appears
5. Complete profile setup

### 3. Debug Tools
- `/debug-signup` - Test signup process
- `/test-supabase` - Test database connection
- Browser console logs for detailed debugging

## Configuration

### Supabase Settings
1. **Auth Settings**
   - Enable signups: ON
   - Email confirmations: ON (for production)
   - Site URL: `http://localhost:3000` (development)

2. **Database Schema**
   - Run `supabase-schema.sql` in SQL Editor
   - Verify trigger function exists
   - Check RLS policies

3. **Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## Troubleshooting

### Profile Not Created
1. Check database trigger function
2. Verify user metadata includes role='merchant'
3. Check RLS policies
4. Use manual profile setup

### Email Not Received
1. Check Supabase Auth settings
2. Verify email address format
3. Check spam folder
4. Use resend functionality

### Setup Form Not Appearing
1. Check error handling in MerchantContext
2. Verify user authentication
3. Check browser console for errors
4. Test with debug tools

## Best Practices

1. **Always have fallback**: Manual profile setup for trigger failures
2. **Clear error messages**: Help users understand what went wrong
3. **Comprehensive logging**: For debugging and monitoring
4. **Graceful degradation**: System works even if some parts fail
5. **User feedback**: Clear indication of what's happening

## Future Enhancements

1. **Email Templates**: Customize verification emails
2. **Profile Customization**: More merchant profile fields
3. **Onboarding Flow**: Step-by-step setup wizard
4. **Analytics**: Track setup completion rates
5. **Notifications**: Email/SMS notifications for setup completion
