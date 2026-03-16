/**
 * i18n Configuration
 * 
 * Configuración de internacionalización SIN dependencias externas
 * Soporta: Español, English, Português
 * Ahora usa Context API nativo de React
 */

// Idiomas soportados
export const SUPPORTED_LANGUAGES = {
  es: { name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
  pt: { name: 'Português', flag: '🇧🇷', nativeName: 'Português' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Monedas soportadas
export const SUPPORTED_CURRENCIES = {
  COP: { name: 'Peso Colombiano', symbol: '$', flag: '🇨🇴', locale: 'es-CO' },
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸', locale: 'en-US' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺', locale: 'es-ES' },
  BRL: { name: 'Real Brasileiro', symbol: 'R$', flag: '🇧🇷', locale: 'pt-BR' },
  MXN: { name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽', locale: 'es-MX' },
  ARS: { name: 'Peso Argentino', symbol: '$', flag: '🇦🇷', locale: 'es-AR' },
  CLP: { name: 'Peso Chileno', symbol: '$', flag: '🇨🇱', locale: 'es-CL' },
  PEN: { name: 'Sol Peruano', symbol: 'S/', flag: '🇵🇪', locale: 'es-PE' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧', locale: 'en-GB' },
} as const;

export type SupportedCurrency = keyof typeof SUPPORTED_CURRENCIES;

/**
 * Hook personalizado para formatear moneda
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'COP'
): string {
  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Hook personalizado para formatear números
 */
export function formatNumber(
  value: number,
  locale: string = 'es-CO'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Hook personalizado para formatear fechas
 */
export function formatDate(
  date: Date | string,
  locale: string = 'es-CO',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

/**
 * Hook personalizado para formatear fecha relativa (ej: "hace 2 días")
 */
export function formatRelativeDate(
  date: Date | string,
  locale: string = 'es-CO'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return locale.startsWith('es') ? 'Hoy' : locale.startsWith('pt') ? 'Hoje' : 'Today';
  } else if (diffDays === 1) {
    return locale.startsWith('es') ? 'Ayer' : locale.startsWith('pt') ? 'Ontem' : 'Yesterday';
  } else if (diffDays < 7) {
    return locale.startsWith('es') 
      ? `Hace ${diffDays} días`
      : locale.startsWith('pt')
      ? `Há ${diffDays} dias`
      : `${diffDays} days ago`;
  } else {
    return formatDate(dateObj, locale, { month: 'short', day: 'numeric' });
  }
}