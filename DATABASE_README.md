# Loyalty System Database Schema

## Overview

This database schema is designed to support a comprehensive loyalty system for merchants, featuring QR code scanning, transaction processing, loyalty points management, and detailed analytics.

## Key Features

- **QR Code Integration**: Customer identification via QR codes
- **Transaction Processing**: Complete transaction lifecycle management
- **Loyalty Points System**: Configurable points earning and redemption
- **Analytics & Reporting**: Daily aggregated statistics and customer insights
- **Security & Audit**: QR scan logging and comprehensive audit trails
- **Multi-Merchant Support**: Isolated data per merchant with proper relationships

## Database Tables

### Core Tables

#### `merchants`
Stores merchant business information and configuration.
- **Primary Key**: `id` (UUID)
- **Unique Constraints**: `business_email`, `merchant_code`
- **Key Fields**: Business details, status, subscription plan
- **QR Integration**: `merchant_code` serves as QR identifier

#### `customers`
Stores customer information and loyalty data.
- **Primary Key**: `id` (UUID)
- **Unique Constraints**: `customer_code`, `email`
- **Key Fields**: Personal info, spending totals, loyalty points
- **QR Integration**: `customer_code` serves as QR identifier

### Transaction Tables

#### `transactions`
Core transaction table with complete transaction details.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `merchant_id`, `customer_id`
- **Key Fields**: Amount, payment method, status, timestamps
- **Status Tracking**: pending → completed/failed/cancelled

#### `transaction_items`
Optional line-item details for transactions.
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `transaction_id`
- **Key Fields**: Product details, quantities, pricing

### Loyalty System Tables

#### `loyalty_programs`
Merchant-specific loyalty program configurations.
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `merchant_id`
- **Key Fields**: Points per dollar, redemption rules, expiration
- **Flexibility**: Configurable points earning and redemption rules

#### `customer_loyalty_accounts`
Tracks loyalty points per customer per merchant.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `customer_id`, `merchant_id`, `loyalty_program_id`
- **Unique Constraint**: `(customer_id, merchant_id)`
- **Key Fields**: Current points, earned/redeemed totals

#### `points_transactions`
Complete audit trail of all point movements.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `customer_loyalty_account_id`, `transaction_id`
- **Key Fields**: Point changes, transaction types, descriptions

### Analytics & Reporting Tables

#### `merchant_daily_analytics`
Pre-aggregated daily statistics for performance.
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `merchant_id`
- **Unique Constraint**: `(merchant_id, date)`
- **Key Fields**: Sales, transactions, customers, points metrics

#### `customer_visits`
Tracks customer visit patterns and spending.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `customer_id`, `merchant_id`
- **Unique Constraint**: `(customer_id, merchant_id, visit_date)`
- **Key Fields**: Visit counts, daily spending totals

### System Tables

#### `qr_scan_logs`
Security and audit trail for QR code scans.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `merchant_id`, `customer_id`
- **Key Fields**: Scan results, IP addresses, user agents
- **Security**: Tracks all scan attempts for fraud detection

#### `system_settings`
Configuration storage for system-wide settings.
- **Primary Key**: `id` (UUID)
- **Unique Constraint**: `setting_key`
- **Key Fields**: Key-value pairs with type validation

#### `audit_logs`
Comprehensive audit trail for data changes.
- **Primary Key**: `id` (UUID)
- **Key Fields**: Table/record tracking, old/new values, timestamps

## Database Views

### `merchant_dashboard`
Aggregated view for merchant dashboard display.
- **Source Tables**: `merchants`, `transactions`, `points_transactions`
- **Key Metrics**: Total sales, transactions, customers, points

### `customer_summary`
Customer overview with recent activity.
- **Source Tables**: `customers`, `transactions`
- **Key Metrics**: Spending totals, recent activity, loyalty status

## Triggers & Automation

### `update_customer_totals()`
Automatically updates customer spending totals when transactions are completed.
- **Trigger**: `AFTER INSERT ON transactions`
- **Action**: Updates `customers.total_spent`, `total_transactions`, `last_visit_at`

