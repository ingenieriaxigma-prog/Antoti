/**
 * OtiCircle Component
 * 
 * Animated circular "O" logo with dynamic gradient based on theme
 * Features ChatGPT-inspired flowing gradient animation inside the circle
 */

import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

interface OtiCircleProps {
  size?: number;
  spinning?: boolean;
  className?: string;
  theme?: string; // 🎨 NEW: Theme prop for dynamic colors
}

// 🎨 Theme color mappings with cloud/fluid animation colors
const THEME_COLORS = {
  blue: { 
    start: '#60a5fa', 
    mid: '#3b82f6', 
    end: '#2563eb',
    cloud1: '#93c5fd',
    cloud2: '#3b82f6',
    cloud3: '#1d4ed8'
  },
  green: { 
    start: '#A8E063', 
    mid: '#56C596', 
    end: '#0FA07F',
    cloud1: '#d1f0c0',
    cloud2: '#56C596',
    cloud3: '#0d8a6b'
  },
  purple: { 
    start: '#c084fc', 
    mid: '#a78bfa', 
    end: '#8b5cf6',
    cloud1: '#e9d5ff',
    cloud2: '#a78bfa',
    cloud3: '#7c3aed'
  },
  orange: { 
    start: '#fdba74', 
    mid: '#fb923c', 
    end: '#f97316',
    cloud1: '#fed7aa',
    cloud2: '#fb923c',
    cloud3: '#ea580c'
  },
  pink: { 
    start: '#f9a8d4', 
    mid: '#f472b6', 
    end: '#ec4899',
    cloud1: '#fce7f3',
    cloud2: '#f472b6',
    cloud3: '#db2777'
  },
  teal: { 
    start: '#5eead4', 
    mid: '#2dd4bf', 
    end: '#14b8a6',
    cloud1: '#99f6e4',
    cloud2: '#2dd4bf',
    cloud3: '#0f766e'
  },
  christmas: { 
    start: '#22c55e', 
    mid: '#16a34a', 
    end: '#15803d',
    cloud1: '#86efac',
    cloud2: '#4ade80',
    cloud3: '#166534'
  },
  rainbow: { 
    start: '#ec4899', 
    mid: '#8b5cf6', 
    end: '#3b82f6',
    cloud1: '#f9a8d4',
    cloud2: '#a78bfa',
    cloud3: '#60a5fa'
  },
};

