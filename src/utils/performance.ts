/**
 * Performance Utilities
 * 
 * Helper functions para optimizar el rendimiento de la aplicación
 */

/**
 * Compara dos objetos de manera shallow (solo primer nivel)
 * Útil para React.memo comparisons
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (!obj1 || !obj2) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
}

/**
 * Debounce function - retrasa la ejecución de una función
 * hasta que haya pasado un tiempo sin llamadas
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - limita la frecuencia de ejecución
 * de una función a una vez cada X milisegundos
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoiza el resultado de una función basándose en sus argumentos
 * Útil para cálculos costosos que se repiten con los mismos inputs
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Hook helper para crear comparadores custom para React.memo
 * 
 * Ejemplo de uso:
 * const MyComponent = React.memo(Component, arePropsEqual(['prop1', 'prop2']));
 */
export function arePropsEqual(propKeys: string[]) {
  return (prevProps: any, nextProps: any): boolean => {
    for (const key of propKeys) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    return true;
  };
}

/**
 * Calcula el tamaño aproximado de un objeto en bytes
 * Útil para debug de performance
 */
export function getObjectSize(obj: any): number {
  const str = JSON.stringify(obj);
  // Cada char es aproximadamente 2 bytes en UTF-16
  return str.length * 2;
}

/**
 * Formatea bytes a KB/MB
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
