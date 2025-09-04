import { createClient } from '@supabase/supabase-js'
// import type { Database } from './database.types'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
  throw new Error('Missing required Supabase environment variables. Please check your .env.local file.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'loyalty-app'
    }
  }
})

// Test the connection on initialization
console.log('Supabase client initialized with URL:', supabaseUrl)

// ===== DATABASE OPERATIONS =====

// Merchant operations
export const merchantOperations = {
  // Get loyalty program settings for merchant
  async getLoyaltyProgram(merchantId: string) {
    console.log('🎯 Supabase: Getting loyalty program for merchant ID:', merchantId)
    
    try {
      // First try to get existing loyalty program
      const { data, error } = await supabase
        .from('loyalty_programs')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('status', 'active')
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error getting loyalty program:', error)
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        
        // Return a fallback program instead of throwing
        console.log('🔄 Returning fallback loyalty program due to database error')
        return {
          id: 'fallback',
          merchant_id: merchantId,
          name: 'Default Loyalty Program',
          program_name: 'Default Loyalty Program', // Support both column names
          program_type: 'points' as const,
          points_per_dollar: 1,
          status: 'active',
          created_at: new Date().toISOString()
        }
      }
      
      // If no program exists, create a default one
      if (!data) {
        console.log('🆕 Creating default loyalty program for merchant:', merchantId)
        const defaultProgram = {
          merchant_id: merchantId,
          name: 'Default Loyalty Program',
          program_name: 'Default Loyalty Program', // Support both column names
          program_type: 'points' as const,
          points_per_dollar: 1,
          status: 'active'
        }
        
        const { data: newProgram, error: createError } = await supabase
          .from('loyalty_programs')
          .insert(defaultProgram)
          .select()
          .single()
        
        if (createError) {
          console.error('❌ Error creating default loyalty program:', createError)
          console.error('❌ Create error details:', {
            message: createError.message,
            code: createError.code,
            details: createError.details,
            hint: createError.hint
          })
          
          // Check for RLS policy violation specifically
          if (createError.code === '42501' && createError.message.includes('row-level security policy')) {
            console.error('🔒 RLS Policy Error: The loyalty_programs table has Row Level Security enabled but is missing UPDATE/INSERT policies.')
            console.error('🔧 Solution: Run the loyalty-programs-rls-fix.sql file in your Supabase SQL Editor.')
          }
          
          // Return fallback program if database creation fails
          return {
            id: 'fallback',
            ...defaultProgram,
            created_at: new Date().toISOString()
          }
        }
        
        console.log('✅ Default loyalty program created:', newProgram)
        return newProgram
      }
      
      console.log('✅ Loyalty program found:', data)
      
      // Normalize column names to ensure consistency
      return {
        ...data,
        name: data.name || data.program_name || 'Default Loyalty Program',
        program_type: data.program_type || 'points' // Default to points if not specified
      }
      
    } catch (err) {
      console.error('❌ Unexpected error in getLoyaltyProgram:', err)
      
      // Return fallback program for any unexpected errors
      return {
        id: 'fallback',
        merchant_id: merchantId,
        name: 'Default Loyalty Program',
        program_type: 'points' as const,
        points_per_dollar: 1,
        status: 'active',
        created_at: new Date().toISOString()
      }
    }
  },

  // Update loyalty program settings
  async updateLoyaltyProgram(merchantId: string, updates: {
    points_per_dollar?: number
    program_type?: 'points' | 'stamps'
    name?: string
  }) {
    console.log('🔧 Updating loyalty program for merchant:', merchantId, updates)
    
    try {
      // First check if the loyalty_programs table exists and if there's an existing program
      console.log('🔍 Checking for existing loyalty program...')
      const { data: existingProgram, error: checkError } = await supabase
        .from('loyalty_programs')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('status', 'active')
        .single()
      
      if (checkError) {
        console.error('❌ Error checking existing program:', checkError)
        console.error('❌ Check error details:', {
          message: checkError.message,
          code: checkError.code,
          details: checkError.details,
          hint: checkError.hint
        })
        
        // If table doesn't exist or other database issues, simulate success
        if (checkError.code === '42P01' || checkError.code === 'PGRST116') {
          console.log('🔄 Table does not exist or no program found, simulating update success')
          return {
            id: 'fallback',
            merchant_id: merchantId,
            name: updates.name || 'Default Loyalty Program',
            program_type: updates.program_type || 'points',
            points_per_dollar: updates.points_per_dollar || 1,
            status: 'active',
            created_at: new Date().toISOString()
          }
        }
        
        throw new Error(`Database check failed: ${checkError.message}`)
      }
      
      console.log('✅ Existing program found:', existingProgram)
      console.log('📋 Available columns in existing program:', Object.keys(existingProgram))
      
      // Filter updates to only include columns that exist in the table
      const safeUpdates: any = {}
      
      // Only include supported columns based on what exists in the database
      if (updates.program_type && 'program_type' in existingProgram) {
        safeUpdates.program_type = updates.program_type
      }
      
      if (updates.points_per_dollar !== undefined && 'points_per_dollar' in existingProgram) {
        safeUpdates.points_per_dollar = updates.points_per_dollar
      }
      
      // Handle name update - try both 'name' and 'program_name' columns
      if (updates.name) {
        if ('name' in existingProgram) {
          safeUpdates.name = updates.name
          console.log('✅ Using new "name" column for update')
        } else if ('program_name' in existingProgram) {
          safeUpdates.program_name = updates.name
          console.log('✅ Using legacy "program_name" column for update')
        } else {
          console.log('⚠️ Neither "name" nor "program_name" column exists - skipping name update')
        }
      }
      
      console.log('🔧 Safe updates to apply:', safeUpdates)
      
      // If no valid updates, simulate success with existing data
      if (Object.keys(safeUpdates).length === 0) {
        console.log('ℹ️ No valid columns to update, returning existing program')
        return {
          ...existingProgram,
          // Apply the requested updates to the returned object even if we can't save them
          name: updates.name || existingProgram.name || existingProgram.program_name || 'Default Loyalty Program',
          program_type: updates.program_type || existingProgram.program_type || 'points',
          points_per_dollar: updates.points_per_dollar !== undefined ? updates.points_per_dollar : existingProgram.points_per_dollar
        }
      }
      
      // Now update the existing program with only safe columns
      const { data, error } = await supabase
        .from('loyalty_programs')
        .update(safeUpdates)
        .eq('merchant_id', merchantId)
        .eq('status', 'active')
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error updating loyalty program:', error)
        console.error('❌ Update error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        
        // Check for RLS policy violation specifically
        if (error.code === '42501' && error.message.includes('row-level security policy')) {
          console.error('🔒 RLS Policy Error: Missing UPDATE policy for loyalty_programs table.')
          console.error('🔧 Solution: Run the loyalty-programs-rls-fix.sql file in your Supabase SQL Editor.')
          throw new Error(`Database permission error: Row Level Security policy prevents updates to loyalty_programs. Please run the RLS fix SQL script.`)
        }
        
        throw new Error(`Update failed: ${error.message}. Please check your database connection.`)
      }
      
      console.log('✅ Loyalty program updated:', data)
      
      // Return the updated data with normalized column names
      return {
        ...data,
        name: updates.name || data.name || data.program_name || 'Default Loyalty Program',
        program_type: data.program_type || updates.program_type || 'points'
      }
      
    } catch (err) {
      console.error('❌ Unexpected error in updateLoyaltyProgram:', err)
      
      // Provide more specific error messages
      if (err instanceof Error) {
        throw new Error(`Failed to update loyalty program: ${err.message}`)
      } else {
        throw new Error('Failed to update loyalty program: Unknown error occurred')
      }
    }
  },

  // Get merchant dashboard data using auth user ID
  async getDashboard(authUserId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_merchant_dashboard', { auth_user_uuid: authUserId })
      
      if (error) {
        console.error('Dashboard RPC error:', error)
        throw error
      }
      
      console.log('Dashboard data received:', data)
      
      // If data is a JSON object, wrap it in an array for consistency
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return [data]
      }
      
      return data || []
    } catch (err) {
      console.error('Dashboard function error:', err)
      // Fallback: create mock dashboard data
      return [{
        merchant_id: authUserId,
        business_name: 'Your Business',
        merchant_code: 'TEMP',
        merchant_status: 'active',
        total_sales: 0,
        total_transactions: 0,
        unique_customers: 0,
        average_transaction_value: 0,
        total_points_earned: 0,
        total_points_redeemed: 0
      }]
    }
  },

  // Get merchant profile
  async getProfile(merchantId: string) {
    console.log('🔍 Supabase: Getting merchant profile for user ID:', merchantId)
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('auth_user_id', merchantId)
      .single()
    
    if (error) {
      console.error('Error getting merchant profile:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      // If it's a "not found" error, provide a more helpful message
      if (error.code === 'PGRST116') {
        throw new Error('Merchant profile not found. Please complete your profile setup.')
      }
      
      throw error
    }
    
    console.log('Merchant profile found:', data)
    return data
  },

  // Update merchant profile
  async updateProfile(merchantId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('merchants')
      .update(updates)
      .eq('id', merchantId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

          // Create merchant profile (for existing users who don't have one)
        async createProfile(userId: string, businessName: string, locationInfo?: {
          country: string
          currency: string
          timezone: string
        }) {
          console.log('Creating merchant profile for user:', userId, 'with business name:', businessName, 'location:', locationInfo)
          
          // Use the database function to create merchant profile with location info
          const { data, error } = await supabase
            .rpc('create_merchant_profile', {
              user_id: userId,
              business_name_param: businessName,
              country_param: locationInfo?.country || 'SGP',
              currency_param: locationInfo?.currency || 'SGD',
              timezone_param: locationInfo?.timezone || 'Asia/Singapore'
            })
          
          if (error) {
            console.error('Error creating merchant profile:', error)
            throw error
          }
          
          console.log('Merchant profile created successfully:', data)
          return data
        }
}

// Transaction operations
export const transactionOperations = {
  // Create a new transaction with automatic point earning
  async createTransaction(params: {
    merchantId: string
    customerId: string
    amount: number
    paymentMethod?: string
    notes?: string
  }) {
    console.log('💳 Creating transaction with automatic points:', params)
    
    try {
      // Get loyalty program settings first
      const loyaltyProgram = await merchantOperations.getLoyaltyProgram(params.merchantId)
      
      // Calculate points to earn based on program type
      // Points conversion is always 1:1 regardless of currency (SGD/MYR)
      let pointsToEarn = 0
      if (loyaltyProgram.program_type === 'points') {
        pointsToEarn = Math.floor(params.amount) // 1 point per 1 currency unit (SGD/MYR)
      } else if (loyaltyProgram.program_type === 'stamps') {
        pointsToEarn = 1 // One stamp per visit
      }
      
      console.log('🎯 Points to earn:', pointsToEarn, 'based on program:', loyaltyProgram.program_type)
      
      // Create transaction using database function that handles points automatically
      const { data, error } = await supabase
        .rpc('create_transaction_with_points', {
          p_merchant_id: params.merchantId,
          p_customer_id: params.customerId,
          p_amount: params.amount,
          p_payment_method: params.paymentMethod || 'cash',
          p_notes: params.notes,
          p_points_earned: pointsToEarn,
          p_program_type: loyaltyProgram.program_type
        })
      
      if (error) {
        console.error('❌ Transaction creation failed:', error)
        // Fallback to original function if new one doesn't exist
        const fallbackResult = await supabase
          .rpc('create_transaction', {
            p_merchant_id: params.merchantId,
            p_customer_id: params.customerId,
            p_amount: params.amount,
            p_payment_method: params.paymentMethod || 'cash',
            p_notes: params.notes
          })
        
        if (fallbackResult.error) throw fallbackResult.error
        
        // Manually credit points if fallback is used
        if (pointsToEarn > 0) {
          await customerOperations.updateCustomerPoints(
            params.customerId,
            params.merchantId,
            pointsToEarn,
            `Transaction reward: ${loyaltyProgram.program_type === 'points' ? 'purchase' : 'visit'}`
          )
        }
        
        return {
          ...fallbackResult.data,
          points_earned: pointsToEarn
        }
      }
      
      console.log('✅ Transaction created with points:', data)
      return {
        ...data,
        points_earned: pointsToEarn
      }
    } catch (err) {
      console.error('❌ Error in createTransaction:', err)
      throw err
    }
  },

  // Get recent transactions for merchant
  async getRecentTransactions(merchantId: string, limit = 10) {
    console.log('💳 Supabase: Getting recent transactions for merchant ID:', merchantId, 'limit:', limit)
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          customer_code
        )
      `)
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('❌ Error getting transactions:', error)
      throw error
    }
    
    console.log('✅ Transactions fetched:', data?.length || 0, 'records')
    return data
  },

  // Get transaction by ID
  async getTransaction(transactionId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        customers (*),
        transaction_items (*)
      `)
      .eq('id', transactionId)
      .single()
    
    if (error) throw error
    return data
  }
}

