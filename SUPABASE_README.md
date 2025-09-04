# Supabase Implementation Guide

## Overview

This guide covers the Supabase implementation of the loyalty system database schema, including setup, configuration, and usage with the merchant portal application.

## Key Supabase Features Used

- **PostgreSQL Database**: Full relational database with advanced features
- **Row Level Security (RLS)**: Data isolation and security
- **Real-time Subscriptions**: Live updates for transactions and QR scans
- **Authentication**: Built-in user management
- **Edge Functions**: Serverless functions for complex operations
- **Database Functions**: Custom PostgreSQL functions for business logic

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key
3. Set up environment variables in your Next.js app:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 3. Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Execute the script

### 4. Configure Authentication

1. In Supabase dashboard, go to Authentication > Settings
2. Configure email templates and redirect URLs
3. Set up any additional auth providers if needed

## Database Schema Features

### Core Tables

#### `merchants`
- Stores merchant business information
- Links to Supabase auth users via `auth_user_id`
- Unique `merchant_code` for QR identification

#### `customers`
- Customer information with QR codes
- Optional auth integration for customer accounts
- Tracks spending and loyalty metrics

#### `transactions`
- Complete transaction processing
- Automatic status tracking
- Links to merchants and customers

### Loyalty System

#### `loyalty_programs`
- Merchant-specific loyalty configurations
- Configurable points per dollar
- Redemption rules and expiration settings

#### `customer_loyalty_accounts`
- Points tracking per customer per merchant
- Automatic points calculation
- Activity tracking

#### `points_transactions`
- Complete audit trail of point movements
- Supports earned, redeemed, expired, and adjusted transactions

### Analytics & Reporting

#### `merchant_daily_analytics`
- Pre-aggregated daily statistics
- Performance optimized for dashboard queries
- Automatic updates via triggers

#### `customer_visits`
- Visit pattern tracking
- Daily spending aggregation
- Customer behavior insights

### Security & Audit

#### `qr_scan_logs`
- Complete QR scan audit trail
- Security monitoring and fraud detection
- IP address and user agent tracking

#### `audit_logs`
- Comprehensive change tracking
- JSONB storage for flexible data
- Compliance and debugging support

## Row Level Security (RLS)

### Security Policies

The schema includes comprehensive RLS policies that ensure:

- **Merchants can only access their own data**
- **Customers can only access their own information**
- **Proper data isolation between businesses**
- **Admin-only access to system settings**

### Policy Examples

```sql
-- Merchants can only view their own transactions
CREATE POLICY "Merchants can view own transactions" ON transactions 
FOR SELECT USING (
    merchant_id IN (SELECT id FROM merchants WHERE auth_user_id = auth.uid())
);

-- Customers can only view their own data
CREATE POLICY "Customers can view own data" ON customers 
FOR SELECT USING (auth.uid() = auth_user_id);
```

## Database Functions

### `get_merchant_dashboard(merchant_uuid)`
Returns aggregated dashboard data for a merchant.

**Usage:**
```sql
SELECT * FROM get_merchant_dashboard('merchant-uuid');
```

### `create_transaction(p_merchant_id, p_customer_id, p_amount, p_payment_method, p_notes)`
Creates a new transaction and automatically handles loyalty points.

**Usage:**
```sql
SELECT * FROM create_transaction(
    'merchant-uuid',
    'customer-uuid',
    25.50,
    'cash',
    'Coffee purchase'
);
```

### `scan_qr_code(p_merchant_id, p_customer_code, p_ip_address, p_user_agent)`
Scans a QR code and returns customer information with automatic logging.

**Usage:**
```sql
SELECT * FROM scan_qr_code(
    'merchant-uuid',
    'CUST001',
    '192.168.1.1',
    'Mozilla/5.0...'
);
```

## Real-time Features

### Transaction Subscriptions

```typescript
import { realtimeOperations } from '@/lib/supabase'

// Subscribe to new transactions
const subscription = realtimeOperations.subscribeToTransactions(
  merchantId,
  (payload) => {
    console.log('New transaction:', payload.new)
    // Update UI in real-time
  }
)
```

### QR Scan Subscriptions

