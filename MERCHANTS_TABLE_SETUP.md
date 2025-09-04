# Merchants Table Setup Guide

## 🎯 **Quick Setup**

This guide will help you create the merchants table in your Supabase project.

## 📋 **Step 1: Apply the SQL**

1. **Go to your Supabase Dashboard**
   - Navigate to your project
   - Click on "SQL Editor" in the left sidebar

2. **Copy and Paste the SQL**
   - Open the `merchants-table.sql` file
   - Copy all the content
   - Paste it into the SQL Editor

3. **Run the SQL**
   - Click "Run" to execute the SQL
   - You should see success messages

## ✅ **What This Creates**

### **Table Structure**
```sql
merchants (
    id UUID PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id),
    business_name VARCHAR(255),
    business_email VARCHAR(255),
    merchant_code VARCHAR(50) UNIQUE,
    status VARCHAR(20),
    subscription_plan VARCHAR(20),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
```

### **Security Features**
- **Row Level Security (RLS)** enabled
- **Policies** to ensure users can only access their own data
- **Indexes** for better performance

### **Database Function**
- **`create_merchant_profile()`** function for safe profile creation
- **Automatic merchant code generation**
- **Error handling** and validation

## 🔍 **Verify Setup**

### **Check Table Exists**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'merchants';
```

### **Check RLS is Enabled**
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'merchants';
```

### **Check Policies**
```sql
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'merchants';
```

### **Check Function**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'create_merchant_profile';
```

## 🧪 **Test the Setup**

### **Test 1: Manual Profile Creation**
```sql
-- This should work (replace with actual user ID)
SELECT create_merchant_profile(
    'your-user-id-here',
    'Test Business'
);
```

### **Test 2: Check Permissions**
```sql
-- Should return your merchant profile
SELECT * FROM merchants WHERE auth_user_id = auth.uid();
```

## 🚨 **Common Issues**

### **Issue 1: "Function not found"**
- **Solution**: Make sure you ran the entire SQL file
- **Check**: Verify the function exists with the verification query

### **Issue 2: "Permission denied"**
- **Solution**: Check that RLS policies are created
- **Check**: Verify policies with the verification query

### **Issue 3: "Table not found"**
- **Solution**: Make sure the table creation SQL ran successfully
- **Check**: Verify table exists with the verification query

## 🎉 **Success Indicators**

✅ **Table created** - `merchants` table exists  
✅ **RLS enabled** - Row Level Security is active  
✅ **Policies created** - 3 policies for SELECT, UPDATE, INSERT  
✅ **Function created** - `create_merchant_profile` function exists  
✅ **Indexes created** - Performance indexes are in place  

## 🔄 **Next Steps**

Once the merchants table is set up:

1. **Test the new auth flow**:
   - Go to `/auth` page
   - Sign up with a new account
   - Verify email
   - Create business profile

2. **Verify merchant portal access**:
   - Should redirect to `/merchant` after business creation
   - Should show merchant dashboard

3. **Check database records**:
   - Verify merchant profile was created
   - Check all fields are populated correctly

---

**Ready to test!** 🚀
