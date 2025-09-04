# Merchant Registration Flow

## Overview

The merchant registration process now automatically creates database records when a user signs up. Here's how it works:

## Registration Flow

### 1. User Sign Up
- User fills out sign-up form with:
  - Business name
  - Email
  - Password
- Form submits to Supabase Auth

### 2. Database Trigger
When a new user is created in `auth.users`, a trigger automatically:
- Checks if the user has `role: 'merchant'` in metadata
- Creates a record in the `merchants` table with:
  - `auth_user_id` linking to the auth user
  - `business_name` from sign-up form
  - `business_email` from auth user
  - Auto-generated `merchant_code` (format: `MERCH-XXXXXXXX`)
  - Default status: `'active'`
  - Default subscription: `'basic'`

### 3. Default Loyalty Program
The trigger also creates:
- A default loyalty program for the merchant
- 1 point per dollar spent
- 100 points minimum for redemption
- 1 cent value per point

## Database Schema Updates

### New Trigger Function
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
-- Creates merchant record and default loyalty program
-- when a new merchant user signs up
```

### New Trigger
```sql
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
```

## Error Handling

### Missing Merchant Profile
If a merchant signs up but the database trigger fails (or for existing users without profiles):
- The merchant portal shows a "Complete Your Profile" form
- User can manually create their merchant profile
- System generates a unique merchant code

### Graceful Degradation
- If merchant profile doesn't exist, user sees setup form
- If database operations fail, user sees appropriate error messages
- All operations are wrapped in try-catch blocks

## Testing the Flow

### 1. New User Registration
1. Go to `/auth`
2. Click "Sign up here"
3. Fill out form with business name, email, password
4. Submit form
5. Check database:
   ```sql
   SELECT * FROM merchants WHERE business_email = 'user@example.com';
   SELECT * FROM loyalty_programs WHERE merchant_id = (SELECT id FROM merchants WHERE business_email = 'user@example.com');
   ```

### 2. Existing User Without Profile
1. Sign in with existing account
2. If no merchant profile exists, user sees setup form
3. Complete profile setup
4. Merchant portal loads normally

## Database Tables Involved

### `merchants`
- Stores merchant business information
- Links to auth user via `auth_user_id`
- Contains business name, email, merchant code

### `loyalty_programs`
- Stores loyalty program configuration
- One default program created per merchant
- Configurable points per dollar, redemption rules

### `auth.users`
- Supabase auth user table
- Contains user metadata with business name and role
- Triggered to create merchant records

## Security Considerations

- Trigger function uses `SECURITY DEFINER` to run with elevated privileges
- Only processes users with `role: 'merchant'` in metadata
- Merchant records are properly linked to auth users
- RLS policies ensure data isolation

## Troubleshooting

### Merchant Profile Not Found
- Check if trigger function exists in database
- Verify user has `role: 'merchant'` in metadata
- Check if merchant record was created in `merchants` table

### Trigger Not Firing
- Ensure trigger is enabled in Supabase
- Check function permissions
- Verify function syntax is correct

### Manual Profile Creation
If automatic creation fails, users can manually create profiles using the setup form in the merchant portal.
