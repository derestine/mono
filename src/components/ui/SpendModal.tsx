'use client'

import React, { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from './index'
import { Heading, Text } from './index'
import { X, DollarSign, CheckCircle } from 'lucide-react'

interface SpendModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: string
  customerName?: string
  onSubmit: (customerId: string, amount: number) => void
  isProcessing?: boolean
}

export function SpendModal({ isOpen, onClose, customerId, customerName, onSubmit, isProcessing = false }: SpendModalProps) {
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleNumberClick = (num: string) => {
    if (amount.length < 10) { // Limit to 10 digits
      setAmount(amount + num)
    }
  }

  const handleDecimalClick = () => {
    if (!amount.includes('.') && amount.length < 9) {
      setAmount(amount + '.')
    }
  }

  const handleBackspace = () => {
    setAmount(amount.slice(0, -1))
  }

  const handleClear = () => {
    setAmount('')
  }

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const numericAmount = parseFloat(amount)
      onSubmit(customerId, numericAmount)
      
      setSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (error) {
      console.error('Error submitting spend:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setAmount('')
    setIsSubmitting(false)
    setSuccess(false)
    onClose()
  }

  const formatAmount = (value: string) => {
    if (!value) return '$0.00'
    const num = parseFloat(value)
    if (isNaN(num)) return '$0.00'
    return `$${num.toFixed(2)}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-modal bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="w-5 h-5" />
                Enter Spend Amount
              </CardTitle>
              <CardDescription className="text-base">
                {customerName ? customerName : `Customer ID: ${customerId}`}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="flex-shrink-0"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {success ? (
              <div className="flex items-center gap-2 p-4 bg-success/10 border border-success/20 rounded-md">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <Text size="sm" className="text-success">Transaction completed successfully!</Text>
              </div>
            ) : (
              <>
                {/* Amount Display */}
                <div className="p-4 bg-muted rounded-lg text-center">
                  <Text size="xs" variant="muted" className="mb-1">Amount</Text>
                  <Heading size="2xl" className="font-mono">
                    {formatAmount(amount)}
                  </Heading>
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Button
                      key={num}
                      variant="outline"
                      size="lg"
                      onClick={() => handleNumberClick(num.toString())}
                      disabled={isSubmitting}
                      className="h-12 text-lg font-mono"
                    >
                      {num}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleDecimalClick}
                    disabled={isSubmitting}
                    className="h-12 text-lg font-mono"
                  >
                    .
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleNumberClick('0')}
                    disabled={isSubmitting}
                    className="h-12 text-lg font-mono"
                  >
                    0
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleBackspace}
                    disabled={isSubmitting}
                    className="h-12 text-lg font-mono"
                  >
                    ←
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!amount || parseFloat(amount) <= 0 || isSubmitting || isProcessing}
                    className="flex-1"
                  >
                    {isSubmitting || isProcessing ? 'Processing...' : 'Submit'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
