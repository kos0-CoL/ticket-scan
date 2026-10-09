/**
 * Paleta de colores de TicketScan — fuente única de verdad.
 *
 * La importan los tailwind.config.ts de apps/admin y apps/mobile para que
 * el panel de administración y el dashboard de usuarios hablen el mismo
 * idioma visual. Mantener ambos configs idénticos.
 *
 * Uso en clases Tailwind:
 *   bg-primary / text-primary / border-primary-light / bg-accent-500 ...
 */

// Tailwind-compatible color scales (50-950)
const primaryScale = {
  50: '#E8F8FD',
  100: '#C7EEF9',
  200: '#94DFF3',
  300: '#5FD0EE',
  400: '#2FC1E9',
  500: '#00ABE4',
  600: '#0092C7',
  700: '#0078A6',
  800: '#005E85',
  900: '#004461',
  950: '#002B3F',
  DEFAULT: '#00ABE4',
} as const;

const accentScale = {
  50: '#FFF8E6',
  100: '#FFEEC2',
  200: '#FFDD8A',
  300: '#FFC94F',
  400: '#FFB61F',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
  950: '#451A03',
  DEFAULT: '#F59E0B',
} as const;

const successScale = {
  50: '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  300: '#6EE7B7',
  400: '#34D399',
  500: '#10B981',
  600: '#059669',
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
  950: '#022C22',
  DEFAULT: '#10B981',
} as const;

const warningScale = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
  950: '#451A03',
  DEFAULT: '#F59E0B',
} as const;

const dangerScale = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
  950: '#450A0A',
  DEFAULT: '#EF4444',
} as const;

const neutralScale = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
  950: '#020617',
} as const;

export const palette = {
  primary: primaryScale,
  accent: accentScale,
  success: successScale,
  warning: warningScale,
  danger: dangerScale,
  neutral: neutralScale,
  background: '#FFFFFF',
  surface: '#F8FAFC',
} as const;

export type Palette = typeof palette;

// Helper para tailwind.config.ts - devuelve colores en formato que Tailwind entiende
export function getTailwindColors() {
  return {
    primary: primaryScale,
    accent: accentScale,
    success: successScale,
    warning: warningScale,
    danger: dangerScale,
    neutral: neutralScale,
  };
}

// Tokens de diseño adicionales (espaciado, radios, sombras, transiciones, z-index)
export const designTokens = {
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  boxShadow: {
    sm: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
    md: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)',
    lg: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1)',
    xl: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
    '2xl': '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
    primary: '0 8px 30px -8px rgba(0, 171, 228, 0.25)',
    'primary-lg': '0 20px 60px -15px rgba(0, 171, 228, 0.35)',
    float: '0 10px 40px -10px rgba(0, 171, 228, 0.3)',
    'float-lg': '0 20px 60px -15px rgba(0, 171, 228, 0.4)',
    card: '0 2px 12px rgba(0, 0, 0, 0.06)',
    'card-hover': '0 8px 30px rgba(0, 0, 0, 0.1)',
  },
  transitionDuration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
  transitionTiming: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  zIndex: {
    dropdown: '100',
    sticky: '200',
    fixed: '300',
    'modal-backdrop': '400',
    modal: '500',
    popover: '600',
    tooltip: '700',
  },
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
} as const;

export type DesignTokens = typeof designTokens;
