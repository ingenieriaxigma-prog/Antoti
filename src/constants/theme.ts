/**
 * Theme Constants
 * 
 * Color schemes and theme configurations.
 */

export const THEME_COLORS = {
  default: { primary: '#3b82f6', secondary: '#8b5cf6' },
  blue: { primary: '#3b82f6', secondary: '#8b5cf6' },
  purple: { primary: '#8b5cf6', secondary: '#ec4899' },
  green: { primary: '#10b981', secondary: '#34d399' },
  orange: { primary: '#f59e0b', secondary: '#ef4444' },
  pink: { primary: '#ec4899', secondary: '#f97316' },
  teal: { primary: '#06b6d4', secondary: '#10b981' },
  christmas: { primary: '#c62828', secondary: '#2e7d32' },
  rainbow: { primary: '#ec4899', secondary: '#8b5cf6' },
} as const;

export const THEME_NAMES: Record<string, string> = {
  blue: 'Azul',
  green: 'Verde',
  purple: 'Morado',
  orange: 'Naranja',
  pink: 'Rosa',
  teal: 'Turquesa',
  christmas: 'Navidad',
  rainbow: 'Unisex',
};

/**
 * Profile Card Theme Decorations
 * 
 * Decorative elements and animations for each theme
 */
export const PROFILE_CARD_THEMES = {
  blue: {
    name: 'Azul',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    elements: ['💼', '💰', '📊', '💎'],
    positions: [
      { top: '10%', left: '15%', delay: 0, duration: 4 },
      { top: '60%', right: '10%', delay: 1, duration: 5 },
      { top: '30%', right: '20%', delay: 2, duration: 6 },
      { bottom: '15%', left: '25%', delay: 1.5, duration: 4.5 },
    ],
    effect: 'float', // bubbles, float, sparkle
  },
  green: {
    name: 'Verde',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    elements: ['🌱', '🌿', '💚', '📈'],
    positions: [
      { top: '15%', left: '10%', delay: 0, duration: 5 },
      { top: '50%', right: '15%', delay: 1.5, duration: 4 },
      { bottom: '20%', left: '20%', delay: 2, duration: 6 },
      { top: '35%', right: '25%', delay: 0.5, duration: 5.5 },
    ],
    effect: 'float',
  },
  purple: {
    name: 'Morado',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    elements: ['✨', '🚀', '💎', '⚡'],
    positions: [
      { top: '10%', left: '20%', delay: 0, duration: 3 },
      { top: '55%', right: '12%', delay: 1, duration: 4 },
      { bottom: '18%', left: '15%', delay: 2, duration: 3.5 },
      { top: '40%', right: '30%', delay: 1.5, duration: 4.5 },
    ],
    effect: 'sparkle',
  },
  orange: {
    name: 'Naranja',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
    elements: ['🔥', '⚡', '🎯', '💪'],
    positions: [
      { top: '12%', left: '18%', delay: 0, duration: 3.5 },
      { top: '58%', right: '8%', delay: 0.5, duration: 4 },
      { bottom: '22%', left: '22%', delay: 1.5, duration: 3 },
      { top: '38%', right: '28%', delay: 2, duration: 4.5 },
    ],
    effect: 'pulse',
  },
  pink: {
    name: 'Rosa',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    elements: ['💖', '🎨', '✨', '🦄'],
    positions: [
      { top: '8%', left: '12%', delay: 0, duration: 4 },
      { top: '62%', right: '18%', delay: 1, duration: 5 },
      { bottom: '12%', left: '28%', delay: 2, duration: 4.5 },
      { top: '42%', right: '22%', delay: 1.5, duration: 5.5 },
    ],
    effect: 'float',
  },
  teal: {
    name: 'Turquesa',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
    elements: ['💵', '💎', '🌊', '📱'],
    positions: [
      { top: '14%', left: '16%', delay: 0, duration: 5 },
      { top: '52%', right: '14%', delay: 1.5, duration: 4.5 },
      { bottom: '16%', left: '24%', delay: 2, duration: 5.5 },
      { top: '36%', right: '26%', delay: 0.5, duration: 4 },
    ],
    effect: 'float',
  },
  christmas: {
    name: 'Navidad',
    gradient: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 40%, #0ea5e9 70%, #0284c7 100%)',
    elements: ['❄️', '⭐', '🎄', '🎁', '❄️', '✨', '⛄', '🎅'],
    positions: [
      { top: '5%', left: '8%', delay: 0, duration: 6 },
      { top: '15%', right: '10%', delay: 1, duration: 5 },
      { top: '45%', left: '5%', delay: 1.5, duration: 5.5 },
      { bottom: '25%', right: '8%', delay: 2, duration: 6 },
      { top: '35%', right: '25%', delay: 0.5, duration: 5 },
      { bottom: '15%', left: '15%', delay: 2.5, duration: 4.5 },
      { top: '65%', right: '15%', delay: 1.8, duration: 5.5 },
      { bottom: '40%', left: '20%', delay: 3, duration: 6 },
    ],
    effect: 'float', // Snow falling effect
  },
  rainbow: {
    name: 'Unisex',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
    elements: ['🧡', '💛', '💚', '💙', '💜', '🤍'],
    positions: [
      { top: '8%', left: '8%', delay: 0, duration: 4 },
      { top: '25%', right: '8%', delay: 0.5, duration: 4.5 },
      { top: '45%', left: '12%', delay: 1, duration: 5 },
      { top: '65%', right: '15%', delay: 1.5, duration: 4 },
      { bottom: '10%', left: '18%', delay: 2, duration: 5.5 },
      { top: '35%', right: '22%', delay: 2.5, duration: 4.5 },
    ],
    effect: 'sparkle',
  },
} as const;

export const CURRENCY_OPTIONS = [
  { code: 'COP', symbol: '$', name: 'Peso Colombiano', locale: 'es-CO' },
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano', locale: 'es-MX' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino', locale: 'es-AR' },
] as const;

export const DEFAULT_CURRENCY = {
  code: 'COP',
  symbol: '$',
  name: 'Peso Colombiano',
  locale: 'es-CO',
} as const;