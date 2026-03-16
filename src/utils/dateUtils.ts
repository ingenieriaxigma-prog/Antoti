/**
 * 🇨🇴 COLOMBIA TIMEZONE UTILITIES
 * 
 * Sistema de manejo de fechas usando la zona horaria oficial de Colombia
 * según el estándar IANA Time Zone Database: America/Bogota (UTC-5)
 * 
 * ⚠️ CRÍTICO: Siempre usar estas funciones en lugar de:
 * - new Date().toISOString().split('T')[0] ❌
 * - new Date().getDate() ❌
 * 
 * ✅ USAR: getTodayLocalDate() para obtener fecha actual
 */

/**
 * Parse a date string in YYYY-MM-DD format to a Date object in local timezone
 * This avoids the common timezone issue where "2025-11-01" becomes Oct 31 in UTC-5
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get current date in YYYY-MM-DD format in COLOMBIA timezone (America/Bogota)
 * 
 * ⚠️ CRITICAL: Always use this instead of new Date().toISOString().split('T')[0]
 * because toISOString() uses UTC which can be a different day in Colombia (UTC-5)
 * 
 * 🇨🇴 Esta función usa explícitamente la zona horaria de Colombia (America/Bogota)
 * del estándar IANA Time Zone Database, que es público y soportado por todos
 * los navegadores modernos.
 * 
 * @returns {string} Fecha en formato YYYY-MM-DD (ej: "2025-11-30")
 * 
 * @example
 * // Hora en Colombia: 7:36 PM del domingo 30 nov 2025
 * const today = getTodayLocalDate();
 * console.log(today); // "2025-11-30" ✅
 * 
 * // Método incorrecto (NO USAR):
 * const wrong = new Date().toISOString().split('T')[0];
 * console.log(wrong); // "2025-12-01" ❌ (1 día adelante por UTC)
 */
export function getTodayLocalDate(): string {
  const now = new Date();
  
  // Obtener fecha en zona horaria de Colombia usando Intl API
  // Usar locale 'en-CA' porque formatea fechas como YYYY-MM-DD automáticamente
  const colombiaFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  // Formatear devuelve YYYY-MM-DD directamente con locale 'en-CA'
  return colombiaFormatter.format(now);
}

/**
 * Get current time in Colombia timezone
 * Returns a full Date object adjusted to Colombia timezone
 * 
 * @returns {Date} Date object con hora de Colombia
 * 
 * @example
 * const colombiaTime = getColombiaTime();
 * console.log(colombiaTime.getHours()); // Hora actual en Colombia
 */
export function getColombiaTime(): Date {
  const now = new Date();
  
  // Obtener los componentes de fecha/hora en zona horaria de Colombia
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const getValue = (type: string) => parts.find(p => p.type === type)?.value || '0';
  
  return new Date(
    parseInt(getValue('year')),
    parseInt(getValue('month')) - 1,
    parseInt(getValue('day')),
    parseInt(getValue('hour')),
    parseInt(getValue('minute')),
    parseInt(getValue('second'))
  );
}

/**
 * Get timezone information for Colombia
 * Returns metadata about the Colombia timezone
 * 
 * @returns Información de zona horaria de Colombia
 * 
 * @example
 * const info = getColombiaTimezoneInfo();
 * console.log(info.timezone); // "America/Bogota"
 * console.log(info.utcOffset); // "UTC-5"
 */
export function getColombiaTimezoneInfo() {
  return {
    timezone: 'America/Bogota',
    utcOffset: 'UTC-5',
    country: 'Colombia',
    observesDST: false, // Colombia no observa horario de verano desde 1993
    ianaStandard: true,
    description: 'Zona horaria oficial de Colombia según estándar IANA',
  };
}

/**
 * Format a date string or Date object to local date string
 * This is safe to use with YYYY-MM-DD strings
 * 
 * @param date - Fecha en formato string (YYYY-MM-DD) o Date object
 * @param options - Opciones de formato (Intl.DateTimeFormatOptions)
 * @returns Fecha formateada como string
 * 
 * @example
 * formatLocalDate('2025-11-30'); 
 * // "30/11/2025"
 * 
 * formatLocalDate('2025-11-30', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
 * // "domingo, 30 de noviembre de 2025"
 */
export function formatLocalDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? parseLocalDate(date) : date;
  return dateObj.toLocaleDateString('es-ES', options);
}

/**
 * Format a date string to Colombia timezone with custom format
 * 
 * @param date - Fecha como Date object o string
 * @param format - Formato: 'full' | 'date' | 'time' | 'datetime'
 * @returns Fecha formateada en zona horaria de Colombia
 * 
 * @example
 * formatDateInColombia(new Date(), 'full');
 * // "domingo, 30 de noviembre de 2025, 19:36:42"
 * 
 * formatDateInColombia(new Date(), 'date');
 * // "30 de noviembre de 2025"
 * 
 * formatDateInColombia(new Date(), 'time');
 * // "19:36:42"
 * 
 * formatDateInColombia(new Date(), 'datetime');
 * // "30 nov 2025, 19:36"
 */
export function formatDateInColombia(
  date: Date | string,
  format: 'full' | 'date' | 'time' | 'datetime' = 'date'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const formats: Record<typeof format, Intl.DateTimeFormatOptions> = {
    full: {
      timeZone: 'America/Bogota',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    },
    date: {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    time: {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    },
    datetime: {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  };
  
  return dateObj.toLocaleString('es-CO', formats[format]);
}

/**
 * Format distance to now (e.g., "hace 5 minutos", "hace 2 horas")
 * 
 * @param dateString - Fecha en formato ISO string
 * @returns Texto descriptivo de tiempo relativo
 * 
 * @example
 * formatDistanceToNow('2025-11-30T19:30:00');
 * // "Hace 6 min" (si son las 19:36)
 */
export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Ahora';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Hace ${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Hace ${diffInDays}d`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `Hace ${diffInWeeks}sem`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `Hace ${diffInMonths}mes`;
  }

  return formatLocalDate(dateString, { day: 'numeric', month: 'short', year: 'numeric' });
}
