import { useEffect } from 'react';
import otiIsologoLight from 'figma:asset/769764b6ad1c637a72e4172f3a22f74ce04d9c7b.png';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function MetaTags({
  title = 'Oti - Tu Asistente Financiero Personal con IA',
  description = 'Controla tus finanzas con inteligencia artificial: registra gastos, crea presupuestos, analiza tus hábitos y recibe asesoría financiera personalizada.',
  image = otiIsologoLight,
  url = 'https://www.finanzapersonal.com'
}: MetaTagsProps) {
  
  useEffect(() => {
    try {
      // Configurar idioma español
      document.documentElement.setAttribute('lang', 'es');
      document.documentElement.setAttribute('xml:lang', 'es');
      
      // Configurar título
      document.title = title;

      // Función para actualizar meta tags (silenciosamente)
      const updateMetaTag = (property: string, content: string) => {
        try {
          // Eliminar tags existentes
          const existingTags = document.querySelectorAll(
            `meta[property="${property}"], meta[name="${property}"]`
          );
          existingTags.forEach(tag => tag.remove());
          
          // Crear nueva tag
          const meta = document.createElement('meta');
          meta.setAttribute(
            property.startsWith('og:') || property.startsWith('twitter:') ? 'property' : 'name',
            property
          );
          meta.content = content;
          document.head.appendChild(meta);
        } catch (e) {
          // Silencioso
        }
      };

      // Actualizar meta tags principales
      updateMetaTag('description', description);
      updateMetaTag('og:title', title);
      updateMetaTag('og:description', description);
      updateMetaTag('og:url', url);
      updateMetaTag('og:type', 'website');
      updateMetaTag('og:site_name', 'Oti');
      updateMetaTag('og:locale', 'es_ES');
      
      if (image) {
        updateMetaTag('og:image', image);
        updateMetaTag('og:image:width', '1200');
        updateMetaTag('og:image:height', '630');
      }

      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', title);
      updateMetaTag('twitter:description', description);
      if (image) {
        updateMetaTag('twitter:image', image);
      }

      updateMetaTag('theme-color', '#10b981');
      
      // Observer silencioso para limpiar tags de Figma
      const observer = new MutationObserver(() => {
        try {
          const figmaTags = document.querySelectorAll(
            'meta[content*="Figma"], meta[content*="figma"], meta[content*="Created with"]'
          );
          figmaTags.forEach(tag => tag.remove());
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
      // Silencioso - no hacer nada si hay error
    }
  }, [title, description, image, url]);

  return null;
}