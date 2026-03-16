/**
 * OtiIcon Component - SVG Icon del logo oficial
 * 
 * Componente SVG del ícono "O" de Oti con las dos barras horizontales características
 * y el gradiente verde oficial.
 * 
 * Útil para usar en lugares donde se necesita un SVG inline en lugar del componente completo.
 * 
 * @example
 * ```tsx
 * <OtiIcon className="w-8 h-8" />
 * <OtiIcon className="w-12 h-12" withGradient={false} color="#00A651" />
 * ```
 */

import { memo } from 'react';

interface OtiIconProps {
  className?: string;
  withGradient?: boolean;
  color?: string;
}

export const OtiIcon = memo<OtiIconProps>(({ 
  className = 'w-8 h-8',
  withGradient = true,
  color 
}) => {
  const gradientId = `oti-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {withGradient && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#004D2C" />
            <stop offset="50%" stopColor="#00A651" />
            <stop offset="100%" stopColor="#B8E61A" />
          </linearGradient>
        </defs>
      )}
      
      {/* Círculo exterior "O" */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke={withGradient ? `url(#${gradientId})` : (color || '#00A651')}
        strokeWidth="12"
      />
      
      {/* Círculo interior (hueco de la O) */}
      <circle
        cx="50"
        cy="50"
        r="20"
        fill="transparent"
      />
      
      {/* Barra horizontal superior (como símbolo €) */}
      <line
        x1="20"
        y1="40"
        x2="55"
        y2="40"
        stroke={withGradient ? `url(#${gradientId})` : (color || '#00A651')}
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Barra horizontal inferior (como símbolo €) */}
      <line
        x1="20"
        y1="60"
        x2="55"
        y2="60"
        stroke={withGradient ? `url(#${gradientId})` : (color || '#00A651')}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
});

OtiIcon.displayName = 'OtiIcon';
