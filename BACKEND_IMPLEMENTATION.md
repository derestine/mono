# Backend Implementation Guide

## Overview

This document covers the backend implementation for the merchant side of the loyalty system, including authentication, database operations, and real-time features.

## Architecture

### Authentication Flow
1. **Sign Up**: Merchants create accounts with business information
2. **Sign In**: Secure authentication using Supabase Auth
3. **Session Management**: Automatic session persistence and refresh
4. **Protected Routes**: Authentication checks for merchant portal access

### Database Operations
1. **Merchant Profile**: CRUD operations for merchant data
2. **Dashboard Analytics**: Real-time business metrics
3. **Transaction Processing**: QR code scanning and transaction creation
4. **Customer Management**: Customer lookup and loyalty tracking

## Key Components

### 1. Authentication Context (`src/contexts/AuthContext.tsx`)
- Manages user authentication state
- Provides sign-in/sign-up functions
- Handles session persistence
- Automatic redirects for unauthenticated users

### 2. Merchant Context (`src/contexts/MerchantContext.tsx`)
- Manages merchant-specific data
- Provides dashboard analytics
- Handles transaction operations
- QR code scanning functionality

### 3. Supabase Client (`src/lib/supabase.ts`)
- Database operations wrapper
- Real-time subscriptions
- Error handling and utilities
- Type-safe database interactions

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Schema
Run the Supabase schema script (`supabase-schema.sql`) in your Supabase project's SQL editor.

### 3. Authentication Setup
1. Configure authentication settings in Supabase dashboard
2. Set up email templates for sign-up confirmation
3. Configure redirect URLs for authentication flows

## Features Implemented

### Authentication
- ✅ Merchant sign-up with business information
- ✅ Secure sign-in with email/password
- ✅ Session management and persistence
- ✅ Protected route access
- ✅ Sign-out functionality

### Merchant Portal
- ✅ Real-time dashboard with business metrics
- ✅ QR code scanning for customer identification
- ✅ Transaction processing with spend modal
- ✅ Recent transactions display
- ✅ Customer information lookup

### Database Integration
- ✅ Merchant profile management
- ✅ Transaction creation and tracking
- ✅ Customer QR code scanning
- ✅ Loyalty points calculation
- ✅ Real-time data updates

## API Endpoints (Supabase Functions)

### Merchant Operations
- `get_merchant_dashboard(merchant_uuid)` - Get dashboard analytics
- `create_transaction(...)` - Create new transaction
- `scan_qr_code(...)` - Scan customer QR code

### Authentication
- `signUpMerchant()` - Create merchant account
- `signInMerchant()` - Authenticate merchant
- `signOut()` - End session

## Real-time Features

### Transaction Subscriptions
```typescript
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

## Security Features

### Row Level Security (RLS)
- Merchants can only access their own data
- Customer data is properly isolated
- Admin-only access to system settings

### Authentication Security
- Secure password handling
- Session management
- Automatic token refresh
- Protected API endpoints

## Error Handling

### Client-side Error Handling
- Authentication errors with user-friendly messages
- Database operation error handling
- Network error recovery
- Loading states and retry mechanisms

### Server-side Error Handling
- Database constraint violations
- Authentication failures
- Permission denied errors
- Rate limiting and throttling

## Performance Optimizations

### Database Queries
- Optimized indexes for common queries
- Pre-aggregated dashboard views
- Efficient transaction lookups
- Pagination for large datasets

### Real-time Updates
- Efficient subscription management
- Debounced UI updates
- Optimistic updates for better UX
- Background data refresh

## Testing Considerations

### Authentication Testing
- Sign-up flow validation
- Sign-in error handling
- Session persistence testing
- Protected route access

### Transaction Testing
- QR code scanning accuracy
- Transaction creation validation
- Error handling for invalid data
- Real-time update verification

## Deployment Checklist

- [ ] Set up Supabase project
- [ ] Run database schema
- [ ] Configure environment variables
- [ ] Set up authentication settings
- [ ] Test all authentication flows
- [ ] Verify database operations
- [ ] Test real-time features
- [ ] Configure error monitoring
- [ ] Set up backup procedures

## Next Steps

### Customer Side Implementation
- Customer registration and QR code generation
- Customer portal with transaction history
- Loyalty points redemption
- Push notifications for transactions

### Advanced Features
- Multi-location support for merchants
- Advanced analytics and reporting
- Bulk transaction processing
- Integration with payment processors

### Security Enhancements
- Two-factor authentication
- Advanced fraud detection
- Audit logging and compliance
- Data encryption at rest

This backend implementation provides a solid foundation for the loyalty system with comprehensive authentication, real-time features, and scalable database operations.
