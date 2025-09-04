'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from './index'
import { Text } from './index'
import { X, Camera, AlertCircle, CheckCircle, Upload } from 'lucide-react'
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
  const [permissionRequested, setPermissionRequested] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && !scannerRef.current && !permissionRequested) {
      requestCameraPermission()
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
        scannerRef.current = null
      }
    }
  }, [isOpen, permissionRequested])

  const requestCameraPermission = async () => {
    setPermissionRequested(true)
    setError(null)
    
    try {
      // Check if camera permission is supported
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } // Prefer back camera
        })
        
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop())
        
        // Now initialize the scanner
        initializeScanner()
      } else {
        throw new Error('Camera not supported on this device')
      }
    } catch (err) {
      console.error('Camera permission error:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access and try again.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.')
        } else {
          setError('Failed to access camera. Please check your device settings.')
        }
      } else {
        setError('Camera access failed. Please try again.')
      }
    }
  }

  const initializeScanner = () => {
    try {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: false,
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
    setPermissionRequested(false)
    onClose()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const html5QrCode = new Html5Qrcode('file-qr-reader', { verbose: false })
      
      const result = await html5QrCode.scanFile(file, true)
      
      if (result) {
        setSuccess(true)
        setTimeout(() => {
          onScan(result)
          onClose()
        }, 1000)
      }
    } catch (err) {
      console.error('File scan error:', err)
      setError('Could not read QR code from image. Please try a clearer photo.')
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <style jsx>{`
        #qr-reader__dashboard_section {
          display: none !important;
        }
        #qr-reader__dashboard_section_swaplink {
          display: none !important;
        }
        #qr-reader__filescan_input {
          display: none !important;
        }
        #qr-reader__camera_start_button {
          display: none !important;
        }
        #qr-reader__scan_region {
          border: none !important;
        }
      `}</style>
      <Card className="w-full max-w-sm border-0 shadow-2xl">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">
              Scan QR Code
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <Text size="sm" className="text-red-700">{error}</Text>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <Text size="sm" className="text-green-700">QR Code scanned!</Text>
              </div>
            )}

            {!error && !success && (
              <div className="space-y-3">
                <div 
                  id="qr-reader" 
                  className="w-full rounded-lg overflow-hidden bg-muted/50"
                />
                {!permissionRequested && (
                  <Text size="xs" variant="muted" className="text-center">
                    Requesting camera access...
                  </Text>
                )}
                {permissionRequested && isScanning && (
                  <Text size="xs" variant="muted" className="text-center">
                    Point camera at QR code
                  </Text>
                )}
                
                {/* Photo Upload Button */}
                <div className="pt-2 border-t">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-2"
                    disabled={!permissionRequested}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </Button>
                </div>
              </div>
            )}

            {/* Hidden div for file scanning */}
            <div id="file-qr-reader" className="hidden" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
