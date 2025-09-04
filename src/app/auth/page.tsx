'use client'

import React, { useState, useEffect } from 'react'
import { SignInForm } from '@/components/auth/SignInForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { EmailConfirmation } from '@/components/auth/EmailConfirmation'
import { ClearCookiesButton } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { authOperations } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Heading, Text } from '@/components/ui'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      console.log('User authenticated, redirecting to merchant portal')
      router.push('/merchant')
    }
  }, [user, loading, router])

  const handleAuthSuccess = () => {
    router.push('/merchant')
  }

  const handleSignUpSuccess = (email: string) => {
    console.log('Signup successful, checking if user is authenticated...')
    // For now, skip email confirmation and go directly to merchant setup
    // The user should be automatically signed in after signup
    if (user) {
      console.log('User is authenticated, redirecting to merchant portal')
      router.push('/merchant')
    } else {
      console.log('User not yet authenticated, showing email confirmation')
      setSignupEmail(email)
      setShowEmailConfirmation(true)
    }
  }

  const handleEmailVerified = () => {
    // After email verification, redirect to create business page
    router.push('/create-business')
  }

  const handleBackToSignIn = () => {
    setShowEmailConfirmation(false)
    setIsSignUp(false)
  }

  const handleResendEmail = async () => {
    try {
      await authOperations.resendConfirmationEmail(signupEmail)
      // You could show a success message here
      console.log('Resend email sent to:', signupEmail)
    } catch (error) {
      console.error('Error resending email:', error)
      // You could show an error message here
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <Text>Loading...</Text>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <Text>Redirecting to merchant portal...</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Heading size="2xl">mono</Heading>
          <div className="flex justify-center">
            <ClearCookiesButton 
              variant="ghost" 
              size="sm" 
              showConfirmation={false}
              onClear={() => window.location.reload()}
            />
          </div>
        </div>

        {/* Auth Form */}
        {showEmailConfirmation ? (
          <EmailConfirmation
            email={signupEmail}
            onResendEmail={handleResendEmail}
            onBackToSignIn={handleBackToSignIn}
            onEmailVerified={handleEmailVerified}
          />
        ) : isSignUp ? (
          <SignUpForm
            onSuccess={handleSignUpSuccess}
            onSwitchToSignIn={() => setIsSignUp(false)}
          />
        ) : (
          <SignInForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={() => setIsSignUp(true)}
          />
        )}
      </div>
    </div>
  )
}
