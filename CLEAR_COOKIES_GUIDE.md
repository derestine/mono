# Clear Cookies Button - Testing & Debugging Guide

## Overview

The Clear Cookies Button is a powerful debugging tool that helps you test authentication flows by clearing all session data, cookies, and local storage. This is especially useful for testing the merchant setup flow and authentication states.

## 🧹 **What It Clears**

When you click the "Clear All Data" button, it will:

1. **Sign out from Supabase** - Clears authentication tokens
2. **Clear Local Storage** - Removes all stored data
3. **Clear Session Storage** - Removes session-specific data
4. **Clear All Cookies** - Removes all browser cookies
5. **Redirect to Auth Page** - Takes you back to the sign-in page

## 📍 **Where to Find It**

### **1. Merchant Portal** (`/merchant`)
- **Location**: Top-right header, next to theme toggle
- **Behavior**: Clears data and redirects to `/auth`
- **Use Case**: Test merchant setup flow from scratch

### **2. Auth Page** (`/auth`)
- **Location**: Below the "mono" title
- **Behavior**: Clears data and reloads the page
- **Use Case**: Test signup/signin flows

### **3. Debug Signup Page** (`/debug-signup`)
- **Location**: Below the page title
- **Behavior**: Clears data and reloads the page
- **Use Case**: Test signup process step by step

## 🧪 **Testing Scenarios**

### **Scenario 1: Test Complete Signup Flow**
1. Go to `/auth` page
2. Click "Clear All Data" to start fresh
3. Sign up with a new email
4. Verify email
5. Check if merchant profile is created automatically

### **Scenario 2: Test Manual Setup Flow**
1. Go to `/merchant` page
2. Click "Clear All Data" to sign out
3. Sign up with a new email
4. Verify email
5. If no profile exists, complete manual setup

### **Scenario 3: Test Authentication States**
1. Sign in to the app
2. Go to `/merchant` page
3. Click "Clear All Data"
4. Verify you're redirected to `/auth`
5. Try signing in again

### **Scenario 4: Debug Database Issues**
1. Use `/debug-signup` to test signup
2. Click "Clear All Data" between tests
3. Check if database trigger creates profiles
4. Test manual profile creation

## 🔧 **Component Features**

### **Confirmation Dialog**
- **Default**: Shows confirmation dialog before clearing
- **Override**: Can disable with `showConfirmation={false}`

### **Loading State**
- Shows spinner while clearing data
- Disables button during operation

### **Success/Error Feedback**
- **Success**: Green message "All data cleared successfully"
- **Error**: Red message "Error clearing data"
- **Auto-hide**: Messages disappear after 3 seconds

### **Customizable**
- **Variant**: `default`, `outline`, `ghost`
- **Size**: `sm`, `md`, `lg`
- **Callback**: `onClear` function for custom actions

## 💡 **Best Practices**

### **For Development**
- Use frequently to test different authentication states
- Clear data before testing signup flows
- Use to simulate fresh user experience

### **For Testing**
- Clear data between test scenarios
- Use to verify authentication redirects
- Test both automatic and manual profile creation

### **For Debugging**
- Clear data when authentication seems stuck
- Use to reset to a known state
- Helpful for troubleshooting session issues

## 🚨 **Important Notes**

### **Data Loss**
- **All local data will be lost** when clearing
- **You will be signed out** of the application
- **No data is backed up** before clearing

### **Production Use**
- **Remove or hide** this button in production
- **Consider security implications** of clearing all data
- **Test thoroughly** before deploying

## 🔍 **Troubleshooting**

### **Button Not Working**
1. Check browser console for errors
2. Verify Supabase connection
3. Check if localStorage is available

### **Data Not Clearing**
1. Check browser privacy settings
2. Verify cookies are enabled
3. Check for browser extensions blocking

### **Redirect Issues**
1. Check `onClear` callback function
2. Verify target URL is correct
3. Check for JavaScript errors

## 📝 **Code Example**

```tsx
import { ClearCookiesButton } from '@/components/ui'

// Basic usage
<ClearCookiesButton />

// Custom configuration
<ClearCookiesButton 
  variant="outline"
  size="sm"
  showConfirmation={false}
  onClear={() => window.location.href = '/auth'}
/>
```

## 🎯 **Use Cases**

1. **Development Testing** - Clear state between tests
2. **Authentication Debugging** - Reset auth state
3. **Flow Testing** - Test complete user journeys
4. **Session Management** - Clear stuck sessions
5. **Fresh Start** - Reset to initial state

---

**Note**: This is a development/debugging tool. Remove or secure appropriately for production use.
