/**
 * 📱 OTI SPACER MESSAGE
 * 
 * Componente estilo WhatsApp que agrega un espaciador al final del contenido
 * para evitar que el FAB de Oti tape elementos interactivos.
 * 
 * Inspirado en la UX de WhatsApp que muestra un mensaje contextual
 * al llegar al final del contenido.
 * 
 * @example
 * ```tsx
 * // Al final de una lista scrolleable:
 * <OtiSpacerMessage
 *   message="Has llegado al final. Usa Oti para crear transacciones"
 *   show={items.length > 0}
 * />
 * ```
 * 
 * 🎨 Características:
 * - Logo "O" con gradiente verde oficial (forest → emerald → lime)
 * - Mensaje personalizable por pantalla
 * - Resalta automáticamente "Oti" en el texto
 * - Soporte completo para modo oscuro
 * - Padding superior/inferior para garantizar espacio del FAB
 */

import React from 'react';
import { OtiLogo } from './OtiLogo';

interface OtiSpacerMessageProps {
  /** Mensaje personalizado para cada pantalla */
  message: string;
  /** Muestra el espaciador solo si hay contenido */
  show?: boolean;
}

export function OtiSpacerMessage({ message, show = true }: OtiSpacerMessageProps) {
  if (!show) return null;

  return (
    <div className="pt-6 pb-8 px-4 text-center">
      <div className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-lime-50 dark:from-emerald-900/20 dark:to-lime-900/20 rounded-full border border-emerald-200/50 dark:border-emerald-700/30 shadow-sm">
        {/* Logo Oti oficial con gradiente verde */}
        <div className="flex-shrink-0">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md relative"
            style={{
              background: 'linear-gradient(135deg, #004D2C 0%, #00A651 50%, #B8E61A 100%)'
            }}
          >
            <span className="text-sm font-bold text-white leading-none">O</span>
            {/* Barras horizontales características */}
            <div className="absolute left-1 right-1 h-px bg-white/80" style={{ top: '35%' }} />
            <div className="absolute left-1 right-1 h-px bg-white/80" style={{ top: '65%' }} />
          </div>
        </div>
        
        {/* Mensaje contextual */}
        <span 
          className="text-sm text-gray-600 dark:text-gray-400"
          dangerouslySetInnerHTML={{ 
            __html: message.replace(
              /Oti/g, 
              '<span class="font-semibold text-emerald-600 dark:text-emerald-400">Oti</span>'
            )
          }}
        />
      </div>
    </div>
  );
}