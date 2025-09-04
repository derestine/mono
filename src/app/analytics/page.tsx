'use client'

import { useThemeStore } from '@/stores/theme'
import { useAuth } from '@/contexts/AuthContext'
import { useMerchant, MerchantProvider } from '@/contexts/MerchantContext'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { Heading, Text } from '@/components/ui'
import { Moon, Sun, ArrowLeft, LogOut, Loader2, TrendingUp, DollarSign, Users, Calendar, Star, Trophy, Clock } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

function AnalyticsPageContent() {
  const { theme, toggleTheme } = useThemeStore()
  const { user, signOut } = useAuth()
  const { merchant, dashboard, transactions, loading, error } = useMerchant()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Calculate analytics data based on time range
  const analyticsData = useMemo(() => {
    if (!transactions.length) return null

    const now = new Date()
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    const filteredTransactions = transactions.filter(t => 
      new Date(t.created_at) >= startDate
    )

    // Group transactions by date
    const transactionsByDate = filteredTransactions.reduce((acc, t) => {
      const date = new Date(t.created_at).toDateString()
      if (!acc[date]) {
        acc[date] = { count: 0, total: 0, customers: new Set() }
      }
      acc[date].count += 1
      acc[date].total += t.amount
      acc[date].customers.add(t.customer_id)
      return acc
    }, {} as Record<string, { count: number; total: number; customers: Set<string> }>)

    // Calculate daily averages
    const dates = Object.keys(transactionsByDate)
    const avgDailyTransactions = dates.length > 0 ? filteredTransactions.length / Math.max(dates.length, 1) : 0
    const avgDailySales = dates.length > 0 ? filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / Math.max(dates.length, 1) : 0

    // Top customers
    const customerTotals = filteredTransactions.reduce((acc, t) => {
      const customerId = t.customer_id
      const customerName = t.customers ? `${t.customers.first_name} ${t.customers.last_name}` : `Customer ${customerId.slice(0, 8)}...`
      if (!acc[customerId]) {
        acc[customerId] = { name: customerName, total: 0, visits: 0 }
      }
      acc[customerId].total += t.amount
      acc[customerId].visits += 1
      return acc
    }, {} as Record<string, { name: string; total: number; visits: number }>)

    const topCustomers = Object.entries(customerTotals)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    // Recent trends (last 7 days for daily chart)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      return date.toDateString()
    }).reverse()

    const dailyData = last7Days.map(date => {
      const data = transactionsByDate[date] || { count: 0, total: 0, customers: new Set() }
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        transactions: data.count,
        sales: data.total,
        customers: data.customers.size
      }
    })

    return {
      filteredTransactions,
      totalSales: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
      totalTransactions: filteredTransactions.length,
      uniqueCustomers: new Set(filteredTransactions.map(t => t.customer_id)).size,
      avgDailyTransactions,
      avgDailySales,
      avgTransactionValue: filteredTransactions.length > 0 ? filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length : 0,
      topCustomers,
      dailyData
    }
  }, [transactions, timeRange])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          <Text size="sm">Loading analytics...</Text>
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 transition-all duration-300">
        <div className="max-w-4xl mx-auto space-y-6">
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
                <Heading as="h1" size="xl">
                  Analytics
                </Heading>
                <Text variant="muted" size="sm">
                  Business insights and performance
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

          {/* Time Range Selector */}
          <div className="flex items-center justify-end">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {[
                { key: '7d', label: '7d' },
                { key: '30d', label: '30d' },
                { key: '90d', label: '90d' }
              ].map((period) => (
                <button
                  key={period.key}
                  onClick={() => setTimeRange(period.key as any)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === period.key 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {analyticsData ? (
            <>
              {/* Key Metrics Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <DollarSign className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <Text size="sm" variant="muted">Total Sales</Text>
                        <Text size="lg" weight="bold">
                          ${analyticsData.totalSales.toFixed(2)}
                        </Text>
                        <Text size="xs" variant="muted">
                          Avg: ${analyticsData.avgDailySales.toFixed(2)}/day
                        </Text>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <Text size="sm" variant="muted">Transactions</Text>
                        <Text size="lg" weight="bold">
                          {analyticsData.totalTransactions}
                        </Text>
                        <Text size="xs" variant="muted">
                          Avg: {analyticsData.avgDailyTransactions.toFixed(1)}/day
                        </Text>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <Text size="sm" variant="muted">Customers</Text>
                        <Text size="lg" weight="bold">
                          {analyticsData.uniqueCustomers}
                        </Text>
                        <Text size="xs" variant="muted">
                          unique customers
                        </Text>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <Star className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <Text size="sm" variant="muted">Avg. Sale</Text>
                        <Text size="lg" weight="bold">
                          ${analyticsData.avgTransactionValue.toFixed(2)}
                        </Text>
                        <Text size="xs" variant="muted">
                          per transaction
                        </Text>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    7-Day Trend
                  </CardTitle>
                  <CardDescription>Daily sales and transaction patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.dailyData.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-16">
                            <Text size="sm" weight="medium">{day.date}</Text>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <Text size="sm">${day.sales.toFixed(2)}</Text>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <Text size="sm">{day.transactions} transactions</Text>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <Text size="sm">{day.customers} customers</Text>
                            </div>
                          </div>
                        </div>
                        {/* Simple bar visualization */}
                        <div className="flex items-end gap-1 h-8">
                          <div 
                            className="bg-green-500 w-2 rounded-sm" 
                            style={{ height: `${Math.max(4, (day.sales / Math.max(...analyticsData.dailyData.map(d => d.sales))) * 32)}px` }}
                          ></div>
                          <div 
                            className="bg-blue-500 w-2 rounded-sm" 
                            style={{ height: `${Math.max(4, (day.transactions / Math.max(...analyticsData.dailyData.map(d => d.transactions))) * 32)}px` }}
                          ></div>
                          <div 
                            className="bg-purple-500 w-2 rounded-sm" 
                            style={{ height: `${Math.max(4, (day.customers / Math.max(...analyticsData.dailyData.map(d => d.customers))) * 32)}px` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Top Customers
                  </CardTitle>
                  <CardDescription>Your most valuable customers in the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topCustomers.length > 0 ? (
                      analyticsData.topCustomers.map((customer, index) => (
                        <div key={customer.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Text size="sm" weight="bold" className="text-primary">
                                {index + 1}
                              </Text>
                            </div>
                            <div>
                              <Text size="sm" weight="medium">{customer.name}</Text>
                              <Text size="xs" variant="muted">
                                {customer.visits} visits
                              </Text>
                            </div>
                          </div>
                          <Text size="sm" weight="semibold" className="text-primary">
                            ${customer.total.toFixed(2)}
                          </Text>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-muted/30 rounded-lg">
                        <Trophy className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                        <Text weight="medium" size="sm" className="mb-1">No customer data</Text>
                        <Text size="xs" variant="muted">
                          Customer data will appear once you have transactions
                        </Text>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* No Data State */
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto">
                    <TrendingUp className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <Text size="lg" weight="semibold" className="mb-2">No Analytics Data</Text>
                    <Text size="sm" variant="muted" className="max-w-md mx-auto">
                      Start processing transactions to see your business analytics. Scan customer QR codes to begin collecting data.
                    </Text>
                  </div>
                  <Link href="/merchant">
                    <Button className="mt-4">
                      Go to Merchant Portal
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <MerchantProvider>
      <AnalyticsPageContent />
    </MerchantProvider>
  )
}