'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { Heading, Text } from '@/components/ui'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [envVars, setEnvVars] = useState<{ url: string; key: string }>({ url: '', key: '' })

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  const testSupabaseConnection = async () => {
    try {
      setStatus('loading')
      setMessage('Testing Supabase connection...')

      // Check environment variables
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      setEnvVars({
        url: url || 'Missing',
        key: key ? `${key.substring(0, 20)}...` : 'Missing'
      })

      if (!url || !key) {
        setStatus('error')
        setMessage('Missing Supabase environment variables')
        return
      }

      // Test basic connection
      const { data, error } = await supabase.from('merchants').select('count').limit(1)
      
      if (error) {
        setStatus('error')
        setMessage(`Connection failed: ${error.message}`)
      } else {
        setStatus('success')
        setMessage('Supabase connection successful!')
      }
    } catch (error) {
      setStatus('error')
      setMessage(`Unexpected error: ${(error as Error).message}`)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Heading size="2xl">Supabase Connection Test</Heading>
          <Text variant="muted">Testing your Supabase configuration</Text>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Check if your Supabase credentials are set</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Text size="sm" weight="medium">NEXT_PUBLIC_SUPABASE_URL:</Text>
              <div className="p-2 bg-muted rounded text-sm font-mono">
                {envVars.url}
              </div>
            </div>
            <div className="space-y-2">
              <Text size="sm" weight="medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</Text>
              <div className="p-2 bg-muted rounded text-sm font-mono">
                {envVars.key}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Test the connection to your Supabase project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
              {status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
              <Text>{message}</Text>
            </div>
            
            <Button onClick={testSupabaseConnection} disabled={status === 'loading'}>
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Text size="sm">If the connection fails:</Text>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Check your `.env.local` file has the correct Supabase credentials</li>
              <li>Verify your Supabase project is active and accessible</li>
              <li>Ensure you&apos;ve applied the database schema</li>
              <li>Check your Supabase Auth settings</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