export const OtiCircle = memo<OtiCircleProps>(({ 
  size = 120, 
  spinning = true,
  className = '',
  theme = 'green' // Default to green
}) => {
  // Get colors for current theme
  const colors = useMemo(() => {
    return THEME_COLORS[theme as keyof typeof THEME_COLORS] || THEME_COLORS.green;
  }, [theme]);

  // Calculate glow color from start color
  const glowColor = useMemo(() => {
    const startColor = colors.start;
    // Extract RGB from hex
    const r = parseInt(startColor.slice(1, 3), 16);
    const g = parseInt(startColor.slice(3, 5), 16);
    const b = parseInt(startColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.3)`;
  }, [colors]);

  // Generate unique IDs for gradients to avoid conflicts
  const uniqueId = useMemo(() => Math.random().toString(36).substr(2, 9), []);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={
          spinning
            ? {
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }
            : {}
        }
        transition={
          spinning
            ? {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : {}
        }
      />

      {/* Main container */}
      <div className="absolute inset-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Dynamic gradient for ring */}
            <linearGradient
              id={`otiGradient-${uniqueId}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="50%" stopColor={colors.mid} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>

            {/* 🌊 Animated cloud/fluid gradients - Storm style */}
            <radialGradient
              id={`cloudGradient1-${uniqueId}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={colors.cloud1} stopOpacity="0.95">
                <animate
                  attributeName="stop-opacity"
                  values="0.95;0.7;0.95"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="60%" stopColor={colors.cloud2} stopOpacity="0.5">
                <animate
                  attributeName="stop-opacity"
                  values="0.5;0.8;0.5"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor={colors.cloud3} stopOpacity="0.2">
                <animate
                  attributeName="offset"
                  values="0.7;0.9;0.7"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
            </radialGradient>

            <radialGradient
              id={`cloudGradient2-${uniqueId}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={colors.cloud2} stopOpacity="0.9">
                <animate
                  attributeName="stop-opacity"
                  values="0.9;1;0.9"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor={colors.cloud3} stopOpacity="0.6">
                <animate
                  attributeName="stop-opacity"
                  values="0.6;0.85;0.6"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor={colors.cloud1} stopOpacity="0.3">
                <animate
                  attributeName="offset"
                  values="0.6;0.85;0.6"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
            </radialGradient>

            <radialGradient
              id={`cloudGradient3-${uniqueId}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={colors.cloud1} stopOpacity="0.85">
                <animate
                  attributeName="stop-opacity"
                  values="0.85;0.95;0.85"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor={colors.cloud2} stopOpacity="0.7">
                <animate
                  attributeName="stop-opacity"
                  values="0.7;0.9;0.7"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor={colors.cloud3} stopOpacity="0.4">
                <animate
                  attributeName="offset"
                  values="0.5;0.8;0.5"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </stop>
            </radialGradient>

            {/* Clip path for the circle interior */}
            <clipPath id={`donutClip-${uniqueId}`}>
              <circle cx="100" cy="100" r="93" />
            </clipPath>

            {/* Filtro para el brillo de la estrella */}
            <filter id={`sparkGlow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>
          
          {/* ✨ Animated fluid/cloud background inside circle - Storm effect */}
          <g clipPath={`url(#donutClip-${uniqueId})`}>
            {/* Base layer - Full circle background */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill={`url(#cloudGradient1-${uniqueId})`}
              opacity="0.5"
            >
              <animate
                attributeName="opacity"
                values="0.5;0.7;0.5"
                dur="4s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Cloud blob 1 - Grande superior */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill={`url(#cloudGradient1-${uniqueId})`}
              opacity="0.7"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 25,18; 0,0; -20,25; 0,0"
                dur="8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values="85;95;85"
                dur="6s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Cloud blob 2 - Mediano */}
            <circle
              cx="100"
              cy="100"
              r="75"
              fill={`url(#cloudGradient2-${uniqueId})`}
              opacity="0.8"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; -22,-15; 0,0; 15,-22; 0,0"
                dur="7s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values="75;90;75"
                dur="5s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Cloud blob 3 - Elíptico giratorio */}
            <ellipse
              cx="100"
              cy="100"
              rx="70"
              ry="85"
              fill={`url(#cloudGradient3-${uniqueId})`}
              opacity="0.6"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 100 100; 360 100 100"
                dur="20s"
                repeatCount="indefinite"
              />
            </ellipse>

            {/* Cloud blob 4 - Extra layer diagonal */}
            <ellipse
              cx="100"
              cy="100"
              rx="80"
              ry="70"
              fill={`url(#cloudGradient2-${uniqueId})`}
              opacity="0.5"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="45 100 100; 405 100 100"
                dur="25s"
                repeatCount="indefinite"
              />
            </ellipse>

            {/* Cloud blob 5 - Pulsante central */}
            <circle
              cx="100"
              cy="100"
              r="60"
              fill={`url(#cloudGradient3-${uniqueId})`}
              opacity="0.7"
            >
              <animate
                attributeName="r"
                values="60;75;60"
                dur="4.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.7;0.9;0.7"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Cloud blob 6 - Movimiento lateral */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill={`url(#cloudGradient1-${uniqueId})`}
              opacity="0.6"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; -15,20; 0,0; 20,-15; 0,0"
                dur="9s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Cloud blob 7 - Overlay superior con gradiente intenso */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill={`url(#cloudGradient2-${uniqueId})`}
              opacity="0.4"
            >
              <animate
                attributeName="opacity"
                values="0.4;0.6;0.4"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </circle>
          </g>

          {/* Anillo circular delgado con gradiente dinámico (encima del fondo) */}
          <motion.circle
            cx="100"
            cy="100"
            r="93"
            stroke={`url(#otiGradient-${uniqueId})`}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            animate={spinning ? { rotate: 360 } : {}}
            transition={
              spinning
                ? {
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear',
                  }
                : {}
            }
            style={{ transformOrigin: '100px 100px' }}
          />

          {/* Estrella brillante en la parte superior del círculo */}
          <g transform="translate(100, 7)">
            {/* Glow de la estrella */}
            <circle
              cx="0"
              cy="0"
              r="8"
              fill="white"
              opacity="0.4"
              filter={`url(#sparkGlow-${uniqueId})`}
            />
            
            {/* Estrella principal (diamante de 4 puntas) */}
            <path
              d="M 0,-6 L 1.5,-1.5 L 6,0 L 1.5,1.5 L 0,6 L -1.5,1.5 L -6,0 L -1.5,-1.5 Z"
              fill="white"
              opacity="0.95"
            />
            
            {/* Destello adicional más pequeño */}
            <path
              d="M 0,-4 L 1,-1 L 4,0 L 1,1 L 0,4 L -1,1 L -4,0 L -1,-1 Z"
              fill="white"
              opacity="0.7"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 0 0"
                to="90 0 0"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
          </g>

          {/* 🎅 Gorrito de Navidad - Solo tema Christmas */}
          {theme === 'christmas' && (
            <g transform="translate(100, -40) scale(3.5)">
              {/* Sombra del gorrito */}
              <ellipse
                cx="0"
                cy="45"
                rx="18"
                ry="4"
                fill="black"
                opacity="0.2"
              />
              
              {/* Parte principal del gorro - Rojo */}
              <path
                d="M -15,20 Q -15,0 0,-10 Q 15,0 15,20 L 10,20 Q 10,5 0,0 Q -10,5 -10,20 Z"
                fill="#dc2626"
                stroke="#b91c1c"
                strokeWidth="0.8"
              />
              
              {/* Borde blanco del gorro */}
              <ellipse
                cx="0"
                cy="20"
                rx="16"
                ry="5"
                fill="white"
              />
              
              {/* Textura del borde (piel) */}
              <ellipse
                cx="0"
                cy="19"
                rx="16"
                ry="4"
                fill="#f3f4f6"
                opacity="0.8"
              />
              
              {/* Pompón blanco */}
              <circle
                cx="8"
                cy="-8"
                r="6"
                fill="white"
              />
              
              {/* Sombra del pompón */}
              <circle
                cx="8"
                cy="-8"
                r="6"
                fill="#e5e7eb"
                opacity="0.4"
              />
              
              {/* Textura del pompón */}
              <circle
                cx="7"
                cy="-9"
                r="2.5"
                fill="white"
                opacity="0.9"
              />
              
              {/* Highlight del gorro */}
              <path
                d="M -8,10 Q -5,5 0,2 Q 5,5 8,10"
                fill="white"
                opacity="0.25"
              />
              
              {/* Pequeño brillo en el pompón */}
              <circle
                cx="6"
                cy="-10"
                r="2"
                fill="white"
                opacity="0.9"
              >
                <animate
                  attributeName="opacity"
                  values="0.9;1;0.9"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
});

OtiCircle.displayName = 'OtiCircle';