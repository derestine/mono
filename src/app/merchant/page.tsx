'use client'

import { useThemeStore } from '@/stores/theme'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, QRScanner, SpendModal } from '@/components/ui'
import { Heading, Text } from '@/components/ui'
import { Moon, Sun, Store, Users, DollarSign, TrendingUp, ArrowLeft, QrCode } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function MerchantPage() {
  const { theme, toggleTheme } = useThemeStore()
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false)
  const [isSpendModalOpen, setIsSpendModalOpen] = useState(false)
  const [scannedCustomerId, setScannedCustomerId] = useState('')
  const [transactions, setTransactions] = useState<Array<{id: string, customerId: string, amount: number, timestamp: Date}>>([])

  const handleQRScan = (customerId: string) => {
    setScannedCustomerId(customerId)
    setIsSpendModalOpen(true)
  }

  const handleSpendSubmit = (customerId: string, amount: number) => {
    // Create a new transaction
    const newTransaction = {
      id: `txn_${Date.now()}`,
      customerId,
      amount,
      timestamp: new Date()
    }

    setTransactions(prev => [newTransaction, ...prev])
    
    // Here you would typically make an API call to credit the customer's account
    console.log('Transaction completed:', newTransaction)
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-normal">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <Heading as="h1" size="2xl" className="sm:text-3xl">Merchant Portal</Heading>
                <Text variant="muted" className="text-sm sm:text-base">Manage your business operations</Text>
              </div>
            </div>
            <Button onClick={toggleTheme} variant="outline" size="sm" className="flex-shrink-0">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted">Total Sales</Text>
                    <Text size="lg" weight="semibold">$12,450</Text>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg flex-shrink-0">
                    <Users className="w-5 h-5 text-success" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted">Unique Customers</Text>
                    <Text size="lg" weight="semibold">1,234</Text>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-warning" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text size="sm" variant="muted">Average Spend</Text>
                    <Text size="lg" weight="semibold">$45.67</Text>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Actions */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription className="text-base">Common tasks for managing your business</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button className="h-16 justify-start gap-3 p-4">
                  <TrendingUp className="w-5 h-5 flex-shrink-0" />
                  <div className="text-left min-w-0 flex-1">
                    <Text weight="medium" className="text-base">Analytics</Text>
                    <Text size="sm" variant="muted">View business insights</Text>
                  </div>
                </Button>

                <Button variant="outline" className="h-16 justify-start gap-3 p-4">
                  <Store className="w-5 h-5 flex-shrink-0" />
                  <div className="text-left min-w-0 flex-1">
                    <Text weight="medium" className="text-base">View Recent Transactions</Text>
                    <Text size="sm" variant="muted">Check recent sales</Text>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scan QR Section */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <QrCode className="w-5 h-5" />
                Customer Transactions
              </CardTitle>
              <CardDescription className="text-base">
                Scan customer QR codes to process transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                <Button 
                  onClick={() => setIsQRScannerOpen(true)}
                  className="w-full h-16 text-lg font-medium"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Scan QR Code
                </Button>

                {/* Recent Transactions */}
                {transactions.length > 0 && (
                  <div className="space-y-3">
                    <Text weight="medium" className="text-base">Recent Transactions</Text>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div 
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-muted rounded-lg"
                        >
                          <div>
                            <Text size="sm" weight="medium">Customer {transaction.customerId}</Text>
                            <Text size="xs" variant="muted">
                              {transaction.timestamp.toLocaleTimeString()}
                            </Text>
                          </div>
                          <Text size="sm" weight="semibold" className="text-success">
                            ${transaction.amount.toFixed(2)}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
        onSubmit={handleSpendSubmit}
      />
    </div>
  )
}