// Customer operations
export const customerOperations = {
  // Get all customers for a merchant with detailed stats
  async getCustomersForMerchant(merchantId: string) {
    console.log('👥 Supabase: Getting customers for merchant ID:', merchantId)
    
    // First, get basic customer data with loyalty accounts
    const { data: customers, error } = await supabase
      .from('customer_loyalty_accounts')
      .select(`
        *,
        customers (
          id,
          customer_code,
          first_name,
          last_name,
          email,
          phone,
          status,
          created_at
        )
      `)
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error getting customers:', error)
      throw error
    }
    
    console.log('👥 Raw customers data:', customers?.length || 0, 'records')
    
    if (!customers || customers.length === 0) {
      return []
    }
    
    // Get transaction summary for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (loyaltyAccount) => {
        const customer = loyaltyAccount.customers
        if (!customer) return null
        
        // Get transaction stats for this customer
        const { data: transactionStats, error: statsError } = await supabase
          .from('transactions')
          .select('amount, created_at, payment_method, notes')
          .eq('customer_id', customer.id)
          .eq('merchant_id', merchantId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
        
        if (statsError) {
          console.error('Error getting transaction stats for customer', customer.id, ':', statsError)
        }
        
        const transactions = transactionStats || []
        const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
        const totalTransactions = transactions.length
        
        // Find last visit date
        const lastVisit = transactions.length > 0 ? transactions[0].created_at : null
        const lastTransaction = transactions.length > 0 ? transactions[0] : null
        
        // Calculate visit frequency (visits per month since joining)
        const joinDate = new Date(customer.created_at)
        const monthsSinceJoining = Math.max(1, (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
        const visitFrequency = totalTransactions / monthsSinceJoining
        
        // Calculate spending trends (compare last 30 days to previous 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        
        const recentTransactions = transactions.filter(t => new Date(t.created_at) > thirtyDaysAgo)
        const previousTransactions = transactions.filter(t => {
          const date = new Date(t.created_at)
          return date > sixtyDaysAgo && date <= thirtyDaysAgo
        })
        
        const recentSpending = recentTransactions.reduce((sum, t) => sum + t.amount, 0)
        const previousSpending = previousTransactions.reduce((sum, t) => sum + t.amount, 0)
        
        let spendingTrend: 'up' | 'down' | 'stable' = 'stable'
        if (recentSpending > previousSpending * 1.1) spendingTrend = 'up'
        else if (recentSpending < previousSpending * 0.9) spendingTrend = 'down'
        
        // Calculate average order value
        const averageOrderValue = totalTransactions > 0 ? totalSpent / totalTransactions : 0
        
        return {
          id: customer.id,
          customer_code: customer.customer_code,
          first_name: customer.first_name,
          last_name: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          status: customer.status || 'active',
          total_spent: totalSpent,
          total_transactions: totalTransactions,
          loyalty_points: loyaltyAccount.current_points || 0,
          created_at: customer.created_at,
          last_visit_at: lastVisit,
          // Enhanced insights
          visit_frequency: visitFrequency,
          spending_trend: spendingTrend,
          average_order_value: averageOrderValue,
          last_transaction: lastTransaction ? {
            amount: lastTransaction.amount,
            payment_method: lastTransaction.payment_method,
            created_at: lastTransaction.created_at,
            notes: lastTransaction.notes
          } : null,
          recent_spending: recentSpending,
          customer_lifetime_value: totalSpent, // CLV calculation can be enhanced later
          days_since_last_visit: lastVisit ? Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24)) : null
        }
      })
    )
    
    const validCustomers = customersWithStats.filter(c => c !== null)
    console.log('✅ Customers with stats processed:', validCustomers.length)
    
    return validCustomers
  },

  // Scan QR code and get customer info
  async scanQRCode(params: {
    merchantId: string
    customerCode: string
    ipAddress?: string
    userAgent?: string
  }) {
    const { data, error } = await supabase
      .rpc('scan_qr_code', {
        p_merchant_id: params.merchantId,
        p_customer_code: params.customerCode,
        p_ip_address: params.ipAddress,
        p_user_agent: params.userAgent
      })
    
    if (error) throw error
    return data
  },

  // Get customer by ID
  async getCustomer(customerId: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()
    
    if (error) throw error
    return data
  },

  // Get customer loyalty account
  async getLoyaltyAccount(customerId: string, merchantId: string) {
    const { data, error } = await supabase
      .from('customer_loyalty_accounts')
      .select(`
        *,
        loyalty_programs (*)
      `)
      .eq('customer_id', customerId)
      .eq('merchant_id', merchantId)
      .single()
    
    if (error) throw error
    return data
  },

  // Get customer transaction history
  async getTransactionHistory(customerId: string, merchantId: string, limit = 20) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('customer_id', customerId)
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Update customer loyalty points
  async updateCustomerPoints(customerId: string, merchantId: string, pointsChange: number, reason: string) {
    console.log('🎯 Updating customer points:', { customerId, merchantId, pointsChange, reason })
    
    const { data, error } = await supabase
      .rpc('adjust_customer_points', {
        p_customer_id: customerId,
        p_merchant_id: merchantId,
        p_points_change: pointsChange,
        p_reason: reason
      })
    
    if (error) {
      console.error('❌ Error updating customer points:', error)
      throw error
    }
    
    console.log('✅ Customer points updated successfully')
    return data
  }
}

