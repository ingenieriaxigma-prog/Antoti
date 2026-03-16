/**
 * useKeyboardScroll.ts - SCROLL TO INPUT WHEN KEYBOARD APPEARS
 * 
 * Soluciona el problema de iOS donde el teclado tapa los inputs
 * En Android no afecta (ya reduce viewport automáticamente)
 * 
 * COMPATIBILIDAD:
 * - iOS Safari: ✅ Hace scroll cuando teclado aparece (crítico)
 * - Chrome iOS: ✅ Mismo comportamiento
 * - Chrome Android: ✅ No afecta (viewport se reduce automáticamente)
 * - Samsung Internet: ✅ No afecta
 * - Desktop: ✅ No afecta
 */

import { useEffect } from 'react';

interface UseKeyboardScrollOptions {
  /**
   * Delay en ms antes de hacer scroll (esperar a que teclado aparezca)
   * @default 300
   */
  delay?: number;
  
  /**
   * Comportamiento del scroll
   * @default 'smooth'
   */
  behavior?: ScrollBehavior;
  
  /**
   * Posición del elemento en la ventana
   * @default 'center'
   */
  block?: ScrollLogicalPosition;
  
  /**
   * Habilitar/deshabilitar el handler
   * @default true
   */
  enabled?: boolean;
}

/**
 * Hook para hacer scroll automático cuando el teclado aparece
 * 
 * @example
 * ```tsx
 * function MyForm() {
 *   useKeyboardScroll();
 *   
 *   return (
 *     <input type="text" />
 *   );
 * }
 * ```
 */
export function useKeyboardScroll({
  delay = 300,
  behavior = 'smooth',
  block = 'center',
  enabled = true,
}: UseKeyboardScrollOptions = {}) {
  useEffect(() => {
    if (!enabled) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      
      // Solo hacer scroll para inputs, textareas y selects
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        // Limpiar timeout anterior si existe
        if (scrollTimeout) clearTimeout(scrollTimeout);
        
        // Esperar a que el teclado aparezca
        scrollTimeout = setTimeout(() => {
          target.scrollIntoView({
            behavior,
            block,
            inline: 'nearest',
          });
        }, delay);
      }
    };

    // Escuchar cuando cualquier elemento recibe foco
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [delay, behavior, block, enabled]);
}

/**
 * Hook para ajustar el viewport cuando el teclado virtual está activo
 * Útil para iOS donde el teclado es overlay
 * 
 * @returns Estado del teclado (true si está visible)
 */
export function useKeyboardVisible(): boolean {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    // Detectar cuando el viewport cambia (puede indicar teclado)
    const handleResize = () => {
      // En iOS, el teclado reduce window.innerHeight pero no visualViewport
      if (typeof window.visualViewport !== 'undefined') {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        
        // Si visualViewport es significativamente menor que window.innerHeight,
        // probablemente el teclado está visible
        setIsVisible(windowHeight - viewportHeight > 100);
      }
    };

    if (typeof window.visualViewport !== 'undefined') {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        window.visualViewport.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return isVisible;
}

// Import React for useState
import React from 'react';

export default useKeyboardScroll;
