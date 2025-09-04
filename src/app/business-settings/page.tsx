'use client'

import { useThemeStore } from '@/stores/theme'
import { useAuth } from '@/contexts/AuthContext'
import { useMerchant, MerchantProvider } from '@/contexts/MerchantContext'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, useToast } from '@/components/ui'
import { Heading, Text } from '@/components/ui'
import { Moon, Sun, ArrowLeft, LogOut, Loader2, Building, MapPin, Clock, Phone, Globe, Save, Star, CreditCard, Settings } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const COUNTRIES = [
  { code: 'SGP', name: 'Singapore', currency: 'SGD', timezone: 'Asia/Singapore' },
  { code: 'MYS', name: 'Malaysia', currency: 'MYR', timezone: 'Asia/Kuala_Lumpur' }
]

const WEEKDAYS = [
  { key: 'monday', name: 'Monday' },
  { key: 'tuesday', name: 'Tuesday' },
  { key: 'wednesday', name: 'Wednesday' },
  { key: 'thursday', name: 'Thursday' },
  { key: 'friday', name: 'Friday' },
  { key: 'saturday', name: 'Saturday' },
  { key: 'sunday', name: 'Sunday' }
]

function BusinessSettingsPageContent() {
  const { theme, toggleTheme } = useThemeStore()
  const { user, signOut } = useAuth()
  const { merchant, loading, error, updateMerchantProfile, loyaltyProgram, updateLoyaltyProgram, refreshLoyaltyProgram } = useMerchant()
  const [isSaving, setIsSaving] = useState(false)
  const { showToast, ToastComponent } = useToast()
  const router = useRouter()

  // Form state
  const [businessName, setBusinessName] = useState('')
  const [openingHours, setOpeningHours] = useState<any>({})
  
  // Loyalty program state
  const [programType, setProgramType] = useState<'points' | 'stamps'>('points')
  
  // Original values for change detection
  const [originalBusinessName, setOriginalBusinessName] = useState('')
  const [originalOpeningHours, setOriginalOpeningHours] = useState<any>({})
  const [originalProgramType, setOriginalProgramType] = useState<'points' | 'stamps'>('points')

  // Initialize form values when merchant loads
  useEffect(() => {
    if (merchant) {
      console.log('📝 Setting form values from merchant:', merchant)
      const businessNameValue = merchant.business_name || ''
      const openingHoursValue = merchant.opening_hours || {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: false }
      }
      
      setBusinessName(businessNameValue)
      setOpeningHours(openingHoursValue)
      setOriginalBusinessName(businessNameValue)
      setOriginalOpeningHours(openingHoursValue)
    }
  }, [merchant])

  // Initialize loyalty program form values
  useEffect(() => {
    if (loyaltyProgram) {
      console.log('📝 Setting loyalty program form values:', loyaltyProgram)
      const programTypeValue = loyaltyProgram.program_type || 'points'
      setProgramType(programTypeValue)
      setOriginalProgramType(programTypeValue)
    }
  }, [loyaltyProgram])

  // Check authentication
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth')
    }
  }, [user, loading, router])

  const selectedCountry = COUNTRIES.find(c => c.code === merchant?.country) || COUNTRIES[0]

  // Check if there are changes
  const hasChanges = () => {
    if (businessName.trim() !== originalBusinessName) return true
    if (programType !== originalProgramType) return true
    
    // Check opening hours changes
    const originalHoursStr = JSON.stringify(originalOpeningHours)
    const currentHoursStr = JSON.stringify(openingHours)
    if (originalHoursStr !== currentHoursStr) return true
    
    return false
  }

  const handleSave = async () => {
    console.log('🚀 handleSave called for business settings and loyalty program')
    
    if (!merchant) {
      alert('❌ Error: No merchant profile found. Please try refreshing the page.')
      return
    }

    if (!businessName.trim()) {
      alert('❌ Please enter a business name.')
      return
    }

    setIsSaving(true)
    try {
      // Update business settings
      const businessUpdateData: any = {
        business_name: businessName.trim()
      }
      
      // Only include opening_hours if the column exists
      try {
        businessUpdateData.opening_hours = openingHours
      } catch (error) {
        console.warn('Opening hours column may not exist yet:', error)
      }
      
      console.log('💾 Saving business settings:', businessUpdateData)
      await updateMerchantProfile(businessUpdateData)

      // Update loyalty program
      const loyaltyUpdateData = {
        program_type: programType
      }
      
      console.log('💾 Saving loyalty program settings:', loyaltyUpdateData)
      await updateLoyaltyProgram(loyaltyUpdateData)
      await refreshLoyaltyProgram()
      
      // Update original values after successful save
      setOriginalBusinessName(businessName.trim())
      setOriginalOpeningHours(openingHours)
      setOriginalProgramType(programType)
      
      showToast('Business settings updated successfully!', 'success')
      console.log('✅ Settings update completed successfully')
      
    } catch (error) {
      console.error('❌ Error updating settings:', error)
      
      let errorMessage = 'Error updating settings'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      showToast(errorMessage, 'error')
      
    } finally {
      setIsSaving(false)
    }
  }

  const updateOpeningHours = (day: string, field: string, value: string | boolean) => {
    setOpeningHours((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          <Text size="sm">Loading business settings...</Text>
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
                  Business Settings
                </Heading>
                <Text variant="muted" size="sm">
                  Manage your business information
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

          {/* Business Information */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building className="w-4 h-4" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Text size="sm" weight="medium" className="mb-2">Business Name *</Text>
                    <Input
                      type="text"
                      placeholder="e.g., Coffee Corner Cafe"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Text size="sm" weight="medium" className="mb-2">Location</Text>
                    <div className="p-3 bg-muted rounded border text-sm">
                      <div className="flex items-center gap-2">
                        <span>{selectedCountry.flag}</span>
                        <Text size="sm">{selectedCountry.name} • {selectedCountry.currency}</Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opening Hours */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4" />
                Opening Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {WEEKDAYS.map((day, index) => (
                  <div 
                    key={day.key} 
                    className="flex items-center justify-between p-3 hover:bg-muted/20 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-20">
                        <Text size="sm" weight="medium" className="capitalize">
                          {day.name}
                        </Text>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => updateOpeningHours(day.key, 'closed', !openingHours[day.key]?.closed)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors border-2 ${
                          !openingHours[day.key]?.closed
                            ? 'bg-primary border-primary' 
                            : 'bg-muted border-muted-foreground/20'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                            !openingHours[day.key]?.closed ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {!openingHours[day.key]?.closed ? (
                        <>
                          <Input
                            type="time"
                            value={openingHours[day.key]?.open || '09:00'}
                            onChange={(e) => updateOpeningHours(day.key, 'open', e.target.value)}
                            className="w-24 h-8 text-xs font-mono"
                          />
                          <Text size="xs" variant="muted" className="px-1">–</Text>
                          <Input
                            type="time"
                            value={openingHours[day.key]?.close || '18:00'}
                            onChange={(e) => updateOpeningHours(day.key, 'close', e.target.value)}
                            className="w-24 h-8 text-xs font-mono"
                          />
                        </>
                      ) : (
                        <div className="w-52 text-right">
                          <Text size="sm" variant="muted">Closed</Text>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Program Status */}
          {loyaltyProgram && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg border">
                <Text size="xs" variant="muted">Type</Text>
                <div className="flex items-center gap-2 mt-1">
                  {loyaltyProgram.program_type === 'points' ? (
                    <Star className="w-3 h-3 text-primary" />
                  ) : (
                    <CreditCard className="w-3 h-3 text-primary" />
                  )}
                  <Text size="sm" weight="medium" className="text-foreground capitalize">
                    {loyaltyProgram.program_type}
                  </Text>
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <Text size="xs" variant="muted">Rate</Text>
                <Text size="sm" weight="medium" className="text-foreground">
                  {loyaltyProgram.program_type === 'points' 
                    ? `1:1 ${merchant?.currency || 'SGD'}`
                    : '1 per visit'
                  }
                </Text>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <Text size="xs" variant="muted">Status</Text>
                <Text size="sm" weight="medium" className="text-green-600 capitalize">
                  {loyaltyProgram.status}
                </Text>
              </div>
            </div>
          )}

          {/* Loyalty Program Configuration */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="w-4 h-4" />
                Loyalty Program
              </CardTitle>
              <CardDescription className="text-sm">Configure how customers earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                {/* Program Type */}
                <div>
                  <Text size="sm" weight="medium" className="mb-2">Program Type</Text>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        programType === 'points' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => setProgramType('points')}
                    >
                      <div className="flex items-center gap-2">
                        <Star className={`w-4 h-4 ${
                          programType === 'points' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <div>
                          <Text size="sm" weight="medium">Points</Text>
                          <Text size="xs" variant="muted">Based on spending</Text>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        programType === 'stamps' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => setProgramType('stamps')}
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className={`w-4 h-4 ${
                          programType === 'stamps' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <div>
                          <Text size="sm" weight="medium">Stamps</Text>
                          <Text size="xs" variant="muted">Based on visits</Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Points Conversion Info (only for points program) */}
                {programType === 'points' && (
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <Text size="xs" variant="muted">
                      Points automatically convert 1:1 with your local currency ({merchant?.currency === 'MYR' ? 'RM1 = 1 point' : '$1 = 1 point'})
                    </Text>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button - Only show if there are changes */}
          {hasChanges() && (
            <div className="sticky bottom-6 flex justify-center">
              <div className="bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-lg border">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving || !businessName.trim()}
                  className="flex items-center gap-2 px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Toast Component */}
      <ToastComponent />
    </div>
  )
}

export default function BusinessSettingsPage() {
  return (
    <MerchantProvider>
      <BusinessSettingsPageContent />
    </MerchantProvider>
  )
}