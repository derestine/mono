'use client'

import { useState } from 'react'
import { merchantOperations } from '@/lib/supabase'
import { Button } from '@/components/ui'

export default function DebugLoyaltyPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testLoyaltyOperations = async () => {
    setLoading(true)
    setResult('Testing loyalty operations...\n\n')
    
    try {
      // Test merchant ID (using a fake one for testing)
      const testMerchantId = 'test-merchant-123'
      
      // Test 1: Get loyalty program
      setResult(prev => prev + '1. Testing getLoyaltyProgram...\n')
      const program = await merchantOperations.getLoyaltyProgram(testMerchantId)
      setResult(prev => prev + `✅ Result: ${JSON.stringify(program, null, 2)}\n\n`)
      
      // Test 2: Update loyalty program
      setResult(prev => prev + '2. Testing updateLoyaltyProgram...\n')
      const updateResult = await merchantOperations.updateLoyaltyProgram(testMerchantId, {
        name: 'Test Program',
        program_type: 'points',
        points_per_dollar: 2
      })
      setResult(prev => prev + `✅ Update result: ${JSON.stringify(updateResult, null, 2)}\n\n`)
      
      setResult(prev => prev + '🎉 All tests completed successfully!')
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setResult(prev => prev + `❌ Error: ${errorMsg}\n`)
      console.error('Test error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Loyalty Operations</h1>
        
        <Button 
          onClick={testLoyaltyOperations}
          disabled={loading}
          className="mb-4"
        >
          {loading ? 'Testing...' : 'Run Tests'}
        </Button>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
          <pre className="whitespace-pre-wrap">{result || 'Click "Run Tests" to start debugging'}</pre>
        </div>
      </div>
    </div>
  )
}