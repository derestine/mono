import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'badge-default',
      secondary: 'badge-secondary',
      destructive: 'badge-destructive',
      outline: 'badge-outline',
    }

    return (
      <div
        ref={ref}
        className={cn('badge', variantClasses[variant], className)}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
