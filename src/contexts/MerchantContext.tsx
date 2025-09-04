'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { 
  merchantOperations, 
  transactionOperations, 
  customerOperations
} from '@/lib/supabase'

interface MerchantData {
  id: string
  business_name: string
  business_email: string
  merchant_code: string
  status: string
  subscription_plan: string
  country: string
  currency: string
  business_description?: string
  business_address?: string
  opening_hours?: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  timezone: string
  phone?: string
  website?: string
  created_at: string
  updated_at: string
}

interface LoyaltyProgram {
  id: string
  merchant_id: string
  name: string
  program_type: 'points' | 'stamps'
  points_per_dollar: number
  status: string
  created_at: string
}

interface DashboardData {
  merchant_id: string
  business_name: string
  merchant_code: string
  merchant_status: string
  total_sales: number
  total_transactions: number
  unique_customers: number
  average_transaction_value: number
  total_points_earned: number
  total_points_redeemed: number
}

interface Transaction {
  id: string
  merchant_id: string
  customer_id: string
  transaction_code: string
  amount: number
  currency: string
  transaction_type: string
  payment_method: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
  customers?: {
    id: string
    first_name: string
    last_name: string
    customer_code: string
  }
}

interface Customer {
  id: string
  customer_code: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  status: string
  total_spent: number
  total_transactions: number
  loyalty_points: number
  created_at: string
  last_visit_at?: string
  // Enhanced insights
  visit_frequency?: number
  spending_trend?: 'up' | 'down' | 'stable'
  average_order_value?: number
  last_transaction?: {
    amount: number
    payment_method: string
    created_at: string
    notes?: string
  } | null
  recent_spending?: number
  customer_lifetime_value?: number
  days_since_last_visit?: number | null
}

interface QRScanResult {
  success: boolean
  customer_id: string
  customer_name: string
  current_points: number
  error_message?: string
}

interface MerchantContextType {
  merchant: MerchantData | null
  dashboard: DashboardData | null
  transactions: Transaction[]
  customers: Customer[]
  loyaltyProgram: LoyaltyProgram | null
  loading: boolean
  error: string | null
  
