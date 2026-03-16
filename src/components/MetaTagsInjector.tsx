import { useEffect } from 'react';

/**
 * 🔥 META TAGS INJECTOR - VERSIÓN ULTRA-SIMPLIFICADA
 * 
 * Este componente ya no es necesario porque las meta tags están en index.html
 * Lo mantenemos como stub para evitar errores de importación
 */
export default function MetaTagsInjector() {
  useEffect(() => {
    // Función silenciosa para limpiar meta tags de Figma
    const cleanupFigmaTags = () => {
      try {
        const figmaTags = document.querySelectorAll(
          'meta[content*="Figma"], meta[content*="figma"], meta[content*="Created with"]'
        );
        figmaTags.forEach(tag => tag.remove());
      } catch (e) {
        // Silencioso
      }
    };

    // Ejecutar una vez
    cleanupFigmaTags();

    // Observer silencioso
    try {
      const observer = new MutationObserver(() => {
        try {
          cleanupFigmaTags();
        } catch (e) {
          // Silencioso
        }
      });

      observer.observe(document.head, {
        childList: true,
        subtree: true
      });

      return () => observer.disconnect();
    } catch (e) {
      // Silencioso
    }
  }, []);

  return null;
}
