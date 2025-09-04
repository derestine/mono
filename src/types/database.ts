// ===== DATABASE TYPES =====
// TypeScript interfaces matching the database schema

export interface Merchant {
  id: string;
  business_name: string;
  business_email: string;
  business_phone?: string;
  business_address?: string;
  tax_id?: string;
  merchant_code: string;
  status: 'active' | 'inactive' | 'suspended';
  subscription_plan: 'basic' | 'premium' | 'enterprise';
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

export interface Customer {
  id: string;
  customer_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: Date;
  status: 'active' | 'inactive' | 'blocked';
  total_spent: number;
  total_transactions: number;
  loyalty_points: number;
  created_at: Date;
  updated_at: Date;
  last_visit_at?: Date;
}

export interface Transaction {
  id: string;
  merchant_id: string;
  customer_id: string;
  transaction_code: string;
  amount: number;
  currency: string;
  transaction_type: 'purchase' | 'refund' | 'adjustment';
  payment_method: 'cash' | 'card' | 'mobile' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category?: string;
  created_at: Date;
}

export interface LoyaltyProgram {
  id: string;
  merchant_id: string;
  program_name: string;
  points_per_dollar: number;
  minimum_redemption_points: number;
  point_value_in_cents: number;
  expiration_days?: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface CustomerLoyaltyAccount {
  id: string;
  customer_id: string;
  merchant_id: string;
  loyalty_program_id: string;
  current_points: number;
  total_points_earned: number;
  total_points_redeemed: number;
  last_activity_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PointsTransaction {
  id: string;
  customer_loyalty_account_id: string;
  transaction_id?: string;
  points_change: number;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  description?: string;
  created_at: Date;
}

export interface MerchantDailyAnalytics {
  id: string;
  merchant_id: string;
  date: Date;
  total_sales: number;
  total_transactions: number;
  unique_customers: number;
  average_transaction_value: number;
  total_points_earned: number;
  total_points_redeemed: number;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerVisit {
  id: string;
  customer_id: string;
  merchant_id: string;
  visit_date: Date;
  visit_count: number;
  total_spent: number;
  created_at: Date;
  updated_at: Date;
}

export interface QRScanLog {
  id: string;
  merchant_id: string;
  customer_id?: string;
  scanned_code: string;
  scan_result: 'success' | 'invalid' | 'expired' | 'blocked';
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value?: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  changed_by?: string;
  changed_at: Date;
}

// ===== VIEW TYPES =====

export interface MerchantDashboard {
  merchant_id: string;
  business_name: string;
  merchant_code: string;
  merchant_status: string;
  total_sales: number;
  total_transactions: number;
  unique_customers: number;
  average_transaction_value: number;
  total_points_earned: number;
  total_points_redeemed: number;
}

export interface CustomerSummary {
  customer_id: string;
  customer_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  total_spent: number;
  total_transactions: number;
  loyalty_points: number;
  last_visit_at?: Date;
  recent_transactions: number;
  recent_spent: number;
}

// ===== API REQUEST/RESPONSE TYPES =====

export interface CreateTransactionRequest {
  merchant_id: string;
  customer_id: string;
  amount: number;
  currency?: string;
  payment_method?: 'cash' | 'card' | 'mobile' | 'other';
  notes?: string;
  items?: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    category?: string;
  }>;
}

export interface CreateTransactionResponse {
  transaction: Transaction;
  loyalty_points_earned: number;
  customer_updated: Customer;
}

export interface QRScanRequest {
  merchant_id: string;
  customer_code: string;
  ip_address?: string;
  user_agent?: string;
}

export interface QRScanResponse {
  success: boolean;
  customer?: Customer;
  error?: string;
  scan_log: QRScanLog;
}

export interface MerchantAnalyticsRequest {
  merchant_id: string;
  start_date: Date;
  end_date: Date;
  group_by?: 'day' | 'week' | 'month';
}

export interface MerchantAnalyticsResponse {
  analytics: MerchantDailyAnalytics[];
  summary: {
    total_sales: number;
    total_transactions: number;
    unique_customers: number;
    average_transaction_value: number;
    total_points_earned: number;
    total_points_redeemed: number;
  };
}

// ===== UTILITY TYPES =====

export type TransactionStatus = Transaction['status'];
export type PaymentMethod = Transaction['payment_method'];
export type CustomerStatus = Customer['status'];
export type MerchantStatus = Merchant['status'];
export type LoyaltyProgramStatus = LoyaltyProgram['status'];
export type PointsTransactionType = PointsTransaction['transaction_type'];
export type QRScanResult = QRScanLog['scan_result'];

// ===== ENUM TYPES =====

export const TRANSACTION_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  MOBILE: 'mobile',
  OTHER: 'other',
} as const;

export const CUSTOMER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
} as const;

export const MERCHANT_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export const LOYALTY_PROGRAM_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const POINTS_TRANSACTION_TYPES = {
  EARNED: 'earned',
  REDEEMED: 'redeemed',
  EXPIRED: 'expired',
  ADJUSTED: 'adjusted',
} as const;

export const QR_SCAN_RESULTS = {
  SUCCESS: 'success',
  INVALID: 'invalid',
  EXPIRED: 'expired',
  BLOCKED: 'blocked',
} as const;
