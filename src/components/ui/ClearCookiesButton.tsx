'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui'
import { Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ClearCookiesButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showConfirmation?: boolean
  onClear?: () => void
}

export function ClearCookiesButton({ 
  variant = 'outline', 
  size = 'sm', 
  showConfirmation = true,
  onClear 
}: ClearCookiesButtonProps) {
  const [isClearing, setIsClearing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  const clearAllData = async () => {
    setIsClearing(true)
    setShowSuccess(false)
    setShowError(false)

    try {
      // Sign out from Supabase (clears auth cookies)
      await supabase.auth.signOut()
      
      // Clear local storage
      localStorage.clear()
      
      // Clear session storage
      sessionStorage.clear()
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })

      console.log('All cookies and session data cleared')
      
      setShowSuccess(true)
      onClear?.()
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error('Error clearing cookies:', error)
      setShowError(true)
      
      // Auto-hide error message after 3 seconds
      setTimeout(() => {
        setShowError(false)
      }, 3000)
    } finally {
      setIsClearing(false)
    }
  }

  const handleClick = () => {
    if (showConfirmation) {
      const confirmed = window.confirm(
        'This will clear all cookies, local storage, and sign you out. Are you sure?'
      )
      if (confirmed) {
        clearAllData()
      }
    } else {
      clearAllData()
    }
  }

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        variant={variant}
        size={size}
        disabled={isClearing}
        className="flex items-center gap-2"
      >
        {isClearing ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Clearing...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </>
        )}
      </Button>
      
      {/* Success Message */}
      {showSuccess && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200 text-sm">
            <CheckCircle className="w-4 h-4" />
            All data cleared successfully
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {showError && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200 text-sm">
            <AlertCircle className="w-4 h-4" />
            Error clearing data
          </div>
        </div>
      )}
    </div>
  )
}
