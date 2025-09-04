'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input } from '@/components/ui'
import { Heading, Text } from '@/components/ui'
import { Building2, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { merchantOperations } from '@/lib/supabase'
import Link from 'next/link'

export default function CreateBusinessPage() {
  const [businessName, setBusinessName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!user) {
      setError('No authenticated user found')
      setIsLoading(false)
      return
    }

    if (!businessName.trim()) {
      setError('Please enter a business name')
      setIsLoading(false)
      return
    }

    try {
      console.log('Creating merchant profile for user:', user.id)
      
      const merchantData = await merchantOperations.createProfile(user.id, businessName.trim())
      
      console.log('Merchant profile created:', merchantData)
      setIsSuccess(true)
      
      // Wait a moment to show success, then redirect to merchant portal
      setTimeout(() => {
        router.push('/merchant')
      }, 2000)
      
    } catch (err) {
      console.error('Error creating merchant profile:', err)
      setError((err as Error).message || 'Failed to create merchant profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <Text>Loading...</Text>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Business Created!</CardTitle>
            <CardDescription>
              Your business profile has been set up successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Text size="sm" variant="muted">
              Redirecting to your merchant portal...
            </Text>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Auth
          </Link>
          <Heading size="2xl">Create Your Business</Heading>
          <Text variant="muted">
            Set up your merchant profile to get started
          </Text>
        </div>

        {/* Business Setup Form */}
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl text-center">Business Information</CardTitle>
            <CardDescription className="text-center">
              Tell us about your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <Text size="sm" className="text-destructive">{error}</Text>
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
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Text size="sm" weight="medium">Email</Text>
                <div className="p-3 bg-muted rounded-lg">
                  <Text size="sm" className="text-muted-foreground">{user.email}</Text>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !businessName.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Business...
                  </>
                ) : (
                  'Create Business'
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

        {/* Footer */}
        <div className="text-center">
          <Text size="sm" variant="muted">
            Already have a business?{' '}
            <Link href="/auth" className="text-primary hover:underline">
              Sign in here
            </Link>
          </Text>
        </div>
      </div>
    </div>
  )
}
