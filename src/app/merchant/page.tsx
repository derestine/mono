'use client'

import { useThemeStore } from '@/stores/theme'
import { useAuth } from '@/contexts/AuthContext'
import { useMerchant, MerchantProvider } from '@/contexts/MerchantContext'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, QRScanner, SpendModal, ClearCookiesButton } from '@/components/ui'
import { Heading, Text } from '@/components/ui'
import { Moon, Sun, Store, Users, DollarSign, TrendingUp, ArrowLeft, QrCode, LogOut, Loader2, Building, Settings } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MerchantProfileSetup } from '@/components/auth/MerchantProfileSetup'

function MerchantPageContent() {
  const { theme, toggleTheme } = useThemeStore()
  const { user, signOut } = useAuth()
  const { 
    merchant, 
    dashboard, 
    transactions, 
    loyaltyProgram,
    loading, 
    error,
    createTransaction,
    scanQRCode,
    refreshDashboard,
    refreshTransactions
  } = useMerchant()
  
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false)
  const [isSpendModalOpen, setIsSpendModalOpen] = useState(false)
  const [scannedCustomerId, setScannedCustomerId] = useState('')
  const [scannedCustomerName, setScannedCustomerName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

    const handleQRScan = async (customerCode: string) => {
    setIsProcessing(true)
    try {
      const result = await scanQRCode(customerCode)
      if (result.success) {
        setScannedCustomerId(result.customer_id)
        setScannedCustomerName(result.customer_name)
        setIsQRScannerOpen(false) // Close scanner on success
        setIsSpendModalOpen(true)
      } else {
        // Handle error - could show a toast notification
        console.error('QR scan failed:', result.error_message)
        // Keep scanner open for retry
        alert(`Scan failed: ${result.error_message || 'Customer not found'}`)
      }
    } catch (error) {
      console.error('Error scanning QR code:', error)
      alert('Error scanning QR code. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSpendSubmit = async (customerId: string, amount: number) => {
    setIsProcessing(true)
    try {
      const result = await createTransaction({
        customerId,
        amount,
        paymentMethod: 'cash',
        notes: 'QR code transaction'
      })

      if (result.success) {
        // Close modal first for immediate feedback
        setIsSpendModalOpen(false)
        setScannedCustomerId('')
        setScannedCustomerName('')
        
        // Enhanced success feedback with points earned
        const pointsEarned = result.pointsEarned || 0
        const programType = loyaltyProgram?.program_type || 'points'
        const pointsText = programType === 'stamps' ? 'stamp' : 'points'
        
        if (pointsEarned > 0) {
          alert(
            `🎉 Transaction successful!\n` +
            `💰 Amount: $${amount.toFixed(2)}\n` +
            `⭐ ${scannedCustomerName} earned ${pointsEarned} ${pointsEarned === 1 ? pointsText.slice(0, -1) : pointsText}!`
          )
        } else {
          alert(`Transaction successful! $${amount.toFixed(2)} recorded for ${scannedCustomerName}`)
        }
        
        // Data refresh is handled automatically by the createTransaction function
      } else {
        console.error('Transaction failed:', result.error)
        alert(`Transaction failed: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
      alert('Error processing transaction. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Check authentication
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          <Text size="sm">Loading merchant portal...</Text>
        </div>
      </div>
    )
  }


  // Show error state
  if (error) {
    // Check if this is a "profile not found" error
    if (error.includes('Merchant profile not found') || error.includes('No merchant profile found')) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <MerchantProfileSetup 
            onComplete={() => window.location.reload()} 
            userEmail={user?.email || ''}
          />
        </div>
      )
    }
    
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
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <Heading as="h1" size="2xl" className="sm:text-3xl">
                  {merchant?.business_name || 'Merchant Portal'}
                </Heading>
                <div className="flex items-center gap-3">
                  <Text variant="muted" size="sm">
                    {merchant?.business_email || 'Manage your business operations'}
                  </Text>
                  {loyaltyProgram && (
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      {loyaltyProgram.program_type === 'points' 
                        ? `${loyaltyProgram.points_per_dollar}pt/$1`
                        : 'Stamp Program'
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ClearCookiesButton 
                variant="outline" 
                size="sm" 
                onClear={() => window.location.href = '/auth'}
              />
              <Button onClick={toggleTheme} variant="outline" size="sm" className="flex-shrink-0">
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
              <Link href="/business-settings">
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
              <Button onClick={signOut} variant="outline" size="sm" className="flex-shrink-0">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>


          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-0 bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted">Total Sales</Text>
                    <Text size="lg" weight="semibold">
                      ${dashboard?.total_sales?.toFixed(2) || '0.00'}
                    </Text>
                    {dashboard?.total_transactions ? (
                      <Text size="xs" variant="muted">
                        {dashboard.total_transactions} transactions
                      </Text>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-0 bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted">Customers</Text>
                    <Text size="lg" weight="semibold">
                      {dashboard?.unique_customers || 0}
                    </Text>
                    <Text size="xs" variant="muted">
                      {dashboard?.unique_customers === 1 ? 'unique customer' : 'unique customers'}
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-0 bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted">Avg. Sale</Text>
                    <Text size="lg" weight="semibold">
                      ${dashboard?.average_transaction_value?.toFixed(2) || '0.00'}
                    </Text>
                    <Text size="xs" variant="muted">
                      per transaction
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-0 bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted">Today</Text>
                    <Text size="lg" weight="semibold">
                      {transactions.filter(t => {
                        const today = new Date().toDateString()
                        return new Date(t.created_at).toDateString() === today
                      }).length}
                    </Text>
                    <Text size="xs" variant="muted">
                      transactions
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Actions */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/10">
            <CardHeader className="p-6">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks for managing your business</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Priority 1: Scan QR Code - Most important action */}
                <Button 
                  variant="outline" 
                  className="h-14 w-full justify-start gap-3 p-3 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all hover:scale-[1.02] duration-200"
                  onClick={() => setIsQRScannerOpen(true)}
                >
                  <QrCode className="w-5 h-5 flex-shrink-0 text-primary" />
                  <div className="text-left min-w-0 flex-1">
                    <Text weight="medium" className="text-sm text-foreground truncate">Scan QR Code</Text>
                    <Text size="xs" variant="muted" className="truncate">Process transaction</Text>
                  </div>
                </Button>

                {/* Priority 2: Manage Customers */}
                <Link href="/customers">
                  <Button 
                    variant="outline" 
                    className="h-14 w-full justify-start gap-3 p-3 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all hover:scale-[1.02] duration-200"
                  >
                    <Users className="w-5 h-5 flex-shrink-0 text-primary" />
                    <div className="text-left min-w-0 flex-1">
                      <Text weight="medium" className="text-sm text-foreground truncate">Customers</Text>
                      <Text size="xs" variant="muted" className="truncate">View directory</Text>
                    </div>
                  </Button>
                </Link>

                {/* Priority 3: Analytics */}
                <Link href="/analytics">
                  <Button 
                    variant="outline" 
                    className="h-14 w-full justify-start gap-3 p-3 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all hover:scale-[1.02] duration-200"
                  >
                    <TrendingUp className="w-5 h-5 flex-shrink-0 text-primary" />
                    <div className="text-left min-w-0 flex-1">
                      <Text weight="medium" className="text-sm text-foreground truncate">Analytics</Text>
                      <Text size="xs" variant="muted" className="truncate">View trends</Text>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions Section */}
          <Card id="transaction-history" className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/10">
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <QrCode className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>
                Your latest customer transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <Text weight="medium" size="base">Latest Activity</Text>
                     <Text size="xs" variant="muted">{transactions.length} total</Text>
                   </div>
                   
                   {transactions.length > 0 ? (
                     <div className="space-y-3 max-h-64 overflow-y-auto">
                       {transactions.slice(0, 8).map((transaction) => (
                         <div
                           key={transaction.id}
                           className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                         >
                           <div className="flex-1 min-w-0">
                             <Text size="sm" weight="medium" className="truncate">
                               {transaction.customers ? 
                                 `${transaction.customers.first_name} ${transaction.customers.last_name}` : 
                                 `Customer ${transaction.customer_id.slice(0, 8)}...`
                               }
                             </Text>
                             <div className="flex items-center gap-2 mt-2">
                               <Text size="xs" variant="muted">
                                 {new Date(transaction.created_at).toLocaleDateString()} at {new Date(transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </Text>
                               <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                                 {transaction.payment_method}
                               </span>
                             </div>
                           </div>
                           <div className="text-right ml-4">
                             <Text size="sm" weight="semibold" className="text-primary">
                               ${transaction.amount.toFixed(2)}
                             </Text>
                             <Text size="xs" variant="muted">
                               {transaction.status}
                             </Text>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="p-8 text-center bg-muted/30 rounded-lg border-2 border-dashed border-muted">
                       <DollarSign className="w-6 h-6 mx-auto text-muted-foreground mb-3" />
                       <Text weight="medium" size="sm" className="mb-1">No transactions yet</Text>
                       <Text size="xs" variant="muted">
                         Scan a customer QR code to create your first transaction
                       </Text>
                     </div>
                   )}
              </div>
            </CardContent>
          </Card>

          {/* Floating QR Scan Button */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-lg border">
              <Button 
                onClick={() => setIsQRScannerOpen(true)}
                disabled={isProcessing}
                className="flex items-center gap-2 px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <QrCode className="w-5 h-5" />
                )}
                {isProcessing ? 'Processing...' : 'Scan QR Code'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRScan}
      />

             {/* Spend Modal */}
       <SpendModal
         isOpen={isSpendModalOpen}
         onClose={() => setIsSpendModalOpen(false)}
         customerId={scannedCustomerId}
         customerName={scannedCustomerName}
         onSubmit={handleSpendSubmit}
         isProcessing={isProcessing}
       />
    </div>
  )
}

export default function MerchantPage() {
  return (
    <MerchantProvider>
      <MerchantPageContent />
    </MerchantProvider>
  )
}
