/**
 * useBackButton.ts - ANDROID BACK BUTTON HANDLER
 * 
 * Custom hook para manejar el botón/gesture "Back" de Android
 * Compatible con iOS (no afecta), funcional en Android
 * 
 * COMPATIBILIDAD:
 * - Android: ✅ Maneja botón físico y gesture back
 * - iOS: ✅ No interfiere (no tiene botón back)
 * - Desktop: ✅ Maneja navegador back button
 */

import { useEffect, useCallback } from 'react';

interface UseBackButtonOptions {
  /**
   * Callback ejecutado cuando se presiona back
   * @returns true para prevenir comportamiento default, false para permitirlo
   */
  onBack: () => boolean;
  
  /**
   * Habilitar/deshabilitar el handler
   * @default true
   */
  enabled?: boolean;
}

/**
 * Hook para manejar el botón back de Android y navegador
 * 
 * @example
 * ```tsx
 * // En una pantalla que NO es la principal
 * useBackButton({
 *   onBack: () => {
 *     onNavigate('dashboard');
 *     return true; // Previene salir de la app
 *   }
 * });
 * 
 * // En la pantalla principal (dashboard)
 * useBackButton({
 *   onBack: () => {
 *     return false; // Permite salir de la app
 *   }
 * });
 * ```
 */
export function useBackButton({ onBack, enabled = true }: UseBackButtonOptions) {
  const handleBackButton = useCallback((event: PopStateEvent) => {
    if (!enabled) return;
    
    const shouldPreventDefault = onBack();
    
    if (shouldPreventDefault) {
      // Prevenir navegación del navegador
      event.preventDefault();
      
      // Restaurar estado actual (no navegar hacia atrás)
      window.history.pushState(null, '', window.location.pathname);
    }
  }, [onBack, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Agregar estado inicial al history
    // Esto permite detectar cuando el usuario presiona back
    window.history.pushState(null, '', window.location.pathname);

    // Escuchar evento popstate (disparado por back button)
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [handleBackButton, enabled]);
}

/**
 * Hook simplificado para pantallas secundarias
 * Navega automáticamente a una pantalla específica al presionar back
 * 
 * @example
 * ```tsx
 * useBackNavigation('dashboard', onNavigate);
 * ```
 */
export function useBackNavigation(
  targetScreen: string,
  onNavigate: (screen: string) => void,
  enabled: boolean = true
) {
  useBackButton({
    onBack: () => {
      onNavigate(targetScreen);
      return true; // Previene salir de la app
    },
    enabled,
  });
}

/**
 * Hook para pantallas principales (permite salir de app)
 * 
 * @example
 * ```tsx
 * // En Dashboard (pantalla principal)
 * useMainScreenBack();
 * ```
 */
export function useMainScreenBack() {
  useBackButton({
    onBack: () => {
      // No prevenir - permite salir de la app
      return false;
    },
  });
}

export default useBackButton;
