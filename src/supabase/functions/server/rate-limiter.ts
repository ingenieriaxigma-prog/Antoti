/**
 * =====================================================
 * RATE LIMITER MIDDLEWARE
 * =====================================================
 * 
 * Middleware para limitar el número de requests por IP/usuario.
 * Previene ataques DoS y controla costos de APIs externas.
 * 
 * USO:
 * app.use('/api/*', rateLimiter({ windowMs: 60000, maxRequests: 100 }));
 * 
 * =====================================================
 */

interface RateLimitConfig {
  windowMs: number;        // Ventana de tiempo en milisegundos
  maxRequests: number;     // Máximo de requests en la ventana
  message?: string;        // Mensaje de error personalizado
  keyGenerator?: (c: any) => string;  // Función para generar la key
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Store en memoria para tracking de requests
// En producción real, usar Redis o similar para múltiples instancias
const requestStore = new Map<string, RateLimitEntry>();

// Cleanup automático cada 5 minutos
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, entry] of requestStore.entries()) {
    if (now >= entry.resetAt) {
      requestStore.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Rate limiter: Cleaned ${cleaned} expired entries`);
  }
}, 5 * 60 * 1000); // 5 minutos

/**
 * Rate limiter middleware
 */
export function rateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too Many Requests',
    keyGenerator = defaultKeyGenerator,
  } = config;

  return async (c: any, next: any) => {
    // Generar key única para este cliente
    const key = keyGenerator(c);
    const now = Date.now();

    // Obtener o crear entrada en el store
    let entry = requestStore.get(key);

    if (!entry || now >= entry.resetAt) {
      // Nueva ventana de tiempo
      entry = {
        count: 1,
        resetAt: now + windowMs,
      };
      requestStore.set(key, entry);
    } else {
      // Dentro de la ventana de tiempo
      entry.count++;

      if (entry.count > maxRequests) {
        // Rate limit excedido
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        
        console.warn(`⚠️  Rate limit exceeded for ${key}`);
        console.warn(`   Requests: ${entry.count}/${maxRequests}`);
        console.warn(`   Retry after: ${retryAfter}s`);

        return c.json(
          {
            error: message,
            message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            retryAfter,
            limit: maxRequests,
            remaining: 0,
            reset: Math.floor(entry.resetAt / 1000),
          },
          429,
          {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.floor(entry.resetAt / 1000).toString(),
          }
        );
      }
    }

    // Agregar headers de rate limit
    const remaining = Math.max(0, maxRequests - entry.count);
    
    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', Math.floor(entry.resetAt / 1000).toString());

    await next();
  };
}

/**
 * Generador de key por defecto (usa IP)
 */
function defaultKeyGenerator(c: any): string {
  // Intentar obtener IP real del cliente
  const ip = 
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    c.req.header('cf-connecting-ip') ||
    'unknown';
  
  return `ip:${ip}`;
}

/**
 * Generador de key por usuario (requiere autenticación)
 */
export function userKeyGenerator(c: any): string {
  const userId = c.get('userId');
  return userId ? `user:${userId}` : defaultKeyGenerator(c);
}

/**
 * Generador de key por endpoint + IP
 */
export function endpointKeyGenerator(c: any): string {
  const ip = defaultKeyGenerator(c);
  const endpoint = c.req.path;
  return `${ip}:${endpoint}`;
}

/**
 * Presets de configuración comunes
 */
export const RateLimitPresets = {
  // Límite general para toda la API
  global: {
    windowMs: 60 * 1000,      // 1 minuto
    maxRequests: 100,         // 100 requests/minuto
    message: 'Too many requests, please slow down',
  },

  // Límite estricto para endpoints de IA (costosos)
  ai: {
    windowMs: 60 * 1000,      // 1 minuto
    maxRequests: 10,          // 10 requests/minuto
    message: 'AI endpoint rate limit exceeded',
  },

  // Límite para autenticación (prevenir brute force)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,           // 5 intentos cada 15 min
    message: 'Too many login attempts',
  },

  // Límite para uploads
  upload: {
    windowMs: 60 * 1000,      // 1 minuto
    maxRequests: 5,           // 5 uploads/minuto
    message: 'Upload rate limit exceeded',
  },

  // Límite para admin endpoints
  admin: {
    windowMs: 60 * 1000,      // 1 minuto
    maxRequests: 20,          // 20 requests/minuto
    message: 'Admin endpoint rate limit exceeded',
  },
};

/**
 * Helper: Limpiar store manualmente (útil para testing)
 */
export function clearRateLimitStore(): void {
  requestStore.clear();
  console.log('🧹 Rate limit store cleared');
}

/**
 * Helper: Obtener estadísticas del rate limiter
 */
export function getRateLimitStats() {
  return {
    totalEntries: requestStore.size,
    entries: Array.from(requestStore.entries()).map(([key, entry]) => ({
      key,
      count: entry.count,
      resetAt: new Date(entry.resetAt).toISOString(),
    })),
  };
}

// =====================================================
// EXPORTS
// =====================================================

export default rateLimiter;
