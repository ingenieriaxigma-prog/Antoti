/**
 * useInitialLoading
 * 
 * Hook para detectar si los datos están cargando por primera vez.
 * Útil para mostrar skeletons solo en la carga inicial.
 */

import { useState, useEffect } from 'react';

export function useInitialLoading(delay: number = 500) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Después del delay, marcamos como no loading
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return isInitialLoading;
}

/**
 * useLoadingState
 * 
 * Hook más avanzado que maneja estados de loading con debounce
 * para evitar "flashes" de loading en operaciones rápidas
 */
export function useLoadingState(initialState: boolean = true, minLoadingTime: number = 300) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [startTime, setStartTime] = useState<number | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setStartTime(Date.now());
  };

  const stopLoading = () => {
    if (startTime) {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < minLoadingTime) {
        // Si fue muy rápido, esperamos el mínimo para evitar "flash"
        setTimeout(() => {
          setIsLoading(false);
          setStartTime(null);
        }, minLoadingTime - elapsed);
      } else {
        setIsLoading(false);
        setStartTime(null);
      }
    } else {
      setIsLoading(false);
    }
  };

  return { isLoading, startLoading, stopLoading };
}
