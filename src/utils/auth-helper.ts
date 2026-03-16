/**
 * Auth Helper Utilities
 * 
 * Funciones centralizadas para manejar errores de autenticación
 */

import { toast } from 'sonner@2.0.3';

// Evento personalizado para notificar al AuthContext
const AUTH_CLEAR_EVENT = 'auth:cleared';

/**
 * Limpia todos los datos de autenticación sin recargar
 * El AuthContext detectará el cambio y redirigirá al login automáticamente
 */
export function clearAuthAndReload(message?: string) {
  console.log('🔴 [Auth] Limpiando autenticación - token inválido detectado');
  
  // Limpiar todos los datos de autenticación
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUser');
  
  // Mostrar mensaje al usuario
  if (message) {
    toast.error(message, { duration: 5000 });
  }
  
  // Disparar evento personalizado para que AuthContext lo detecte
  window.dispatchEvent(new CustomEvent(AUTH_CLEAR_EVENT, { detail: { message } }));
  
  // localStorage cleared
}

/**
 * Maneja respuestas 401 de la API
 */
export function handle401Response(errorData?: any) {
  console.error('🔴 [Auth] Recibido error 401:', errorData);
  
  // Si el error indica que el usuario no existe, usar mensaje específico
  if (errorData?.userNotFound) {
    clearAuthAndReload('Tu cuenta fue eliminada. Por favor inicia sesión nuevamente.');
  } else {
    clearAuthAndReload('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
  }
}

/**
 * Wrapper para fetch que maneja automáticamente errores 401
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, options);
  
  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({}));
    handle401Response(errorData);
    throw new Error('Unauthorized');
  }
  
  return response;
}