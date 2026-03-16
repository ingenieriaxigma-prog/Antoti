/**
 * Supabase Client Singleton
 * 
 * Cliente de Supabase que se inicializa una sola vez al cargar la aplicación.
 * Esto es CRÍTICO para OAuth, ya que el cliente necesita procesar el callback
 * inmediatamente al cargar la página.
 */

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Crear cliente Supabase una sola vez
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      // Detectar automáticamente la sesión de la URL después de OAuth
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // CRÍTICO: Usar flowType 'pkce' para que funcione OAuth en client-side
      flowType: 'pkce',
    }
  }
);