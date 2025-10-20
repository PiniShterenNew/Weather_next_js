/**
 * Design Tokens for Weather App
 * Centralized design system tokens for consistent UI
 * Mobile-first, RTL-ready, WCAG 2.2 compliant
 */

// Color Tokens
export const colors = {
  // Brand Colors
  brand: {
    50: 'hsl(var(--brand-50))',
    100: 'hsl(var(--brand-100))',
    200: 'hsl(var(--brand-200))',
    300: 'hsl(var(--brand-300))',
    400: 'hsl(var(--brand-400))',
    500: 'hsl(var(--brand-500))',
    600: 'hsl(var(--brand-600))',
    700: 'hsl(var(--brand-700))',
    800: 'hsl(var(--brand-800))',
    900: 'hsl(var(--brand-900))',
  },
  
  // Semantic Colors
  background: {
    page: 'hsl(var(--bg-page))',
    card: 'hsl(var(--bg))',
    elevated: 'hsl(var(--card))',
    overlay: 'hsl(var(--muted) / 0.5)',
  },
  
  foreground: {
    primary: 'hsl(var(--fg))',
    muted: 'hsl(var(--muted-fg))',
    card: 'hsl(var(--card-fg))',
  },
  
  // Status Colors
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  danger: 'hsl(var(--danger))',
  info: 'hsl(var(--brand-500))',
  
  // Weather-Specific Colors
  weather: {
    sunny: 'hsl(45 93% 47%)',
    cloudy: 'hsl(220 9% 70%)',
    rainy: 'hsl(210 83% 53%)',
    stormy: 'hsl(260 75% 65%)',
    snowy: 'hsl(200 100% 97%)',
    foggy: 'hsl(220 9% 70%)',
    windy: 'hsl(188 94% 43%)',
    hot: 'hsl(0 84% 60%)',
    cold: 'hsl(210 83% 53%)',
  },
  
  // Weather Background Gradients (Google Weather Style)
  weatherGradients: {
    clearDay: 'linear-gradient(to bottom, #4A90E2, #87CEEB, #B0E0E6)',
    clearNight: 'linear-gradient(to bottom, #0B1026, #1B2A4E, #2D3E5F)',
    cloudyDay: 'linear-gradient(to bottom, #7C8B9E, #A8B8C8, #C9D6DF)',
    cloudyNight: 'linear-gradient(to bottom, #1B2530, #2C3E50, #4A5D6F)',
    rainyDay: 'linear-gradient(to bottom, #5F7A95, #6B8CAE, #7FA5C7)',
    rainyNight: 'linear-gradient(to bottom, #1E2A3A, #34495E, #4B6584)',
    snowyDay: 'linear-gradient(to bottom, #D4E4F7, #E8F4F8, #F0F8FF)',
    snowyNight: 'linear-gradient(to bottom, #2C3E50, #34495E, #5D6D7E)',
    foggyDay: 'linear-gradient(to bottom, #B8C5D6, #CFD8DC, #ECEFF1)',
    foggyNight: 'linear-gradient(to bottom, #263238, #37474F, #546E7A)',
  },
  
  // UI Element Colors
  ui: {
    humidity: 'hsl(210 83% 53%)',
    wind: 'hsl(188 94% 43%)',
    visibility: 'hsl(38 92% 50%)',
    sunrise: 'hsl(30 80% 65%)',
    sunset: 'hsl(260 75% 65%)',
    tempHigh: 'hsl(0 84% 60%)',
    tempLow: 'hsl(210 83% 53%)',
  },
  
  // UI Colors
  border: 'hsl(var(--border))',
  ring: 'hsl(var(--ring))',
  input: 'hsl(var(--input))',
} as const;

