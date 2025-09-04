'use client'

import React, { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input } from '@/components/ui'
import { Text } from '@/components/ui'
import { Building2, Loader2, CheckCircle, AlertCircle, MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { merchantOperations } from '@/lib/supabase'

interface MerchantProfileSetupProps {
  onComplete: () => void
  userEmail: string
}

const COUNTRIES = [
  { code: 'SGP', name: 'Singapore', currency: 'SGD', timezone: 'Asia/Singapore', flag: '🇸🇬' },
  { code: 'MYS', name: 'Malaysia', currency: 'MYR', timezone: 'Asia/Kuala_Lumpur', flag: '🇲🇾' }
]

export function MerchantProfileSetup({ onComplete, userEmail }: MerchantProfileSetupProps) {
  const [businessName, setBusinessName] = useState('')
  const [country, setCountry] = useState('SGP')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const { user } = useAuth()

  const selectedCountry = COUNTRIES.find(c => c.code === country)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!user) {
      setError('No authenticated user found')
      setIsLoading(false)
      return
    }

    try {
      console.log('Creating merchant profile for user:', user.id, 'with location:', country)
      
      // Create profile with location information
      const merchantData = await merchantOperations.createProfile(user.id, businessName, {
        country: country,
        currency: selectedCountry?.currency || 'SGD',
        timezone: selectedCountry?.timezone || 'Asia/Singapore'
      })
      
      console.log('Merchant profile created:', merchantData)
      setIsSuccess(true)
      
      // Wait a moment to show success, then complete
      setTimeout(() => {
        onComplete()
      }, 2000)
      
    } catch (err) {
      console.error('Error creating merchant profile:', err)
      setError((err as Error).message || 'Failed to create merchant profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Profile Created!</CardTitle>
          <CardDescription>
            Your merchant profile has been set up successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Text size="sm" variant="muted">
            Redirecting to your merchant portal...
          </Text>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <CardDescription>
          Set up your merchant profile to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <Text size="sm" className="text-destructive">{error}</Text>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Text size="sm" weight="medium">Business Name</Text>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Text size="sm" weight="medium">Business Location</Text>
            <Text size="xs" variant="muted" className="mb-2">
              This determines your currency and loyalty points conversion
            </Text>
            <div className="space-y-2">
              {COUNTRIES.map((countryOption) => (
                <div 
                  key={countryOption.code}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    country === countryOption.code 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => setCountry(countryOption.code)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{countryOption.flag}</span>
                    <div className="flex-1">
                      <Text size="sm" weight="medium">{countryOption.name}</Text>
                      <Text size="xs" variant="muted">
                        {countryOption.currency} • 1 {countryOption.currency === 'SGD' ? '$' : 'RM'}1 = 1 point
                      </Text>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      country === countryOption.code 
                        ? 'border-primary bg-primary' 
                        : 'border-muted'
                    }`}>
                      {country === countryOption.code && (
                        <div className="w-2 h-2 rounded-full bg-white m-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Text size="sm" weight="medium">Email</Text>
            <div className="p-3 bg-muted rounded-lg">
              <Text size="sm" className="text-muted-foreground">{userEmail}</Text>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !businessName}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Merchant Profile'
            )}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <Text size="sm" className="text-blue-700 dark:text-blue-300">
            This will create your merchant profile and set up a default loyalty program for your business.
          </Text>
        </div>
      </CardContent>
    </Card>
  )
}
