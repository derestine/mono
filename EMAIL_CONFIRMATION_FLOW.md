# Email Confirmation Flow

## Overview

The signup process now includes an email confirmation step to verify user accounts. Here's how it works:

## Flow Steps

### 1. User Signs Up
- User fills out the signup form with email, password, and business name
- Form validates input and submits to Supabase
- If successful, user is redirected to email confirmation page

### 2. Email Confirmation Page
- Shows a message: "Check Your Email"
- Displays the email address used for signup
- Provides options to:
  - Resend verification email
  - Go back to sign in
  - Return to home page

### 3. Email Verification
- User receives an email with a verification link
- Clicking the link verifies their account
- User is redirected back to the auth page
- If verified, they can now sign in

## Components

### EmailConfirmation Component
- **Location**: `src/components/auth/EmailConfirmation.tsx`
- **Props**:
  - `email`: The email address used for signup
  - `onResendEmail`: Function to resend verification email
  - `onBackToSignIn`: Function to return to sign in form

### Updated Auth Page
- **Location**: `src/app/auth/page.tsx`
- **New States**:
  - `showEmailConfirmation`: Controls email confirmation display
  - `signupEmail`: Stores the email for confirmation page

## Supabase Configuration

### Email Redirect
- Email verification links redirect to: `http://localhost:3000/auth`
- Configured in `authOperations.signUpMerchant()`

### Resend Functionality
- `authOperations.resendConfirmationEmail()` allows users to request new verification emails
- Uses Supabase's built-in resend functionality

## User Experience

### Success Flow
1. User signs up with valid email
2. Email confirmation page appears
3. User checks email and clicks verification link
4. Account is verified and user can sign in

### Error Handling
- Invalid email addresses are caught by client-side validation
- Supabase errors are displayed to user
- Resend email functionality handles failed attempts

## Testing

### Development
- Use a real email address (gmail.com, outlook.com, etc.)
- Check Supabase Auth settings to ensure email confirmations are enabled
- Monitor browser console for any errors

### Production
- Ensure Supabase project has proper email settings
- Configure custom email templates if needed
- Set up proper redirect URLs for production domain

## Customization

### Email Template
- Customize email templates in Supabase dashboard
- Update branding and messaging as needed

### Redirect URLs
- Update `emailRedirectTo` in signup function for production
- Ensure proper domain configuration

### Styling
- Email confirmation page follows the app's design system
- Uses consistent typography, colors, and spacing
- Responsive design for mobile devices
