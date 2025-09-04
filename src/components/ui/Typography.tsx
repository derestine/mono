import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// ===== HEADING COMPONENTS =====

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  variant?: 'default' | 'muted' | 'accent'
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as: Component = 'h1', size = '2xl', weight = 'bold', variant = 'default', children, ...props }, ref) => {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
    }

    const weightClasses = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    }

    const variantClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      accent: 'text-accent-foreground',
    }

    return (
      <Component
        ref={ref}
        className={cn(
          'font-mono leading-tight tracking-tight',
          sizeClasses[size],
          weightClasses[weight],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Heading.displayName = 'Heading'

// ===== TEXT COMPONENTS =====

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: 'p' | 'span' | 'div'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  weight?: 'normal' | 'medium' | 'semibold'
  variant?: 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'destructive'
  leading?: 'tight' | 'normal' | 'relaxed'
}

const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, as: Component = 'p', size = 'base', weight = 'normal', variant = 'default', leading = 'normal', children, ...props }, ref) => {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    }

    const weightClasses = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    }

    const variantClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      accent: 'text-accent-foreground',
      success: 'text-success-foreground',
      warning: 'text-warning-foreground',
      destructive: 'text-destructive-foreground',
    }

    const leadingClasses = {
      tight: 'leading-tight',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
    }

    return (
      <Component
        ref={ref}
        className={cn(
          'font-mono',
          sizeClasses[size],
          weightClasses[weight],
          variantClasses[variant],
          leadingClasses[leading],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Text.displayName = 'Text'

// ===== CODE COMPONENTS =====

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'code' | 'pre'
  size?: 'xs' | 'sm' | 'base' | 'lg'
  variant?: 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'destructive'
  block?: boolean
}

const Code = forwardRef<HTMLElement, CodeProps>(
  ({ className, as: Component = 'code', size = 'sm', variant = 'default', block = false, children, ...props }, ref) => {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
    }

    const variantClasses = {
      default: 'bg-muted text-foreground',
      muted: 'bg-muted/50 text-muted-foreground',
      accent: 'bg-accent text-accent-foreground',
      success: 'bg-success/10 text-success-foreground',
      warning: 'bg-warning/10 text-warning-foreground',
      destructive: 'bg-destructive/10 text-destructive-foreground',
    }

    const blockClasses = block ? 'block p-3 rounded-md' : 'inline px-1.5 py-0.5 rounded'

    return (
      <Component
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        className={cn(
          'font-mono font-medium',
          sizeClasses[size],
          variantClasses[variant],
          blockClasses,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Code.displayName = 'Code'

// ===== LABEL COMPONENTS =====

export interface LabelProps extends React.HTMLAttributes<HTMLLabelElement> {
  size?: 'xs' | 'sm' | 'base'
  weight?: 'normal' | 'medium' | 'semibold'
  variant?: 'default' | 'muted' | 'accent'
  required?: boolean
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, size = 'base', weight = 'medium', variant = 'default', required = false, children, ...props }, ref) => {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
    }

    const weightClasses = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    }

    const variantClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      accent: 'text-accent-foreground',
    }

    return (
      <label
        ref={ref}
        className={cn(
          'font-mono leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          sizeClasses[size],
          weightClasses[weight],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
    )
  }
)

Label.displayName = 'Label'

// ===== LIST COMPONENTS =====

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  as?: 'ul' | 'ol'
  size?: 'xs' | 'sm' | 'base' | 'lg'
  variant?: 'default' | 'muted'
  spacing?: 'tight' | 'normal' | 'loose'
}

const List = forwardRef<HTMLElement, ListProps>(
  ({ className, as: Component = 'ul', size = 'base', variant = 'default', spacing = 'normal', children, ...props }, ref) => {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
    }

    const variantClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
    }

    const spacingClasses = {
      tight: 'space-y-1',
      normal: 'space-y-2',
      loose: 'space-y-3',
    }

    return (
      <Component
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        className={cn(
          'font-mono',
          sizeClasses[size],
          variantClasses[variant],
          spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

List.displayName = 'List'

// ===== QUOTE COMPONENTS =====

export interface QuoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
  size?: 'xs' | 'sm' | 'base' | 'lg'
  variant?: 'default' | 'muted' | 'accent'
  cite?: string
}

const Quote = forwardRef<HTMLQuoteElement, QuoteProps>(
  ({ className, size = 'base', variant = 'default', cite, children, ...props }, ref) => {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
    }

    const variantClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      accent: 'text-accent-foreground',
    }

    return (
      <blockquote
        ref={ref}
        className={cn(
          'font-mono italic border-l-4 border-muted pl-4',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
        {cite && (
          <footer className="mt-2 text-sm text-muted-foreground">
            — <cite>{cite}</cite>
          </footer>
        )}
      </blockquote>
    )
  }
)

Quote.displayName = 'Quote'

// ===== EXPORTS =====

export { Heading, Text, Code, Label, List, Quote }

// ===== TYPOGRAPHY UTILITIES =====

export const typographyVariants = {
  // Heading variants
  h1: 'text-4xl font-bold font-mono leading-tight tracking-tight',
  h2: 'text-3xl font-semibold font-mono leading-tight tracking-tight',
  h3: 'text-2xl font-semibold font-mono leading-tight tracking-tight',
  h4: 'text-xl font-medium font-mono leading-tight tracking-tight',
  h5: 'text-lg font-medium font-mono leading-tight tracking-tight',
  h6: 'text-base font-medium font-mono leading-tight tracking-tight',

  // Text variants
  body: 'text-base font-normal font-mono leading-normal',
  bodyLarge: 'text-lg font-normal font-mono leading-relaxed',
  bodySmall: 'text-sm font-normal font-mono leading-normal',
  caption: 'text-xs font-normal font-mono leading-normal text-muted-foreground',

  // Code variants
  code: 'text-sm font-medium font-mono bg-muted px-1.5 py-0.5 rounded',
  codeBlock: 'text-sm font-medium font-mono bg-muted p-3 rounded-md block',

  // Label variants
  label: 'text-base font-medium font-mono leading-none',
  labelSmall: 'text-sm font-medium font-mono leading-none',

  // List variants
  list: 'text-base font-normal font-mono space-y-2',
  listSmall: 'text-sm font-normal font-mono space-y-1',

  // Quote variants
  quote: 'text-base font-normal font-mono italic border-l-4 border-muted pl-4',
  quoteLarge: 'text-lg font-normal font-mono italic border-l-4 border-muted pl-4',
} as const