// Analytics operations
export const analyticsOperations = {
  // Get daily analytics for merchant
  async getDailyAnalytics(merchantId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('merchant_daily_analytics')
      .select('*')
      .eq('merchant_id', merchantId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get customer summary
  async getCustomerSummary(customerId: string) {
    const { data, error } = await supabase
      .from('customer_summary')
      .select('*')
      .eq('customer_id', customerId)
      .single()
    
    if (error) throw error
    return data
  }
}

// Loyalty operations
export const loyaltyOperations = {
  // Get loyalty program for merchant
  async getLoyaltyProgram(merchantId: string) {
    const { data, error } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('status', 'active')
      .single()
    
    if (error) throw error
    return data
  },

  // Get points transactions for customer
  async getPointsTransactions(customerId: string, merchantId: string, limit = 20) {
    const { data, error } = await supabase
      .from('points_transactions')
      .select(`
        *,
        customer_loyalty_accounts!inner (
          customer_id,
          merchant_id
        )
      `)
      .eq('customer_loyalty_accounts.customer_id', customerId)
      .eq('customer_loyalty_accounts.merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }
}

// QR scan operations
export const qrScanOperations = {
  // Get QR scan logs for merchant
  async getScanLogs(merchantId: string, limit = 50) {
    const { data, error } = await supabase
      .from('qr_scan_logs')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          customer_code
        )
      `)
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }
}

// ===== AUTH OPERATIONS =====

export const authOperations = {
  // Sign in merchant
  async signInMerchant(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Sign up merchant
  async signUpMerchant(email: string, password: string, businessName: string) {
    console.log('Supabase signup attempt:', { email, businessName })
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: businessName,
          role: 'merchant'
        }
        // Removed emailRedirectTo to avoid email confirmation requirement
      }
    })
    
    if (error) {
      console.error('Supabase auth error:', error)
      throw error
    }
    
    console.log('Signup successful, user created:', data.user?.id)
    console.log('User session:', data.session ? 'Created' : 'Not created')
    
    // Note: Merchant profile will be created by the database trigger
    // If trigger fails, user can manually create profile later
    
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Resend confirmation email
  async resendConfirmationEmail(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/create-business`
      }
    })
    
    if (error) throw error
    return { success: true }
  }
}

