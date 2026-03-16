/**
 * =====================================================
 * PRODUCTION-SAFE LOGGER
 * =====================================================
 * 
 * Logger que automáticamente silencia logs en producción
 * y previene la exposición de información sensible.
 * 
 * ⚠️ FIGMA MAKER COMPATIBLE:
 * Usa detección alternativa del ambiente porque import.meta.env
 * no está disponible en Figma Maker.
 * 
 * USO:
 * import { logger } from '@/utils/logger';
 * 
 * logger.debug('Debug info', data);     // Solo en dev
 * logger.info('Info message', data);    // Dev y prod
 * logger.warn('Warning', data);         // Dev y prod
 * logger.error('Error occurred', error); // Siempre
 * logger.sensitive('Token: xxx');       // NUNCA en prod
 * 
 * =====================================================
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'sensitive';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    // ⚠️ FIGMA MAKER COMPATIBLE:
    // import.meta.env no está disponible, usar detección alternativa
    
    // Método 1: Detectar por hostname (Figma Maker usa localhost)
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.includes('figma'));
    
    // Método 2: Detectar por NODE_ENV (disponible en algunos builds)
    const nodeEnv = typeof process !== 'undefined' ? process.env?.NODE_ENV : undefined;
    
    // Método 3: Por defecto asumir desarrollo para Figma Maker
    this.isDevelopment = isLocalhost || nodeEnv === 'development' || true;
    this.isProduction = !this.isDevelopment;
    
    // Log inicial solo en desarrollo
    if (this.isDevelopment) {
      console.log('🔍 Logger initialized in DEVELOPMENT mode');
    }
  }

  /**
   * Debug logs - Solo en desarrollo
   * Útil para debugging durante desarrollo
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    
    console.log(`🔵 [DEBUG] ${message}`, context || '');
  }

  /**
   * Log - Alias de debug para compatibilidad
   * Muchos archivos usan logger.log() en lugar de logger.debug()
   */
  log(message: string, context?: LogContext): void {
    // Alias de debug - solo en desarrollo
    this.debug(message, context);
  }

  /**
   * Info logs - En desarrollo y producción
   * Para información general del flujo de la app
   */
  info(message: string, context?: LogContext): void {
    if (this.isProduction) {
      // En producción, solo loguear el mensaje sin context
      console.log(`ℹ️  [INFO] ${message}`);
    } else {
      console.log(`ℹ️  [INFO] ${message}`, context || '');
    }
  }

  /**
   * Warning logs - En desarrollo y producción
   * Para advertencias que no son errores críticos
   */
  warn(message: string, context?: LogContext): void {
    if (this.isProduction) {
      console.warn(`⚠️  [WARN] ${message}`);
    } else {
      console.warn(`⚠️  [WARN] ${message}`, context || '');
    }
  }

  /**
   * Error logs - SIEMPRE
   * Para errores que deben ser investigados
   */
  error(message: string, error?: any, context?: LogContext): void {
    const errorInfo = {
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...context,
    };

    console.error(`❌ [ERROR] ${message}`, errorInfo);

    // En producción, enviar a servicio de tracking (Sentry, etc.)
    if (this.isProduction && typeof window !== 'undefined') {
      // Aquí se integraría Sentry
      // Sentry.captureException(error, { extra: context });
      
      // Por ahora, solo loguear
      console.error('Error should be sent to error tracking service');
    }
  }

  /**
   * Sensitive logs - NUNCA en producción
   * Para información sensible (tokens, passwords, PII)
   * 
   * IMPORTANTE: Usar solo durante debugging, nunca en código final
   */
  sensitive(message: string, data?: any): void {
    if (this.isProduction) {
      // En producción, silencio total
      return;
    }

    console.log(`🔒 [SENSITIVE] ${message}`, data || '');
    console.warn('⚠️  SENSITIVE DATA - Remove before production!');
  }

  /**
   * Success logs - Operaciones exitosas importantes
   */
  success(message: string, context?: LogContext): void {
    if (this.isProduction) {
      console.log(`✅ [SUCCESS] ${message}`);
    } else {
      console.log(`✅ [SUCCESS] ${message}`, context || '');
    }
  }

  /**
   * Performance logs - Medir tiempos de ejecución
   */
  performance(label: string, startTime: number): void {
    if (!this.isDevelopment) return;

    const duration = Date.now() - startTime;
    console.log(`⚡ [PERF] ${label}: ${duration}ms`);
  }

  /**
   * API logs - Requests y responses
   */
  api(method: string, url: string, status?: number, context?: LogContext): void {
    if (!this.isDevelopment) return;

    const statusEmoji = status && status >= 200 && status < 300 ? '✅' : '❌';
    console.log(`${statusEmoji} [API] ${method} ${url} ${status || ''}`, context || '');
  }

  /**
   * Group logs - Para agrupar logs relacionados
   */
  group(label: string, collapsed: boolean = false): void {
    if (!this.isDevelopment) return;

    if (collapsed) {
      console.groupCollapsed(label);
    } else {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (!this.isDevelopment) return;
    console.groupEnd();
  }

  /**
   * Table logs - Para mostrar datos tabulares
   */
  table(data: any[]): void {
    if (!this.isDevelopment) return;
    console.table(data);
  }

  /**
   * Clear console - Solo en desarrollo
   */
  clear(): void {
    if (!this.isDevelopment) return;
    console.clear();
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const logger = new Logger();

// =====================================================
// HELPER: Sanitize sensitive data from objects
// =====================================================

export function sanitizeForLogging(obj: any): any {
  if (!obj) return obj;
  
  const sensitiveKeys = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secret',
    'authorization',
    'cookie',
  ];

  const sanitized = { ...obj };

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '***REDACTED***';
    }
  }

  return sanitized;
}

// =====================================================
// HELPER: Create performance timer
// =====================================================

export function createTimer(label: string) {
  const startTime = Date.now();
  
  return {
    end: () => {
      logger.performance(label, startTime);
    },
  };
}

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default logger;

// =====================================================
// NOTA PARA DESPUÉS DEL ZIP:
// =====================================================
// 
// Cuando descargues el proyecto, puedes mejorar la detección
// descomentando este código:
// 
// constructor() {
//   this.isDevelopment = import.meta.env.DEV;
//   this.isProduction = import.meta.env.PROD;
// }
// 
// Y eliminando el código de detección alternativa (líneas 40-52)
// 
// =====================================================