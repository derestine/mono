'use client'

import { useThemeStore } from '@/stores/theme'
import { useAuth } from '@/contexts/AuthContext'
import { useMerchant, MerchantProvider } from '@/contexts/MerchantContext'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input } from '@/components/ui'
import { Heading, Text } from '@/components/ui'
import { Moon, Sun, ArrowLeft, LogOut, Loader2, Settings, Star, CreditCard, Save } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function LoyaltySettingsPageContent() {
  const { theme, toggleTheme } = useThemeStore()
  const { user, signOut } = useAuth()
  const { merchant, loyaltyProgram, loading, error, updateLoyaltyProgram, refreshLoyaltyProgram } = useMerchant()
  const [programName, setProgramName] = useState('')
  const [programType, setProgramType] = useState<'points' | 'stamps'>('points')
  // Debug state changes
  useEffect(() => {
    console.log('📊 Form state changed:', { programName, programType })
  }, [programName, programType])
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // Initialize form values when loyalty program loads
  useEffect(() => {
    console.log('📋 Form useEffect triggered, loyaltyProgram:', loyaltyProgram)
    if (loyaltyProgram) {
      console.log('📝 Setting form values from loyalty program:', {
        name: loyaltyProgram.name,
        program_type: loyaltyProgram.program_type,
        points_per_dollar: loyaltyProgram.points_per_dollar
      })
      setProgramName(loyaltyProgram.name || '')
      setProgramType(loyaltyProgram.program_type || 'points')
    }
  }, [loyaltyProgram])

  // Check authentication
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth')
    }
  }, [user, loading, router])

  const handleSave = async () => {
    console.log('🚀 handleSave called')
    console.log('👤 Current user:', user?.id)
    console.log('🏢 Current merchant:', merchant)
    console.log('📋 Current loyaltyProgram:', loyaltyProgram)
    
    if (!merchant) {
      alert('❌ Error: No merchant profile found. Please try refreshing the page.')
      return
    }

    if (!programName.trim()) {
      alert('❌ Please enter a program name.')
      return
    }

    setIsSaving(true)
    try {
      const updateData = {
        name: programName.trim(),
        program_type: programType
        // points_per_dollar is now automatically set based on merchant currency
      }
      
      console.log('💾 Saving loyalty program settings:', updateData)
      console.log('🏢 Using merchant ID:', merchant.id)

      await updateLoyaltyProgram(updateData)
      
      // Force refresh the loyalty program data to ensure UI reflects changes
      console.log('🔄 Refreshing loyalty program data after update...')
      await refreshLoyaltyProgram()
      console.log('🔄 Refresh completed')
      
      alert('✅ Loyalty program settings updated successfully!')
      console.log('✅ Settings update completed successfully')
      
    } catch (error) {
      console.error('❌ Error updating loyalty program:', error)
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error details:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        stack: (error as any)?.stack,
        cause: (error as any)?.cause
      })
      
      // Show more specific error messages
      let errorMessage = '❌ Error updating settings.\n\n'
      
      if (error instanceof Error) {
        console.log('🔍 Error message:', error.message)
        if (error.message.includes('relation "loyalty_programs" does not exist')) {
          errorMessage += 'The loyalty programs table does not exist in your database. Please set up your database schema first.'
        } else if (error.message.includes('permission denied')) {
          errorMessage += 'Permission denied. Please check your database permissions.'
        } else if (error.message.includes('connection')) {
          errorMessage += 'Database connection error. Please check your internet connection and try again.'
        } else if (error.message.includes('column') && error.message.includes('does not exist')) {
          errorMessage += `Database schema issue: ${error.message}\n\nThis means your database is missing some expected columns. The loyalty program functionality may work partially.`
        } else if (error.message.includes('Row Level Security policy') || error.message.includes('RLS')) {
          errorMessage += `Database security issue: ${error.message}\n\n🔧 Fix: Run the "loyalty-programs-rls-fix.sql" file in your Supabase SQL Editor to add the missing Row Level Security policies.`
        } else {
          errorMessage += `Details: ${error.message}`
        }
      } else {
        errorMessage += `Unknown error occurred: ${JSON.stringify(error)}\n\nPlease check the browser console for more details.`
      }
      
      alert(errorMessage)
      
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          <Text size="sm">Loading loyalty settings...</Text>
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
                  Loyalty Program Settings
                </Heading>
                <Text variant="muted" size="sm">
                  Configure how customers earn rewards
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

          {/* Current Program Overview */}
          {loyaltyProgram && (
            <Card>
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Current Program
                </CardTitle>
                <CardDescription>Your active loyalty program configuration</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <Text size="xs" variant="muted">Program Type</Text>
                    <div className="flex items-center gap-2 mt-1">
                      {loyaltyProgram.program_type === 'points' ? (
                        <Star className="w-4 h-4 text-primary" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-primary" />
                      )}
                      <Text size="sm" weight="semibold" className="text-primary capitalize">
                        {loyaltyProgram.program_type}
                      </Text>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Text size="xs" variant="muted">Earning Rate</Text>
                    <Text size="sm" weight="semibold" className="text-blue-700">
                      {loyaltyProgram.program_type === 'points' 
                        ? `1 point per ${merchant?.currency === 'MYR' ? 'RM1' : '$1'} spent`
                        : '1 stamp per visit'
                      }
                    </Text>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <Text size="xs" variant="muted">Status</Text>
                    <Text size="sm" weight="semibold" className="text-green-700 capitalize">
                      {loyaltyProgram.status}
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Program Configuration */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle>Program Configuration</CardTitle>
              <CardDescription>Update your loyalty program settings</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-6">
                {/* Program Name */}
                <div>
                  <Text size="sm" weight="medium" className="mb-2">Program Name</Text>
                  <Input
                    type="text"
                    placeholder="e.g., Rewards Program, VIP Club"
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                {/* Program Type */}
                <div>
                  <Text size="sm" weight="medium" className="mb-3">Program Type</Text>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        programType === 'points' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => {
                        console.log('🔄 User clicked Points program type')
                        setProgramType('points')
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          programType === 'points' ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          <Star className={`w-5 h-5 ${
                            programType === 'points' ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div>
                          <Text size="sm" weight="medium">Points Program</Text>
                          <Text size="xs" variant="muted">Earn points based on spending</Text>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        programType === 'stamps' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => {
                        console.log('🔄 User clicked Stamps program type')
                        setProgramType('stamps')
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          programType === 'stamps' ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          <CreditCard className={`w-5 h-5 ${
                            programType === 'stamps' ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div>
                          <Text size="sm" weight="medium">Stamp Program</Text>
                          <Text size="xs" variant="muted">Earn stamps based on visits</Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Points Conversion Info (only for points program) */}
                {programType === 'points' && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Text size="sm" weight="medium" className="mb-2 text-blue-700">Automatic Points Conversion</Text>
                    <Text size="sm" className="text-blue-600">
                      • <strong>Singapore (SGD):</strong> $1 spent = 1 point
                    </Text>
                    <Text size="sm" className="text-blue-600">
                      • <strong>Malaysia (MYR):</strong> RM1 spent = 1 point
                    </Text>
                    <Text size="xs" variant="muted" className="mt-2">
                      Conversion rate is automatically set based on your business location. Visit Business Settings to change your location.
                    </Text>
                  </div>
                )}

                {/* Save Button */}
                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving || !programName.trim()}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function LoyaltySettingsPage() {
  return (
    <MerchantProvider>
      <LoyaltySettingsPageContent />
    </MerchantProvider>
  )
}