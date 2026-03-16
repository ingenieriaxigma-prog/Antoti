/**
 * OtiLogo Component
 * 
 * Logo oficial de Oti con diseño actualizado:
 * - "O" estilizada con dos barras horizontales (similar a símbolo €)
 * - Gradiente verde oficial: forest → emerald → lime
 * - "ti" con texto negro/blanco según el tema
 * - Fondo con rounded square para la "O"
 * 
 * Paleta oficial del logo:
 * - Verde oscuro (forest): #004D2C
 * - Verde esmeralda: #00A651
 * - Verde lima brillante: #B8E61A
 */

import { memo } from 'react';

interface OtiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  showBars?: boolean; // Mostrar las dos barras horizontales características
}

const sizeMap = {
  sm: { 
    container: 'gap-2',
    square: 'w-12 h-12 rounded-xl', 
    oText: 'text-2xl', 
    tiText: 'text-2xl',
    dotSize: 'w-1.5 h-1.5'
  },
  md: { 
    container: 'gap-2.5',
    square: 'w-16 h-16 rounded-2xl', 
    oText: 'text-3xl', 
    tiText: 'text-3xl',
    dotSize: 'w-2 h-2'
  },
  lg: { 
    container: 'gap-3',
    square: 'w-24 h-24 rounded-3xl', 
    oText: 'text-5xl', 
    tiText: 'text-5xl',
    dotSize: 'w-3 h-3'
  },
  xl: { 
    container: 'gap-4',
    square: 'w-32 h-32 rounded-[32px]', 
    oText: 'text-7xl', 
    tiText: 'text-7xl',
    dotSize: 'w-4 h-4'
  },
  '2xl': { 
    container: 'gap-5',
    square: 'w-40 h-40 rounded-[40px]', 
    oText: 'text-8xl', 
    tiText: 'text-8xl',
    dotSize: 'w-5 h-5'
  },
};

export const OtiLogo = memo<OtiLogoProps>(({ 
  size = 'md', 
  showText = true,
  className = '',
  showBars = true
}) => {
  const { container, square, oText, tiText, dotSize } = sizeMap[size];
  
  return (
    <div className={`flex items-center ${container} ${className}`}>
      {/* Rounded square with "O" - Gradiente verde oficial */}
      <div 
        className={`${square} flex items-center justify-center shadow-lg relative`}
        style={{
          background: 'linear-gradient(135deg, #004D2C 0%, #00A651 50%, #B8E61A 100%)'
        }}
      >
        {/* "O" con barras horizontales características */}
        <div className="relative">
          <span className={`${oText} font-bold text-white leading-none`}>O</span>
          
          {/* Dos barras horizontales (estilo símbolo €) */}
          {showBars && (
            <>
              <div 
                className="absolute left-0 right-0 h-0.5 bg-white/90"
                style={{ 
                  top: '35%',
                  transform: 'translateY(-50%)'
                }}
              />
              <div 
                className="absolute left-0 right-0 h-0.5 bg-white/90"
                style={{ 
                  top: '65%',
                  transform: 'translateY(-50%)'
                }}
              />
            </>
          )}
        </div>
      </div>
      
      {/* "ti" text en negro/blanco según tema */}
      {showText && (
        <div className="flex items-end gap-0.5">
          <span 
            className={`${tiText} font-bold leading-none text-gray-900 dark:text-gray-100`}
          >
            ti
          </span>
        </div>
      )}
    </div>
  );
});

OtiLogo.displayName = 'OtiLogo';