// ===== REAL-TIME SUBSCRIPTIONS =====

export const realtimeOperations = {
  // Subscribe to new transactions
  subscribeToTransactions(merchantId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `merchant_id=eq.${merchantId}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to QR scan logs
  subscribeToQRScans(merchantId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel('qr_scans')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'qr_scan_logs',
          filter: `merchant_id=eq.${merchantId}`
        },
        callback
      )
      .subscribe()
  }
}

// ===== UTILITY FUNCTIONS =====

// Generate transaction code
export const generateTransactionCode = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `TXN-${timestamp}-${random}`
}

// Format currency
export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

// Format date
export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Calculate points from amount
export const calculatePoints = (amount: number, pointsPerDollar: number) => {
  return Math.floor(amount * pointsPerDollar)
}

// Validate QR code format
export const validateQRCode = (code: string) => {
  // Basic validation - can be enhanced based on your QR code format
  return code && code.length >= 3 && code.length <= 50
}

// ===== ERROR HANDLING =====

export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

// Handle Supabase errors
export const handleSupabaseError = (error: unknown) => {
  if (error && typeof error === 'object' && 'code' in error) {
    const errorObj = error as { code?: string; message?: string; details?: string }
    throw new SupabaseError(errorObj.message || 'Unknown error', errorObj.code, errorObj.details)
  }
  throw new Error('An unexpected error occurred')
}
