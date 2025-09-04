'use client'

import React from 'react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { Text } from '@/components/ui'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface EmailConfirmationProps {
  email: string
  onResendEmail?: () => void
  onBackToSignIn?: () => void
  onEmailVerified?: () => void
}

export function EmailConfirmation({ email, onResendEmail, onBackToSignIn, onEmailVerified }: EmailConfirmationProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Check Your Email</CardTitle>
        <CardDescription>
          We&apos;ve sent a verification link to your email address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <div className="p-3 bg-muted rounded-lg">
            <Text weight="medium" className="text-sm">{email}</Text>
          </div>
          <Text size="sm" variant="muted">
            Click the link in the email to verify your account and complete the signup process.
          </Text>
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <Text size="sm" weight="medium" className="text-blue-900 dark:text-blue-100">
                What happens next?
              </Text>
              <Text size="sm" className="text-blue-700 dark:text-blue-300">
                After verifying your email, you&apos;ll be able to access your merchant portal and start managing your loyalty program.
              </Text>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {onEmailVerified && (
            <Button
              className="w-full"
              onClick={onEmailVerified}
            >
              I&apos;ve Verified My Email
            </Button>
          )}
          
          {onResendEmail && (
            <Button
              variant="outline"
              className="w-full"
              onClick={onResendEmail}
            >
              Resend Verification Email
            </Button>
          )}
          
          {onBackToSignIn && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={onBackToSignIn}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          )}
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
