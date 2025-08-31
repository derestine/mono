'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from './index'
import { Heading, Text } from './index'
import { X, Camera, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (customerId: string) => void
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      initializeScanner()
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
        scannerRef.current = null
      }
    }
  }, [isOpen])

  const initializeScanner = () => {
    try {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      )

      scannerRef.current.render(
        (decodedText) => {
          // Validate that it's a customer ID (simple validation)
          if (decodedText && decodedText.length > 0) {
            setSuccess(true)
            setIsScanning(false)
            
            // Stop scanning
            if (scannerRef.current) {
              scannerRef.current.clear()
              scannerRef.current = null
            }

            // Call the onScan callback with the customer ID
            setTimeout(() => {
              onScan(decodedText)
              onClose()
            }, 1000)
          }
        },
        (errorMessage) => {
          // Ignore errors during scanning
          console.log('QR scan error:', errorMessage)
        }
      )

      setIsScanning(true)
      setError(null)
    } catch (err) {
      setError('Failed to initialize camera. Please check permissions.')
      console.error('Scanner initialization error:', err)
    }
  }

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setIsScanning(false)
    setError(null)
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-modal bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Camera className="w-5 h-5" />
                Scan Customer QR Code
              </CardTitle>
              <CardDescription className="text-base">
                Point camera at customer's QR code
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <Text size="sm" className="text-destructive">{error}</Text>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-4 bg-success/10 border border-success/20 rounded-md">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <Text size="sm" className="text-success">QR Code detected successfully!</Text>
              </div>
            )}

            {!error && !success && (
              <div className="space-y-4">
                <div 
                  id="qr-reader" 
                  className={cn(
                    "w-full rounded-lg overflow-hidden border border-border",
                    "bg-background"
                  )}
                />
                {isScanning && (
                  <Text size="sm" variant="muted" className="text-center">
                    Scanning for QR code...
                  </Text>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
