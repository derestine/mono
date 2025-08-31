/**
 * Theme System Documentation
 * 
 * This file defines the design system constants and utilities
 * to ensure consistency across all components.
 */

// ===== COLOR TOKENS =====
export const colors = {
  // Light theme colors (RGB values)
  light: {
    primary: '17 17 17',
    primaryForeground: '255 255 255',
    secondary: '245 245 245',
    secondaryForeground: '17 17 17',
    muted: '250 250 250',
    mutedForeground: '115 115 115',
    accent: '245 245 245',
    accentForeground: '17 17 17',
    border: '229 229 229',
    input: '250 250 250',
    ring: '17 17 17',
    background: '255 255 255',
    foreground: '17 17 17',
    card: '255 255 255',
    cardForeground: '17 17 17',
    popover: '255 255 255',
    popoverForeground: '17 17 17',
    destructive: '239 68 68',
    destructiveForeground: '255 255 255',
    success: '34 197 94',
    successForeground: '255 255 255',
    warning: '245 158 11',
    warningForeground: '255 255 255',
  },
  // Dark theme colors (RGB values)
  dark: {
    primary: '255 255 255',
    primaryForeground: '17 17 17',
    secondary: '38 38 38',
    secondaryForeground: '255 255 255',
    muted: '38 38 38',
    mutedForeground: '163 163 163',
    accent: '38 38 38',
    accentForeground: '255 255 255',
    border: '64 64 64',
    input: '38 38 38',
    ring: '255 255 255',
    background: '10 10 10',
    foreground: '237 237 237',
    card: '17 17 17',
    cardForeground: '237 237 237',
    popover: '17 17 17',
    popoverForeground: '237 237 237',
    destructive: '239 68 68',
    destructiveForeground: '255 255 255',
    success: '34 197 94',
    successForeground: '255 255 255',
    warning: '245 158 11',
    warningForeground: '255 255 255',
  },
} as const

// ===== TYPOGRAPHY TOKENS =====
export const typography = {
  fontFamily: {
    sans: 'var(--font-family-sans)',
    mono: 'var(--font-family-mono)',
  },
  fontSize: {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    base: 'var(--font-size-base)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
    '2xl': 'var(--font-size-2xl)',
    '3xl': 'var(--font-size-3xl)',
    '4xl': 'var(--font-size-4xl)',
  },
  fontWeight: {
    normal: 'var(--font-weight-normal)',
    medium: 'var(--font-weight-medium)',
    semibold: 'var(--font-weight-semibold)',
    bold: 'var(--font-weight-bold)',
  },
  lineHeight: {
    tight: 'var(--line-height-tight)',
    normal: 'var(--line-height-normal)',
    relaxed: 'var(--line-height-relaxed)',
  },
} as const

// ===== SPACING TOKENS =====
export const spacing = {
  0: 'var(--spacing-0)',
  1: 'var(--spacing-1)',
  2: 'var(--spacing-2)',
  3: 'var(--spacing-3)',
  4: 'var(--spacing-4)',
  5: 'var(--spacing-5)',
  6: 'var(--spacing-6)',
  8: 'var(--spacing-8)',
  10: 'var(--spacing-10)',
  12: 'var(--spacing-12)',
  16: 'var(--spacing-16)',
  20: 'var(--spacing-20)',
  24: 'var(--spacing-24)',
} as const

// ===== BORDER RADIUS TOKENS =====
export const borderRadius = {
  none: 'var(--radius-none)',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
  full: 'var(--radius-full)',
} as const

// ===== SHADOW TOKENS =====
export const shadows = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
} as const

// ===== TRANSITION TOKENS =====
export const transitions = {
  fast: 'var(--transition-fast)',
  normal: 'var(--transition-normal)',
  slow: 'var(--transition-slow)',
} as const

// ===== Z-INDEX TOKENS =====
export const zIndex = {
  dropdown: 'var(--z-dropdown)',
  sticky: 'var(--z-sticky)',
  fixed: 'var(--z-fixed)',
  modalBackdrop: 'var(--z-modal-backdrop)',
  modal: 'var(--z-modal)',
  popover: 'var(--z-popover)',
  tooltip: 'var(--z-tooltip)',
} as const

// ===== COMPONENT SIZES =====
export const componentSizes = {
  button: {
    sm: { height: '2rem', padding: '0.75rem', fontSize: '0.75rem' },
    md: { height: '2.5rem', padding: '1rem', fontSize: '0.875rem' },
    lg: { height: '3rem', padding: '2rem', fontSize: '1rem' },
  },
  input: {
    height: '2.5rem',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
  },
  badge: {
    padding: '0.125rem 0.625rem',
    fontSize: '0.75rem',
    borderRadius: '9999px',
  },
} as const

// ===== UTILITY FUNCTIONS =====

/**
 * Get color value for current theme
 */
export function getColorValue(colorName: keyof typeof colors.light, theme: 'light' | 'dark' = 'light') {
  return colors[theme][colorName]
}

/**
 * Get CSS variable name for a color
 */
export function getColorVariable(colorName: keyof typeof colors.light) {
  return `--color-${colorName.replace(/([A-Z])/g, '-$1').toLowerCase()}`
}

/**
 * Get RGB color string for CSS
 */
export function getRgbColor(colorName: keyof typeof colors.light, theme: 'light' | 'dark' = 'light') {
  return `rgb(${getColorValue(colorName, theme)})`
}

/**
 * Theme-aware color utility
 */
export function themeColor(colorName: keyof typeof colors.light) {
  return `rgb(var(--color-${colorName.replace(/([A-Z])/g, '-$1').toLowerCase()}))`
}

// ===== COMMON CLASS NAMES =====
export const commonClasses = {
  // Layout
  container: 'container mx-auto px-4',
  section: 'py-16',
  grid: 'grid gap-6',
  grid2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  grid3: 'grid grid-cols-1 md:grid-cols-3 gap-6',
  
  // Typography
  heading1: 'text-4xl font-bold',
  heading2: 'text-3xl font-semibold',
  heading3: 'text-2xl font-semibold',
  body: 'text-base',
  caption: 'text-sm text-muted-foreground',
  
  // Spacing
  stack: 'space-y-4',
  stackSm: 'space-y-2',
  stackLg: 'space-y-8',
  inline: 'flex items-center gap-2',
  inlineSm: 'flex items-center gap-1',
  
  // Interactive
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  transition: 'transition-colors duration-normal',
} as const

// ===== THEME VALIDATION =====
export function validateThemeTokens() {
  const requiredTokens = [
    'primary', 'secondary', 'muted', 'accent', 'border', 'input', 'ring',
    'background', 'foreground', 'card', 'popover', 'destructive', 'success', 'warning'
  ]
  
  const missingTokens = requiredTokens.filter(token => {
    const lightValue = colors.light[token as keyof typeof colors.light]
    const darkValue = colors.dark[token as keyof typeof colors.dark]
    return !lightValue || !darkValue
  })
  
  if (missingTokens.length > 0) {
    console.warn('Missing theme tokens:', missingTokens)
    return false
  }
  
  return true
}

// Validate tokens on import
validateThemeTokens()