### `update_loyalty_points()`
Automatically awards loyalty points when transactions are completed.
- **Trigger**: `AFTER UPDATE ON transactions`
- **Action**: Calculates and awards points based on loyalty program rules

## Performance Optimizations

### Indexes
- **Transaction Queries**: `merchant_id`, `customer_id`, `created_at`, `status`
- **Customer Lookups**: `email`, `customer_code`
- **Merchant Lookups**: `merchant_code`, `business_email`
- **Analytics**: Date-based indexes for time-series queries
- **Loyalty**: Account and transaction-based indexes

### Query Optimization
- **Pre-aggregated Analytics**: Daily stats reduce real-time calculation overhead
- **Efficient Joins**: Proper foreign key relationships with indexed columns
- **Partitioning Ready**: Date-based tables can be partitioned for large datasets

## Security Features

### Data Protection
- **UUID Primary Keys**: Prevents enumeration attacks
- **Audit Logging**: Complete change history for compliance
- **QR Scan Logging**: Tracks all scan attempts for security monitoring
- **Status Validation**: Check constraints prevent invalid states

### Access Control
- **Merchant Isolation**: All queries filter by `merchant_id`
- **Customer Privacy**: Sensitive data properly structured
- **Audit Trail**: Complete history of all data modifications

## Scalability Considerations

### Horizontal Scaling
- **Merchant Partitioning**: Data can be partitioned by merchant
- **Time-based Partitioning**: Analytics tables can be partitioned by date
- **Read Replicas**: Analytics queries can use read replicas

### Performance Monitoring
- **Query Performance**: Indexes optimized for common query patterns
- **Storage Efficiency**: Proper data types and constraints
- **Growth Planning**: Schema supports high-volume transaction processing

## API Integration

### Transaction Flow
1. **QR Scan**: Customer code scanned and validated
2. **Transaction Creation**: Amount entered and transaction recorded
3. **Points Award**: Automatic points calculation and award
4. **Analytics Update**: Real-time dashboard updates

### Data Consistency
- **ACID Compliance**: All operations wrapped in transactions
- **Trigger Automation**: Business logic enforced at database level
- **Audit Trail**: Complete history maintained for all operations

## Sample Queries

### Merchant Dashboard Data
```sql
SELECT * FROM merchant_dashboard WHERE merchant_id = 'merchant-uuid';
```

### Recent Transactions
```sql
SELECT t.*, c.first_name, c.last_name 
FROM transactions t 
JOIN customers c ON t.customer_id = c.id 
WHERE t.merchant_id = 'merchant-uuid' 
ORDER BY t.created_at DESC 
LIMIT 10;
```

### Customer Loyalty Status
```sql
SELECT c.*, cla.current_points, cla.total_points_earned
FROM customers c
LEFT JOIN customer_loyalty_accounts cla ON c.id = cla.customer_id
WHERE cla.merchant_id = 'merchant-uuid'
ORDER BY cla.current_points DESC;
```

### Daily Analytics
```sql
SELECT * FROM merchant_daily_analytics 
WHERE merchant_id = 'merchant-uuid' 
AND date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

## Migration & Deployment

### Initial Setup
1. Run the complete schema creation script
2. Insert sample data for testing
3. Configure system settings
4. Set up monitoring and backup procedures

### Data Migration
- **UUID Generation**: Use `gen_random_uuid()` for new records
- **Data Validation**: Ensure all constraints are satisfied
- **Performance Testing**: Verify query performance with production data volumes

### Backup Strategy
- **Point-in-time Recovery**: Enable WAL archiving
- **Regular Backups**: Daily full backups with hourly incrementals
- **Disaster Recovery**: Cross-region backup replication

## Monitoring & Maintenance

### Performance Monitoring
- **Query Performance**: Monitor slow query logs
- **Index Usage**: Track index effectiveness
- **Storage Growth**: Monitor table and index sizes

### Maintenance Tasks
- **Statistics Updates**: Regular ANALYZE operations
- **Index Maintenance**: Rebuild fragmented indexes
- **Data Archiving**: Archive old audit logs and analytics

This schema provides a robust foundation for a scalable loyalty system with comprehensive features for merchants, customers, and administrators.
