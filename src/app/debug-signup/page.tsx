'use client'

import React, { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, ClearCookiesButton } from '@/components/ui'
import { Heading, Text } from '@/components/ui'
import { Input } from '@/components/ui'
import { supabase, authOperations } from '@/lib/supabase'
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'

export default function DebugSignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testSignup = async () => {
    setStatus('testing')
    setMessage('')
    setLogs([])

    try {
      addLog('Starting signup test...')
      addLog(`Email: ${email}`)
      addLog(`Business: ${businessName}`)

      // Test 1: Check environment variables
      addLog('Checking environment variables...')
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        throw new Error('Missing Supabase environment variables')
      }
      addLog('Environment variables OK')

      // Test 2: Test basic connection
      addLog('Testing Supabase connection...')
      const { data: testData, error: testError } = await supabase.from('merchants').select('count').limit(1)
      
      if (testError) {
        addLog(`Connection test failed: ${testError.message}`)
      } else {
        addLog('Connection test successful')
      }

      // Test 3: Attempt signup
      addLog('Attempting signup...')
      const { data, error } = await authOperations.signUpMerchant(email, password, businessName)
      
      if (error) {
        addLog(`Signup failed: ${(error as Error).message}`)
        throw error
      }

      addLog('Signup successful!')
      addLog(`User ID: ${data.user?.id}`)
      
      setStatus('success')
      setMessage('Signup test completed successfully!')
      
    } catch (error) {
      addLog(`Error: ${(error as Error).message}`)
      setStatus('error')
      setMessage((error as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Heading size="2xl">Signup Debug Tool</Heading>
          <Text variant="muted">Test the signup process step by step</Text>
          <div className="flex justify-center mt-4">
            <ClearCookiesButton 
              variant="outline" 
              size="sm"
              onClear={() => window.location.reload()}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Parameters</CardTitle>
            <CardDescription>Enter test data for signup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Text size="sm" weight="medium">Email</Text>
              <Input
                type="email"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Text size="sm" weight="medium">Password</Text>
              <Input
                type="password"
                placeholder="password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Text size="sm" weight="medium">Business Name</Text>
              <Input
                type="text"
                placeholder="Test Business"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <Button 
              onClick={testSignup} 
              disabled={status === 'testing' || !email || !password || !businessName}
              className="w-full"
            >
              {status === 'testing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run Signup Test'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Status and logs from the test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              {status === 'idle' && <AlertCircle className="w-4 h-4 text-muted-foreground" />}
              {status === 'testing' && <Loader2 className="w-4 h-4 animate-spin" />}
              {status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
              <Text>{message || 'Ready to test'}</Text>
            </div>

            {logs.length > 0 && (
              <div className="space-y-2">
                <Text size="sm" weight="medium">Logs:</Text>
                <div className="p-3 bg-muted rounded-lg max-h-64 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm font-mono text-muted-foreground">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