  // Operations
  refreshDashboard: () => Promise<void>
  refreshTransactions: () => Promise<void>
  refreshCustomers: () => Promise<void>
  refreshLoyaltyProgram: () => Promise<void>
  updateMerchantProfile: (updates: Partial<MerchantData>) => Promise<void>
  createTransaction: (params: {
    customerId: string
    amount: number
    paymentMethod?: string
    notes?: string
  }) => Promise<{ success: boolean; error?: string; data?: unknown; pointsEarned?: number }>
  scanQRCode: (customerCode: string) => Promise<QRScanResult>
  getCustomer: (customerId: string) => Promise<Customer | null>
  getLoyaltyAccount: (customerId: string) => Promise<unknown>
  updateLoyaltyProgram: (updates: {
    points_per_dollar?: number
    program_type?: 'points' | 'stamps'
    name?: string
  }) => Promise<void>
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined)

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [merchant, setMerchant] = useState<MerchantData | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get merchant profile when user is authenticated
  useEffect(() => {
    if (user) {
      loadMerchantData()
    } else {
      setMerchant(null)
      setDashboard(null)
      setTransactions([])
      setCustomers([])
      setLoading(false)
    }
  }, [user])

  const loadMerchantData = async () => {
    if (!user) return

    console.log('🔍 MerchantContext: Loading merchant data for user:', user.id)
    console.log('🔍 User details:', { id: user.id, email: user.email })
    setLoading(true)
    setError(null)

    try {
      // Get merchant profile first
      console.log('📋 Fetching merchant profile...')
      const merchantData = await merchantOperations.getProfile(user.id)
      console.log('✅ Merchant profile found:', merchantData)
      setMerchant(merchantData)

      // Get dashboard data using the auth user ID
      try {
        console.log('📊 Fetching dashboard data...')
        const dashboardData = await merchantOperations.getDashboard(user.id)
        console.log('📊 Dashboard data received:', dashboardData)
        if (dashboardData && dashboardData.length > 0) {
          setDashboard(dashboardData[0])
          console.log('✅ Dashboard data set:', dashboardData[0])
        } else {
          console.log('⚠️ No dashboard data returned')
        }
      } catch (dashError) {
        console.log('❌ Dashboard loading failed, continuing without dashboard data:', dashError)
        // Continue without dashboard data - portal will still work
      }

      // Get recent transactions using the merchant ID
      console.log('💳 Fetching transactions for merchant:', merchantData.id)
      const transactionsData = await transactionOperations.getRecentTransactions(merchantData.id, 20)
      console.log('💳 Transactions received:', transactionsData?.length || 0, 'transactions')
      setTransactions(transactionsData || [])

      // Get customers using the merchant ID
      console.log('👥 Fetching customers for merchant:', merchantData.id)
      const customersData = await customerOperations.getCustomersForMerchant(merchantData.id)
      console.log('👥 Customers received:', customersData?.length || 0, 'customers')
      setCustomers(customersData || [])

      // Get loyalty program for the merchant
      console.log('🎯 Fetching loyalty program for merchant:', merchantData.id)
      const loyaltyProgramData = await merchantOperations.getLoyaltyProgram(merchantData.id)
      console.log('🎯 Loyalty program received:', loyaltyProgramData)
      setLoyaltyProgram(loyaltyProgramData || null)

    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Failed to load merchant data'
      console.log('Error loading merchant data:', errorMessage)
      
      // Check if this is a "not found" error and handle gracefully
      if (errorMessage.includes('not found') || errorMessage.includes('No rows returned') || errorMessage.includes('No merchant profile found')) {
        console.log('Setting up profile setup flow...')
        setError('Merchant profile not found. Please complete your profile setup.')
      } else {
        setError(errorMessage)
      }
      console.error('Error loading merchant data:', err as Error)
    } finally {
      setLoading(false)
    }
  }

  const refreshDashboard = async () => {
    if (!user) return

    try {
      const dashboardData = await merchantOperations.getDashboard(user.id)
      if (dashboardData && dashboardData.length > 0) {
        setDashboard(dashboardData[0])
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to refresh dashboard')
    }
  }

  const refreshTransactions = async () => {
    if (!user || !merchant) return

    try {
      const transactionsData = await transactionOperations.getRecentTransactions(merchant.id, 20)
      setTransactions(transactionsData || [])
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to refresh transactions')
    }
  }

  const refreshCustomers = async () => {
    if (!user || !merchant) return

    try {
      console.log('👥 MerchantContext: Refreshing customers for merchant:', merchant.id)
      const customersData = await customerOperations.getCustomersForMerchant(merchant.id)
      console.log('✅ Customers loaded:', customersData?.length || 0, 'customers')
      setCustomers(customersData || [])
    } catch (err: unknown) {
      console.error('❌ Error refreshing customers:', err)
      setError((err as Error)?.message || 'Failed to refresh customers')
    }
  }

  const refreshLoyaltyProgram = async () => {
    if (!user || !merchant) return

    try {
      console.log('🎯 MerchantContext: Refreshing loyalty program for merchant:', merchant.id)
      const loyaltyProgramData = await merchantOperations.getLoyaltyProgram(merchant.id)
      console.log('✅ Loyalty program loaded:', loyaltyProgramData)
      setLoyaltyProgram(loyaltyProgramData || null)
    } catch (err: unknown) {
      console.error('❌ Error refreshing loyalty program:', err)
      setError((err as Error)?.message || 'Failed to refresh loyalty program')
    }
  }

  const updateLoyaltyProgram = async (updates: {
    points_per_dollar?: number
    program_type?: 'points' | 'stamps'
    name?: string
  }) => {
    if (!user || !merchant) return

    try {
      console.log('🔧 MerchantContext: Updating loyalty program:', updates)
      await merchantOperations.updateLoyaltyProgram(merchant.id, updates)
      await refreshLoyaltyProgram()
      console.log('✅ Loyalty program updated successfully')
    } catch (err: unknown) {
      console.error('❌ Error updating loyalty program:', err)
      throw new Error((err as Error)?.message || 'Failed to update loyalty program')
    }
  }

  const updateMerchantProfile = async (updates: Partial<MerchantData>) => {
    if (!user || !merchant) return

    try {
      console.log('🔧 MerchantContext: Updating merchant profile:', updates)
      await merchantOperations.updateProfile(merchant.id, updates)
      
      // Refresh merchant data to get updated values
      await loadMerchantData()
      console.log('✅ Merchant profile updated successfully')
    } catch (err: unknown) {
      console.error('❌ Error updating merchant profile:', err)
      throw new Error((err as Error)?.message || 'Failed to update merchant profile')
    }
  }

  const createTransaction = async (params: {
    customerId: string
    amount: number
    paymentMethod?: string
    notes?: string
  }) => {
    if (!user || !merchant) {
      return { success: false, error: 'User not authenticated or merchant profile missing' }
    }

    try {
      console.log('💳 MerchantContext: Creating transaction with automatic points')
      const result = await transactionOperations.createTransaction({
        merchantId: merchant.id,
        customerId: params.customerId,
        amount: params.amount,
        paymentMethod: params.paymentMethod || 'cash',
        notes: params.notes
      })

      console.log('💳 Transaction result:', result)

      // Refresh all data to show updated points and transactions
      await Promise.all([
        refreshDashboard(),
        refreshTransactions(),
        refreshCustomers() // Refresh to show updated customer points
      ])

      return { 
        success: true, 
        data: result, 
        pointsEarned: result?.points_earned || 0
      }
    } catch (err: unknown) {
      console.error('❌ Transaction creation failed:', err)
      return { success: false, error: (err as Error)?.message || 'Failed to create transaction' }
    }
  }

  const scanQRCode = async (customerCode: string): Promise<QRScanResult> => {
    if (!user || !merchant) {
      return {
        success: false,
        customer_id: '',
        customer_name: '',
        current_points: 0,
        error_message: 'User not authenticated or merchant profile missing'
      }
    }

    try {
      const result = await customerOperations.scanQRCode({
        merchantId: merchant.id,
        customerCode,
        ipAddress: '127.0.0.1', // In production, get from request
        userAgent: navigator.userAgent
      })

      if (result && result.length > 0) {
        const scanData = result[0]
        return {
          success: scanData.success,
          customer_id: scanData.customer_id || '',
          customer_name: scanData.customer_name || '',
          current_points: scanData.current_points || 0,
          error_message: scanData.error_message
        }
      }

      return {
        success: false,
        customer_id: '',
        customer_name: '',
        current_points: 0,
        error_message: 'Invalid QR code'
      }
    } catch (err: unknown) {
      return {
        success: false,
        customer_id: '',
        customer_name: '',
        current_points: 0,
        error_message: (err as Error)?.message || 'Failed to scan QR code'
      }
    }
  }

  const getCustomer = async (customerId: string): Promise<Customer | null> => {
    try {
      const customer = await customerOperations.getCustomer(customerId)
      return customer
    } catch (err: unknown) {
      console.error('Error getting customer:', err)
      return null
    }
  }

  const getLoyaltyAccount = async (customerId: string) => {
    if (!user || !merchant) return null

    try {
      const loyaltyAccount = await customerOperations.getLoyaltyAccount(customerId, merchant.id)
      return loyaltyAccount
    } catch (err: unknown) {
      console.error('Error getting loyalty account:', err)
      return null
    }
  }

  const value = {
    merchant,
    dashboard,
    transactions,
    customers,
    loyaltyProgram,
    loading,
    error,
    refreshDashboard,
    refreshTransactions,
    refreshCustomers,
    refreshLoyaltyProgram,
    updateMerchantProfile,
    createTransaction,
    scanQRCode,
    getCustomer,
    getLoyaltyAccount,
    updateLoyaltyProgram
  }

  return (
    <MerchantContext.Provider value={value}>
      {children}
    </MerchantContext.Provider>
  )
}

export function useMerchant() {
  const context = useContext(MerchantContext)
  if (context === undefined) {
    throw new Error('useMerchant must be used within a MerchantProvider')
  }
  return context
}
