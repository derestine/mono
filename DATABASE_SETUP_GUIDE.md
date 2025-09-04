# Database Setup Guide - Fix Merchant Profile Error

## 🚨 **The Problem**

You're getting this error:
```
Error getting merchant profile: {}
```

This happens because:
1. **Database schema is not applied** to your Supabase project
2. **`merchants` table doesn't exist**
3. **RLS policies are blocking the query**

## 🔧 **Solution: Apply Complete Database Schema**

### **Step 1: Go to Supabase Dashboard**
1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New query"**

### **Step 2: Apply the Complete Schema**
1. Copy the entire contents of `supabase-complete-schema.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** to execute the script

### **Step 3: Verify Setup**
Run these verification queries in the SQL Editor:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('merchants', 'customers', 'transactions', 'loyalty_programs');

-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'get_merchant_dashboard', 'create_transaction', 'scan_qr_code');
```

## 🧪 **Test the Fix**

### **Test 1: Clear Data and Try Again**
1. Go to `/merchant` page
2. Click **"Clear All Data"** button
3. Sign up with a new email
4. Verify email
5. Check if merchant profile is created automatically

### **Test 2: Check Debug Info**
1. Go to `/merchant` page
2. Look at the **Debug Info** panel
3. Check if "Merchant Profile" shows "Found" or "Not Found"

### **Test 3: Use Debug Tools**
1. Go to `/debug-signup` page
2. Click **"Clear All Data"**
3. Test signup process
4. Check console logs for detailed information

## 🔍 **What the Schema Creates**

### **Tables**
- ✅ `merchants` - Merchant profiles
- ✅ `customers` - Customer data
- ✅ `transactions` - Transaction records
- ✅ `loyalty_programs` - Loyalty program settings
- ✅ `customer_loyalty_accounts` - Customer loyalty data
- ✅ `points_transactions` - Points transaction history
- ✅ `qr_scan_logs` - QR code scan logs

### **Functions**
- ✅ `handle_new_user()` - Creates merchant profile on signup
- ✅ `get_merchant_dashboard()` - Gets dashboard data
- ✅ `create_transaction()` - Creates transactions with points
- ✅ `scan_qr_code()` - Handles QR code scanning

### **Security**
- ✅ **Row Level Security (RLS)** - Data isolation
- ✅ **Policies** - Proper access control
- ✅ **Indexes** - Performance optimization

## 🚨 **If You Still Get Errors**

### **Error 1: "Table doesn't exist"**
- Make sure you ran the complete schema
- Check if the SQL execution was successful
- Verify tables exist with verification queries

### **Error 2: "Permission denied"**
- Check if RLS policies are applied
- Verify user authentication
- Check Supabase Auth settings

### **Error 3: "Function not found"**
- Make sure all functions were created
- Check for SQL execution errors
- Re-run the schema if needed

## 📊 **Expected Behavior After Fix**

### **Automatic Flow (If Trigger Works)**
1. User signs up → Email confirmation shows
2. User verifies email → Redirects to `/merchant`
3. **System finds merchant profile** → Shows merchant portal
4. ✅ **No setup form needed**

### **Fallback Flow (If Trigger Fails)**
1. User signs up → Email confirmation shows
2. User verifies email → Redirects to `/merchant`
3. System doesn't find merchant profile → Shows setup form
4. User completes setup → Shows merchant portal
5. ✅ **Setup form works correctly**

## 🔧 **Manual Verification**

### **Check Database Tables**
```sql
-- Check merchants table
SELECT * FROM merchants LIMIT 5;

-- Check if your user has a merchant profile
SELECT * FROM merchants WHERE auth_user_id = 'your-user-id-here';
```

### **Check Trigger Function**
```sql
-- Check if trigger function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

### **Check RLS Policies**
```sql
-- Check merchants policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'merchants';
```

## 🎯 **Success Indicators**

After applying the schema, you should see:
- ✅ **No more "Error getting merchant profile"**
- ✅ **Merchant portal loads correctly**
- ✅ **Debug info shows "Merchant Profile: Found"**
- ✅ **Automatic profile creation works**

## 🆘 **Still Having Issues?**

1. **Check Supabase Logs**
   - Go to Supabase Dashboard → Logs
   - Look for any database errors

2. **Verify Environment Variables**
   - Check your `.env.local` file
   - Ensure Supabase URL and key are correct

3. **Test Database Connection**
   - Use `/test-supabase` page
   - Check if connection is working

4. **Check Browser Console**
   - Look for detailed error messages
   - Check network requests to Supabase

---

**Next Step**: Apply the complete schema and test the merchant setup flow!
