/**
 * 🎨 OtiLogo Component
 * 
 * Logo adaptativo de Oti que cambia automáticamente según el tema (claro/oscuro)
 * 
 * @component
 * @example
 * // Logo completo con texto
 * <OtiLogo variant="isologo" className="h-8" />
 * 
 * // Solo símbolo circular
 * <OtiLogo variant="isotipo" className="h-12" />
 */

import otiIsologoLight from 'figma:asset/769764b6ad1c637a72e4172f3a22f74ce04d9c7b.png';
import otiIsologoDark from 'figma:asset/ea92314c3927c38dba9ffd51dcb33f31adfbe51d.png';
import otiIsotipoLight from 'figma:asset/b959b7af95bb53357785dc7884261465d51ede83.png';
import otiIsotipoDark from 'figma:asset/8fa80c1f03d02f7759353d172ee30dada0fb928b.png';

interface OtiLogoProps {
  /**
   * Variante del logo
   * - isologo: Logo completo (texto + símbolo)
   * - isotipo: Solo símbolo circular
   */
  variant?: 'isologo' | 'isotipo';
  
  /**
   * Forzar versión específica (ignora dark mode del sistema)
   * - 'light': Forzar logo claro
   * - 'dark': Forzar logo oscuro
   * - undefined: Auto-detectar según dark mode
   */
  forceTheme?: 'light' | 'dark';
  
  /**
   * Clases CSS adicionales
   */
  className?: string;
  
  /**
   * Texto alternativo para accesibilidad
   */
  alt?: string;
}

export function OtiLogo({ 
  variant = 'isotipo', 
  forceTheme,
  className = 'h-10',
  alt = 'Oti - Finanzas Personales'
}: OtiLogoProps) {
  const lightLogo = variant === 'isologo' ? otiIsologoLight : otiIsotipoLight;
  const darkLogo = variant === 'isologo' ? otiIsologoDark : otiIsotipoDark;

  // Si se fuerza un tema específico, mostrar solo ese logo
  if (forceTheme === 'dark') {
    return <img src={darkLogo} alt={alt} className={`object-contain ${className}`} />;
  }
  
  if (forceTheme === 'light') {
    return <img src={lightLogo} alt={alt} className={`object-contain ${className}`} />;
  }

  // Auto-detectar según dark mode del sistema
  return (
    <>
      {/* Logo para modo claro */}
      <img 
        src={lightLogo} 
        alt={alt}
        className={`block dark:hidden object-contain ${className}`}
      />
      
      {/* Logo para modo oscuro */}
      <img 
        src={darkLogo} 
        alt={alt}
        className={`hidden dark:block object-contain ${className}`}
      />
    </>
  );
}