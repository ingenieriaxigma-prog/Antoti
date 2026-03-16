/**
 * =====================================================
 * AUTH HELPERS - Production Ready
 * =====================================================
 * 
 * Funciones auxiliares para autenticación y autorización.
 * Centralizadas para reutilización y seguridad.
 * 
 * =====================================================
 */

import { createClient } from "npm:@supabase/supabase-js@2";

// =====================================================
// SUPER USER CONFIGURATION
// =====================================================

const SUPER_USERS = (Deno.env.get('SUPER_USER_EMAILS') || 
  'ingenieriaxigma@gmail.com,ingenieriaxima@gmail.com')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

console.log('🔐 Super users configured:', SUPER_USERS.length);

/**
 * Check if user is super user
 */
export function isSuperUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_USERS.includes(email.toLowerCase());
}

/**
 * Verify user authentication from request header
 */
export async function verifyUser(authHeader: string | undefined) {
  const accessToken = authHeader?.split(' ')[1];
  
  if (!accessToken) {
    return { error: 'No autorizado', status: 401 };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user || !user.email) {
    return { error: 'Sesión inválida', status: 401 };
  }

  return { userId: user.id, email: user.email };
}

/**
 * Verify super user authentication
 */
export async function verifySuperUser(authHeader: string | undefined) {
  const accessToken = authHeader?.split(' ')[1];
  
  if (!accessToken) {
    return { error: 'No autorizado', status: 401 };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user || !user.email) {
    return { error: 'Sesión inválida', status: 401 };
  }

  if (!isSuperUser(user.email)) {
    console.warn('⚠️ Unauthorized admin access attempt');
    return { error: 'No tienes permisos de administrador', status: 403 };
  }

  return { userId: user.id, email: user.email };
}

/**
 * Create Supabase client with ANON key
 */
export function createAnonClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
}

/**
 * Create Supabase client with SERVICE ROLE key (admin)
 */
export function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}
