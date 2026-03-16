/**
 * Formatting Utilities
 * 
 * Centralized utilities for formatting numbers, dates, and currencies.
 * Ensures consistent formatting across the application.
 */

/**
 * Format currency in Colombian Pesos
 */
export function formatCurrency(amount: number, currency: string = 'COP'): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CO').format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date in Spanish (short format)
 * Example: "15 Nov 2025"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Format date in Spanish (long format)
 * Example: "15 de noviembre de 2025"
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Format date as relative time
 * Example: "hace 2 días", "hace 3 horas"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays > 0) {
    return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  } else if (diffInHours > 0) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffInMinutes > 0) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  } else {
    return 'hace un momento';
  }
}

/**
 * Format month name
 */
export function formatMonthName(month: number, format: 'long' | 'short' = 'long'): string {
  const date = new Date(2025, month, 1);
  return new Intl.DateTimeFormat('es-CO', { month: format }).format(date);
}

/**
 * Format month and year
 * Example: "Noviembre 2025"
 */
export function formatMonthYear(month: number, year: number): string {
  const monthName = formatMonthName(month, 'long');
  return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${year}`;
}

/**
 * Format day of week
 * Example: "Lunes", "Martes"
 */
export function formatDayOfWeek(date: Date | string, format: 'long' | 'short' = 'long'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-CO', { weekday: format }).format(d);
}

/**
 * Format time (24h format)
 * Example: "14:30"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/**
 * Format datetime
 * Example: "15 Nov 2025, 14:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDateShort(d)}, ${formatTime(d)}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format file size
 * Example: "1.5 MB", "500 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format account balance with sign
 * Positive: green, Negative: red
 */
export function formatBalanceWithSign(amount: number): { text: string; color: string } {
  const formatted = formatCurrency(Math.abs(amount));
  
  if (amount > 0) {
    return { text: `+${formatted}`, color: 'text-green-600' };
  } else if (amount < 0) {
    return { text: `-${formatted}`, color: 'text-red-600' };
  } else {
    return { text: formatted, color: 'text-gray-600' };
  }
}

/**
 * Compact large numbers
 * Example: 1500 -> "1.5K", 1000000 -> "1M"
 */
export function compactNumber(value: number): string {
  if (value < 1000) return value.toString();
  if (value < 1000000) return (value / 1000).toFixed(1) + 'K';
  if (value < 1000000000) return (value / 1000000).toFixed(1) + 'M';
  return (value / 1000000000).toFixed(1) + 'B';
}

/**
 * Format transaction type in Spanish
 */
export function formatTransactionType(type: 'income' | 'expense' | 'transfer'): string {
  const types = {
    income: 'Ingreso',
    expense: 'Gasto',
    transfer: 'Transferencia',
  };
  return types[type];
}

/**
 * Format budget period in Spanish
 */
export function formatBudgetPeriod(period: 'monthly' | 'yearly'): string {
  const periods = {
    monthly: 'Mensual',
    yearly: 'Anual',
  };
  return periods[period];
}

/**
 * Format account type in Spanish
 */
export function formatAccountType(type: 'cash' | 'bank' | 'card' | 'digital'): string {
  const types = {
    cash: 'Efectivo',
    bank: 'Banco',
    card: 'Tarjeta',
    digital: 'Digital',
  };
  return types[type];
}