```typescript
// Subscribe to QR scan logs
const subscription = realtimeOperations.subscribeToQRScans(
  merchantId,
  (payload) => {
    console.log('New QR scan:', payload.new)
    // Update scan history in real-time
  }
)
```

## API Integration

### Merchant Operations

```typescript
import { merchantOperations } from '@/lib/supabase'

// Get dashboard data
const dashboard = await merchantOperations.getDashboard(merchantId)

// Update profile
const updatedProfile = await merchantOperations.updateProfile(merchantId, {
  business_name: 'New Business Name'
})
```

### Transaction Operations

```typescript
import { transactionOperations } from '@/lib/supabase'

// Create transaction
const result = await transactionOperations.createTransaction({
  merchantId: 'merchant-uuid',
  customerId: 'customer-uuid',
  amount: 25.50,
  paymentMethod: 'cash'
})

// Get recent transactions
const transactions = await transactionOperations.getRecentTransactions(merchantId, 10)
```

### Customer Operations

```typescript
import { customerOperations } from '@/lib/supabase'

// Scan QR code
const scanResult = await customerOperations.scanQRCode({
  merchantId: 'merchant-uuid',
  customerCode: 'CUST001',
  ipAddress: '192.168.1.1'
})

// Get customer loyalty account
const loyaltyAccount = await customerOperations.getLoyaltyAccount(customerId, merchantId)
```

## Authentication Flow

### Merchant Sign Up

```typescript
import { authOperations } from '@/lib/supabase'

const { data, error } = await authOperations.signUpMerchant(
  'merchant@example.com',
  'password123',
  'Coffee Shop'
)
```

### Merchant Sign In

```typescript
const { data, error } = await authOperations.signInMerchant(
  'merchant@example.com',
  'password123'
)
```

### Session Management

```typescript
// Get current user
const user = await authOperations.getCurrentUser()

// Get current session
const session = await authOperations.getCurrentSession()

// Sign out
await authOperations.signOut()
```

## Performance Optimizations

### Indexes

The schema includes comprehensive indexing for:

- **Transaction queries**: `merchant_id`, `customer_id`, `created_at`
- **Customer lookups**: `email`, `customer_code`
- **Analytics**: Date-based indexes for time-series queries
- **Loyalty**: Account and transaction-based indexes

### Views

Pre-aggregated views for common queries:

- **`merchant_dashboard`**: Real-time dashboard data
- **`customer_summary`**: Customer overview with recent activity

### Triggers

Automatic data integrity:

- **Customer totals update** on transaction completion
- **Loyalty points award** on transaction completion
- **Timestamp updates** on record modifications

## Security Considerations

### Data Protection

- **UUID Primary Keys**: Prevents enumeration attacks
- **RLS Policies**: Ensures data isolation
- **Audit Logging**: Complete change history
- **QR Scan Logging**: Security monitoring

### Access Control

- **Merchant Isolation**: All data filtered by merchant
- **Customer Privacy**: Sensitive data properly structured
- **Admin Controls**: Restricted system settings access

## Monitoring & Maintenance

### Database Monitoring

1. **Query Performance**: Monitor slow query logs in Supabase dashboard
2. **Storage Usage**: Track table and index sizes
3. **Connection Pool**: Monitor active connections

### Maintenance Tasks

1. **Statistics Updates**: Regular ANALYZE operations
2. **Index Maintenance**: Monitor index usage and effectiveness
3. **Data Archiving**: Archive old audit logs and analytics

### Backup Strategy

- **Automatic Backups**: Supabase provides daily backups
- **Point-in-time Recovery**: Available for disaster recovery
- **Cross-region Replication**: For high availability

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Ensure user is authenticated and policies are correct
2. **Function Permission Errors**: Check SECURITY DEFINER settings
3. **Real-time Connection Issues**: Verify subscription setup and error handling

### Debug Queries

```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'transactions';

-- Monitor active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes;
```

## Deployment Checklist

- [ ] Run complete schema script in Supabase
- [ ] Configure environment variables
- [ ] Set up authentication settings
- [ ] Test RLS policies
- [ ] Verify real-time subscriptions
- [ ] Test database functions
- [ ] Configure monitoring and alerts
- [ ] Set up backup procedures

This Supabase implementation provides a robust, scalable foundation for the loyalty system with comprehensive security, real-time capabilities, and excellent performance characteristics.
