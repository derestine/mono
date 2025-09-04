'use client'

import { useThemeStore } from '@/stores/theme'
import { useAuth } from '@/contexts/AuthContext'
import { useMerchant, MerchantProvider } from '@/contexts/MerchantContext'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input } from '@/components/ui'
import { Heading, Text } from '@/components/ui'
import { Moon, Sun, Users, Search, ArrowLeft, LogOut, Loader2, Eye, Edit, DollarSign, Plus, Minus, Filter, Download, ChevronDown, SortAsc, SortDesc, TrendingUp, TrendingDown, Minus as TrendingFlat, Crown, Star, Clock, Calendar, CreditCard } from 'lucide-react'
import { customerOperations } from '@/lib/supabase'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

function CustomersPageContent() {
  const { theme, toggleTheme } = useThemeStore()
  const { user, signOut } = useAuth()
  const { merchant, customers, loading, error, refreshCustomers } = useMerchant()
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pointsAdjustment, setPointsAdjustment] = useState<string>('')
  const [adjustmentReason, setAdjustmentReason] = useState<string>('')
  const [isProcessingPoints, setIsProcessingPoints] = useState(false)
  
  // Sorting and filtering states
  const [sortBy, setSortBy] = useState<'name' | 'total_spent' | 'loyalty_points' | 'last_visit' | 'created_at'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [spendingFilter, setSpendingFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const router = useRouter()

  // Helper functions for customer insights
  const getCustomerSegment = (customer: Customer, averageSpending: number) => {
    if (customer.total_spent > averageSpending * 2.5) return 'VIP'
    if (customer.total_spent > averageSpending * 1.2) return 'Regular'
    if (customer.days_since_last_visit === null || customer.days_since_last_visit === undefined || customer.days_since_last_visit > 90) return 'Inactive'
    if (new Date(customer.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) return 'New'
    return 'Regular'
  }

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'VIP': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Regular': return 'bg-blue-100 text-blue-700 border-blue-200'  
      case 'New': return 'bg-green-100 text-green-700 border-green-200'
      case 'Inactive': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'VIP': return <Crown className="w-3 h-3" />
      case 'Regular': return <Star className="w-3 h-3" />
      case 'New': return <Users className="w-3 h-3" />
      case 'Inactive': return <Clock className="w-3 h-3" />
      default: return <Users className="w-3 h-3" />
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />
      default: return <TrendingFlat className="w-4 h-4 text-gray-500" />
    }
  }

  const formatVisitFrequency = (frequency?: number) => {
    if (!frequency) return 'No visits'
    if (frequency >= 1) return `${frequency.toFixed(1)}/month`
    if (frequency >= 0.25) return `${(frequency * 4).toFixed(1)}/week`
    return 'Infrequent'
  }

  // Apply filters, search, and sorting
  useEffect(() => {
    let result = [...customers]
    
    // Apply search filter
    if (searchTerm.trim()) {
      result = result.filter(customer =>
        customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_code?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(customer => customer.status === statusFilter)
    }
    
    // Apply spending filter
    if (spendingFilter !== 'all') {
      const avgSpending = customers.length > 0 
        ? customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length 
        : 0
      
      result = result.filter(customer => {
        if (spendingFilter === 'high') return customer.total_spent > avgSpending * 1.5
        if (spendingFilter === 'medium') return customer.total_spent >= avgSpending * 0.5 && customer.total_spent <= avgSpending * 1.5
        if (spendingFilter === 'low') return customer.total_spent < avgSpending * 0.5
        return true
      })
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase()
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase()
          break
        case 'total_spent':
          aValue = a.total_spent
          bValue = b.total_spent
          break
        case 'loyalty_points':
          aValue = a.loyalty_points
          bValue = b.loyalty_points
          break
        case 'last_visit':
          aValue = a.last_visit_at ? new Date(a.last_visit_at).getTime() : 0
          bValue = b.last_visit_at ? new Date(b.last_visit_at).getTime() : 0
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          aValue = 0
          bValue = 0
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
    
    setFilteredCustomers(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [customers, searchTerm, statusFilter, spendingFilter, sortBy, sortOrder])

  // Calculate pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  // CSV Export functionality
  const handleExportCSV = () => {
    const headers = [
      'Customer Code',
      'First Name', 
      'Last Name',
      'Email',
      'Phone',
      'Status',
      'Total Spent',
      'Total Transactions',
      'Loyalty Points',
      'Created At',
      'Last Visit'
    ]
    
    const csvData = filteredCustomers.map(customer => [
      customer.customer_code,
      customer.first_name,
      customer.last_name,
      customer.email || '',
      customer.phone || '',
      customer.status,
      customer.total_spent.toFixed(2),
      customer.total_transactions,
      customer.loyalty_points,
      new Date(customer.created_at).toLocaleDateString(),
      customer.last_visit_at ? new Date(customer.last_visit_at).toLocaleDateString() : 'Never'
    ])
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedCustomers.size === filteredCustomers.length) {
      setSelectedCustomers(new Set())
    } else {
      setSelectedCustomers(new Set(filteredCustomers.map(c => c.id)))
    }
  }

  const handleSelectCustomer = (customerId: string) => {
    const newSelection = new Set(selectedCustomers)
    if (newSelection.has(customerId)) {
      newSelection.delete(customerId)
    } else {
      newSelection.add(customerId)
    }
    setSelectedCustomers(newSelection)
  }

  // Customer status management
  const handleStatusChange = async (customerId: string, newStatus: 'active' | 'inactive') => {
    try {
      // This would need to be implemented in Supabase operations
      // For now, we'll show a placeholder
      console.log(`Changing customer ${customerId} status to ${newStatus}`)
      alert(`Status change functionality would update customer status to ${newStatus}`)
      await refreshCustomers()
    } catch (error) {
      console.error('Error updating customer status:', error)
      alert('Error updating customer status')
    }
  }

  // Bulk status change
  const handleBulkStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (selectedCustomers.size === 0) return
    
    try {
      const customerIds = Array.from(selectedCustomers)
      console.log(`Bulk updating ${customerIds.length} customers to ${newStatus}`)
      alert(`Bulk status change would update ${customerIds.length} customers to ${newStatus}`)
      setSelectedCustomers(new Set())
      await refreshCustomers()
    } catch (error) {
      console.error('Error bulk updating customer status:', error)
      alert('Error updating customer statuses')
    }
  }

  // Check authentication
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth')
    }
  }, [user, loading, router])

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsModalOpen(true)
    // Reset point adjustment form
    setPointsAdjustment('')
    setAdjustmentReason('')
  }

  const handlePointsAdjustment = async (isAdd: boolean) => {
    if (!selectedCustomer || !merchant || !pointsAdjustment.trim()) return
    
    const points = parseInt(pointsAdjustment)
    if (isNaN(points) || points <= 0) {
      alert('Please enter a valid number of points')
      return
    }

    const adjustmentValue = isAdd ? points : -points
    const reason = adjustmentReason.trim() || (isAdd ? 'Manual points addition' : 'Manual points deduction')
    
    setIsProcessingPoints(true)
    try {
      await customerOperations.updateCustomerPoints(
        selectedCustomer.id,
        merchant.id,
        adjustmentValue,
        reason
      )
      
      // Refresh customer data
      await refreshCustomers()
      
      // Update the selected customer with new points
      const updatedCustomer = customers.find(c => c.id === selectedCustomer.id)
      if (updatedCustomer) {
        setSelectedCustomer(updatedCustomer)
      }
      
      // Reset form
      setPointsAdjustment('')
      setAdjustmentReason('')
      
      alert(`Successfully ${isAdd ? 'added' : 'deducted'} ${points} points`)
    } catch (error) {
      console.error('Error adjusting points:', error)
      alert('Error adjusting points. Please try again.')
    } finally {
      setIsProcessingPoints(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          <Text size="sm">Loading customers...</Text>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Text className="text-destructive">Error: {error}</Text>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-normal">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/merchant">
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <Heading as="h1" size="2xl" className="sm:text-3xl">
                  Customer Management
                </Heading>
                <Text variant="muted" size="sm">
                  View and manage your customers
                </Text>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={toggleTheme} variant="outline" size="sm" className="flex-shrink-0">
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
              <Button onClick={signOut} variant="outline" size="sm" className="flex-shrink-0">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Customer Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted">Total Customers</Text>
                    <Text size="lg" weight="semibold">
                      {filteredCustomers.length}
                    </Text>
                    <Text size="xs" variant="muted">
                      active customers
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted">Avg. Customer Value</Text>
                    <Text size="lg" weight="semibold">
                      ${customers.length > 0 ? (customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length).toFixed(2) : '0.00'}
                    </Text>
                    <Text size="xs" variant="muted">
                      per customer
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted">Total Revenue</Text>
                    <Text size="lg" weight="semibold">
                      ${customers.reduce((sum, c) => sum + c.total_spent, 0).toFixed(2)}
                    </Text>
                    <Text size="xs" variant="muted">
                      from all customers
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle>Customer Directory</CardTitle>
              <CardDescription>Search and manage your customers</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {/* Search, Filters, and Actions */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search customers by name, email, or customer code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2"
                    >
                      <Filter className="w-5 h-5" />
                      Filters
                      <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                      disabled={filteredCustomers.length === 0}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="p-4 bg-muted/30 rounded-lg border border-muted grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Text size="xs" variant="muted" className="mb-2">Sort By</Text>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full p-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="name">Name</option>
                        <option value="total_spent">Total Spent</option>
                        <option value="loyalty_points">Loyalty Points</option>
                        <option value="last_visit">Last Visit</option>
                        <option value="created_at">Join Date</option>
                      </select>
                    </div>
                    <div>
                      <Text size="xs" variant="muted" className="mb-2">Order</Text>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
                        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                      </Button>
                    </div>
                    <div>
                      <Text size="xs" variant="muted" className="mb-2">Status</Text>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full p-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <Text size="xs" variant="muted" className="mb-2">Spending Level</Text>
                      <select
                        value={spendingFilter}
                        onChange={(e) => setSpendingFilter(e.target.value as any)}
                        className="w-full p-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="all">All Levels</option>
                        <option value="high">High Spenders</option>
                        <option value="medium">Medium Spenders</option>
                        <option value="low">Low Spenders</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStatusFilter('all')
                          setSpendingFilter('all')
                          setSortBy('name')
                          setSortOrder('asc')
                          setSearchTerm('')
                        }}
                        className="text-sm"
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                )}

                {/* Bulk Actions Bar */}
                {selectedCustomers.size > 0 && (
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 flex items-center justify-between">
                    <Text size="sm" weight="medium" className="text-primary">
                      {selectedCustomers.size} customer{selectedCustomers.size > 1 ? 's' : ''} selected
                    </Text>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkStatusChange('active')}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        Mark Active
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkStatusChange('inactive')}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Mark Inactive
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCustomers(new Set())}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                )}

                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <Text size="xs" variant="muted">
                      Showing {filteredCustomers.length} of {customers.length} customers
                    </Text>
                    {filteredCustomers.length > 0 && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-input"
                        />
                        <Text size="xs" variant="muted">Select all</Text>
                      </label>
                    )}
                  </div>
                  {filteredCustomers.length !== customers.length && (
                    <Text size="xs" variant="muted">
                      Filtered results
                    </Text>
                  )}
                </div>
              </div>

              {/* Customer List */}
              <div className="space-y-3">
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors ${
                        selectedCustomers.has(customer.id) ? 'ring-2 ring-primary/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.has(customer.id)}
                          onChange={() => handleSelectCustomer(customer.id)}
                          className="rounded border-input flex-shrink-0"
                        />
                        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Text size="sm" weight="medium" className="truncate">
                              {customer.first_name} {customer.last_name}
                            </Text>
                            <button
                              onClick={() => handleStatusChange(customer.id, customer.status === 'active' ? 'inactive' : 'active')}
                              className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                                customer.status === 'active'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              {customer.status}
                            </button>
                            {(() => {
                              const avgSpending = customers.length > 0 ? customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length : 0
                              const segment = getCustomerSegment(customer, avgSpending)
                              return (
                                <span className={`text-xs px-2 py-1 rounded-md font-medium border flex items-center gap-1 ${getSegmentColor(segment)}`}>
                                  {getSegmentIcon(segment)}
                                  {segment}
                                </span>
                              )
                            })()}
                            <div className="flex items-center gap-1" title={`Spending trend: ${customer.spending_trend || 'stable'}`}>
                              {getTrendIcon(customer.spending_trend)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Text size="xs" variant="muted">
                              {customer.email || 'No email'}
                            </Text>
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                              {customer.customer_code}
                            </span>
                            {customer.visit_frequency && (
                              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatVisitFrequency(customer.visit_frequency)}
                              </span>
                            )}
                            {customer.last_transaction && (
                              <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-md flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                Last: ${customer.last_transaction.amount.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                        <div className="text-right">
                          <Text size="xs" variant="muted">CLV</Text>
                          <Text size="sm" weight="semibold" className="text-primary">
                            ${(customer.customer_lifetime_value || customer.total_spent).toFixed(2)}
                          </Text>
                        </div>
                        <div className="text-right">
                          <Text size="xs" variant="muted">Avg Order</Text>
                          <Text size="sm" weight="semibold">
                            ${(customer.average_order_value || 0).toFixed(2)}
                          </Text>
                        </div>
                        <div className="text-right">
                          <Text size="xs" variant="muted">Points</Text>
                          <Text size="sm" weight="semibold">
                            {customer.loyalty_points}
                          </Text>
                        </div>
                        <div className="text-right">
                          <Text size="xs" variant="muted">Last Visit</Text>
                          <Text size="sm" weight="semibold">
                            {customer.days_since_last_visit !== null 
                              ? customer.days_since_last_visit === 0 
                                ? 'Today' 
                                : `${customer.days_since_last_visit}d ago`
                              : 'Never'
                            }
                          </Text>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-muted/30 rounded-lg border-2 border-dashed border-muted">
                    <Users className="w-6 h-6 mx-auto text-muted-foreground mb-3" />
                    <Text weight="medium" size="sm" className="mb-1">
                      {searchTerm ? 'No customers found' : 'No customers yet'}
                    </Text>
                    <Text size="xs" variant="muted">
                      {searchTerm ? 'Try adjusting your search terms' : 'Customers will appear here as they make purchases'}
                    </Text>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Text size="xs" variant="muted">
                      Page {currentPage} of {totalPages} ({startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length})
                    </Text>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Heading size="lg">{selectedCustomer.first_name} {selectedCustomer.last_name}</Heading>
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Customer Info Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Text size="xs" variant="muted">Customer Code</Text>
                    <Text size="sm" weight="medium">{selectedCustomer.customer_code}</Text>
                  </div>
                  <div>
                    <Text size="xs" variant="muted">Status</Text>
                    <Text size="sm" weight="medium">{selectedCustomer.status}</Text>
                  </div>
                  <div>
                    <Text size="xs" variant="muted">Customer Segment</Text>
                    {(() => {
                      const avgSpending = customers.length > 0 ? customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length : 0
                      const segment = getCustomerSegment(selectedCustomer, avgSpending)
                      return (
                        <div className="flex items-center gap-1">
                          <span className={`text-xs px-2 py-1 rounded-md font-medium border flex items-center gap-1 ${getSegmentColor(segment)}`}>
                            {getSegmentIcon(segment)}
                            {segment}
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                  <div>
                    <Text size="xs" variant="muted">Email</Text>
                    <Text size="sm" weight="medium">{selectedCustomer.email || 'Not provided'}</Text>
                  </div>
                  <div>
                    <Text size="xs" variant="muted">Phone</Text>
                    <Text size="sm" weight="medium">{selectedCustomer.phone || 'Not provided'}</Text>
                  </div>
                  <div>
                    <Text size="xs" variant="muted">Member Since</Text>
                    <Text size="sm" weight="medium">{new Date(selectedCustomer.created_at).toLocaleDateString()}</Text>
                  </div>
                </div>

                {/* Customer Metrics */}
                <div className="border-t pt-4">
                  <Heading size="lg" className="mb-4">Customer Metrics</Heading>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <Text size="xs" variant="muted">Total Spent</Text>
                      <Text size="lg" weight="semibold" className="text-primary">${selectedCustomer.total_spent.toFixed(2)}</Text>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Text size="xs" variant="muted">Avg Order Value</Text>
                      <Text size="lg" weight="semibold" className="text-blue-700">${(selectedCustomer.average_order_value || 0).toFixed(2)}</Text>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Text size="xs" variant="muted">Visit Frequency</Text>
                      <Text size="lg" weight="semibold" className="text-green-700">{formatVisitFrequency(selectedCustomer.visit_frequency)}</Text>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <Text size="xs" variant="muted">Customer Lifetime Value</Text>
                      <Text size="lg" weight="semibold" className="text-purple-700">${(selectedCustomer.customer_lifetime_value || selectedCustomer.total_spent).toFixed(2)}</Text>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                {selectedCustomer.last_transaction && (
                  <div className="border-t pt-4">
                    <Heading size="lg" className="mb-4">Recent Activity</Heading>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <Text size="sm" weight="medium">Last Transaction</Text>
                          <Text size="xs" variant="muted">
                            {new Date(selectedCustomer.last_transaction.created_at).toLocaleDateString()} at{' '}
                            {new Date(selectedCustomer.last_transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </div>
                        <div className="text-right">
                          <Text size="sm" weight="semibold" className="text-primary">
                            ${selectedCustomer.last_transaction.amount.toFixed(2)}
                          </Text>
                          <Text size="xs" variant="muted">
                            {selectedCustomer.last_transaction.payment_method}
                          </Text>
                        </div>
                      </div>
                      {selectedCustomer.last_transaction.notes && (
                        <Text size="xs" variant="muted" className="mt-2">
                          Note: {selectedCustomer.last_transaction.notes}
                        </Text>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Text size="xs" variant="muted">Spending Trend:</Text>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(selectedCustomer.spending_trend)}
                          <Text size="xs" variant="muted">
                            {selectedCustomer.spending_trend === 'up' ? 'Increasing' :
                             selectedCustomer.spending_trend === 'down' ? 'Decreasing' : 'Stable'}
                          </Text>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Text size="xs" variant="muted">Last Visit:</Text>
                        <Text size="xs" weight="medium">
                          {selectedCustomer.days_since_last_visit !== null 
                            ? selectedCustomer.days_since_last_visit === 0 
                              ? 'Today' 
                              : `${selectedCustomer.days_since_last_visit} days ago`
                            : 'Never'
                          }
                        </Text>
                      </div>
                    </div>
                  </div>
                )}

                {/* Points Adjustment Section */}
                <div className="border-t pt-4">
                  <Heading size="lg" className="mb-4">Adjust Loyalty Points</Heading>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text size="xs" variant="muted" className="mb-2">Points to Adjust</Text>
                        <Input
                          type="number"
                          placeholder="Enter points..."
                          value={pointsAdjustment}
                          onChange={(e) => setPointsAdjustment(e.target.value)}
                          min="1"
                          disabled={isProcessingPoints}
                        />
                      </div>
                      <div>
                        <Text size="xs" variant="muted" className="mb-2">Reason (Optional)</Text>
                        <Input
                          type="text"
                          placeholder="Adjustment reason..."
                          value={adjustmentReason}
                          onChange={(e) => setAdjustmentReason(e.target.value)}
                          disabled={isProcessingPoints}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handlePointsAdjustment(true)}
                        disabled={!pointsAdjustment.trim() || isProcessingPoints}
                        className="flex items-center gap-2"
                      >
                        {isProcessingPoints ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                        Add Points
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePointsAdjustment(false)}
                        disabled={!pointsAdjustment.trim() || isProcessingPoints}
                        className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        {isProcessingPoints ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Minus className="w-5 h-5" />
                        )}
                        Deduct Points
                      </Button>
                    </div>
                    <Text size="xs" variant="muted">
                      Current balance: <span className="text-primary font-medium">{selectedCustomer.loyalty_points} points</span>
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CustomersPage() {
  return (
    <MerchantProvider>
      <CustomersPageContent />
    </MerchantProvider>
  )
}