/**
 * OtiLoader Component
 * 
 * Indicador de carga minimalista con tres puntos danzantes
 * Usa el gradiente verde lima-esmeralda característico del logo
 */

import { motion } from 'framer-motion';

interface OtiLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OtiLoader({ 
  message = 'Cargando...', 
  size = 'md' 
}: OtiLoaderProps) {
  // Tamaños de los puntos
  const sizeMap = {
    sm: { dot: 8, gap: 8, text: 'text-xs' },
    md: { dot: 12, gap: 12, text: 'text-sm' },
    lg: { dot: 16, gap: 16, text: 'text-base' }
  };

  const currentSize = sizeMap[size];

  // Colores del gradiente verde característico
  const dotColors = [
    '#A8E063', // Verde lima (inicio)
    '#56C596', // Verde esmeralda (medio)
    '#0FA07F', // Verde esmeralda oscuro (fin)
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      {/* Tres puntos danzantes */}
      <div 
        className="flex items-end"
        style={{ gap: currentSize.gap }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: currentSize.dot,
              height: currentSize.dot,
              backgroundColor: dotColors[i],
              boxShadow: `0 0 ${currentSize.dot * 1.5}px ${dotColors[i]}40`,
            }}
            animate={{
              y: [-currentSize.dot * 2, 0, -currentSize.dot * 2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.15, // Delay escalonado para efecto wave
            }}
          />
        ))}
      </div>

      {/* Mensaje */}
      {message && (
        <motion.p
          className={`${currentSize.text} font-medium text-gray-600 dark:text-gray-400 text-center px-4`}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