// Typography Tokens
export const typography = {
  fontFamily: {
    sans: ['var(--font-sans)'],
  },
  
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// Spacing Tokens
export const spacing = {
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
  
  // Mobile-specific spacing
  mobile: {
    xs: '1rem',    // 16px - minimum padding
    sm: '1.25rem', // 20px - comfortable padding
    md: '1.5rem',  // 24px - standard padding
    lg: '2rem',    // 32px - spacious padding
    xl: '2.5rem',  // 40px - extra spacious
  },
  
  // Touch target minimum (WCAG 2.2)
  touchTarget: {
    min: '44px',
    comfortable: '48px',
    spacious: '56px',
  },
} as const;

// Border Radius Tokens
export const borderRadius = {
  none: '0',
  sm: 'calc(var(--radius) - 12px)',
  md: 'calc(var(--radius) - 8px)',
  lg: 'calc(var(--radius) - 4px)',
  xl: 'var(--radius)',
  full: '9999px',
} as const;

// Shadow Tokens with Elevation System
export const shadows = {
  sm: 'var(--shadow-1)',
  md: 'var(--shadow-2)',
  lg: 'var(--shadow-3)',
  xl: 'var(--shadow-4)',
} as const;

// Elevation System (Material Design inspired)
export const elevation = {
  0: 'none',  // Flat - no shadow
  1: '0 1px 2px hsl(0 0% 0% / 0.06), 0 1px 3px hsl(0 0% 0% / 0.04)',  // Raised - subtle
  2: '0 4px 6px hsl(0 0% 0% / 0.07), 0 2px 4px hsl(0 0% 0% / 0.05)',  // Floating - medium
  3: '0 10px 15px hsl(0 0% 0% / 0.1), 0 4px 6px hsl(0 0% 0% / 0.05)', // Modal - strong
  4: '0 20px 25px hsl(0 0% 0% / 0.15), 0 8px 10px hsl(0 0% 0% / 0.06)', // Overlay - very strong
} as const;

// Icon Size System
export const iconSizes = {
  xs: '0.75rem',   // 12px - very small icons
  sm: '1rem',      // 16px - small icons
  md: '1.25rem',   // 20px - standard icons
  lg: '1.5rem',    // 24px - large icons
  xl: '2rem',      // 32px - extra large icons
  '2xl': '2.5rem', // 40px - hero icons
  '3xl': '3rem',   // 48px - feature icons
  '4xl': '4rem',   // 64px - display icons
} as const;

// Animation Tokens
export const animations = {
  duration: {
    instant: '100ms',
    fast: '150ms',
    normal: '200ms',
    medium: '300ms',
    slow: '400ms',
    slower: '600ms',
  },
  
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    slideUp: {
      from: { transform: 'translateY(10px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    scaleIn: {
      from: { transform: 'scale(0.95)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
  },
} as const;

// Breakpoint Tokens
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-Index Tokens
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: '2rem',      // 32px
      md: '2.75rem',   // 44px - touch target compliant
      lg: '3rem',      // 48px - comfortable touch
    },
    padding: {
      sm: '0.5rem 1rem',
      md: '0.75rem 1.5rem',
      lg: '1rem 2rem',
    },
  },
  
  input: {
    height: {
      sm: '2.5rem',    // 40px
      md: '2.75rem',   // 44px - touch target compliant
      lg: '3rem',      // 48px - comfortable touch
    },
    padding: {
      sm: '0.5rem 0.75rem',
      md: '0.75rem 1rem',
      lg: '1rem 1.25rem',
    },
  },
  
  card: {
    padding: {
      sm: '1rem',      // 16px
      md: '1.5rem',    // 24px
      lg: '2rem',      // 32px
    },
  },
  
  // Grid System
  grid: {
    columns: {
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      12: '12',
    },
    gap: {
      xs: '0.5rem',   // 8px
      sm: '0.75rem',  // 12px
      md: '1rem',     // 16px
      lg: '1.5rem',   // 24px
      xl: '2rem',     // 32px
    },
  },
} as const;

// RTL Support Tokens
export const rtl = {
  direction: {
    ltr: 'ltr',
    rtl: 'rtl',
  },
  
  textAlign: {
    left: 'left',
    right: 'right',
    start: 'start',
    end: 'end',
  },
} as const;

// Export all tokens as a single object
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  elevation,
  iconSizes,
  animations,
  breakpoints,
  zIndex,
  components,
  rtl,
} as const;

export type DesignTokens = typeof tokens;
