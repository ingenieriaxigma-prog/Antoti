/**
 * =====================================================
 * APP CONFIGURATION
 * =====================================================
 * 
 * Configuración central de la aplicación.
 * Todas las variables de entorno se leen aquí.
 * 
 * =====================================================
 */

// =====================================================
// ENVIRONMENT
// =====================================================

export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE || 'development',
};

// =====================================================
// APP INFO
// =====================================================

export const APP = {
  name: import.meta.env.VITE_APP_NAME || 'Oti Finanzas',
  version: import.meta.env.VITE_APP_VERSION || '3.1.0',
  description: 'Tu Asistente Financiero Personal con IA',
};

// =====================================================
// SUPABASE
// =====================================================

export const SUPABASE = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

// =====================================================
// OPENAI
// =====================================================

export const OPENAI = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
};

// =====================================================
// SUPER USERS
// =====================================================

export const ADMIN = {
  superUsers: (import.meta.env.VITE_SUPER_USER_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean),
};

// =====================================================
// SENTRY (Error Tracking)
// =====================================================

export const SENTRY = {
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  enabled: !!import.meta.env.VITE_SENTRY_DSN && ENV.isProduction,
};

// =====================================================
// ANALYTICS
// =====================================================

export const ANALYTICS = {
  gaId: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
  enabled: !!import.meta.env.VITE_GA_MEASUREMENT_ID && ENV.isProduction,
};

// =====================================================
// FEATURE FLAGS
// =====================================================

export const FEATURES = {
  familyFinances: import.meta.env.VITE_FEATURE_FAMILY_FINANCES !== 'false',
  otiChat: import.meta.env.VITE_FEATURE_OTI_CHAT !== 'false',
  bankUpload: import.meta.env.VITE_FEATURE_BANK_UPLOAD !== 'false',
  taxModule: import.meta.env.VITE_FEATURE_TAX_MODULE === 'true',
};

// =====================================================
// RATE LIMITING (Client-side hints)
// =====================================================

export const RATE_LIMITS = {
  // Límites por minuto
  globalRequests: 100,
  aiRequests: 10,
  uploadRequests: 5,
};

// =====================================================
// VALIDATION
// =====================================================

// Validar configuración crítica en desarrollo
if (ENV.isDevelopment) {
  const missing: string[] = [];
  
  if (!SUPABASE.url) missing.push('VITE_SUPABASE_URL');
  if (!SUPABASE.anonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
    console.warn('   Create a .env file with these variables');
  }
}

// =====================================================
// HELPER: Check if feature is enabled
// =====================================================

export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature];
}

// =====================================================
// HELPER: Check if user is super admin
// =====================================================

export function isSuperUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN.superUsers.includes(email.toLowerCase());
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  ENV,
  APP,
  SUPABASE,
  OPENAI,
  ADMIN,
  SENTRY,
  ANALYTICS,
  FEATURES,
  RATE_LIMITS,
  isFeatureEnabled,
  isSuperUser,
};
