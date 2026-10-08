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
export const palette = {
  /**
   * Primario — cian de marca (#00ABE4). Escala 50–900.
   * `light` (50) y `dark` (700) se mantienen como alias retrocompatibles
   * con las clases ya existentes (bg-primary-light, text-primary-dark…).
   */
  primary: {
    50: '#E8F8FD',
    100: '#C7EEF9',
    200: '#94DFF3',
    300: '#5FD0EE',
    400: '#2FC1E9',
    500: '#00ABE4', // DEFAULT / marca
    600: '#0092C7',
    700: '#0078A6',
    800: '#005E85',
    900: '#004461',
    DEFAULT: '#00ABE4',
    light: '#E8F8FD',
    dark: '#0078A6',
  },

  /**
   * Acento — ámbar, para precios, CTA secundarios y highlights.
   */
  accent: {
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
    DEFAULT: '#F59E0B',
    light: '#FFF8E6',
    dark: '#B45309',
  },

  /** Semánticos de estado (flujos, badges, toasts). */
  success: { DEFAULT: '#10B981', light: '#D1FAE5', dark: '#047857' },
  warning: { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#B45309' },
  danger: { DEFAULT: '#EF4444', light: '#FEE2E2', dark: '#B91C1C' },

  /** Superficies y tinta (los neutros de texto siguen siendo `slate-*`). */
  background: '#FFFFFF',
  surface: '#F8FAFC',
} as const;

export type Palette = typeof palette;
