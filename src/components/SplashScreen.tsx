import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OtiLogo } from './OtiLogo';

interface SplashScreenProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export default function SplashScreen({ isLoading, onComplete }: SplashScreenProps) {
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    // When loading finishes, wait for fade-out animation before calling onComplete
    if (!isLoading && shouldShow) {
      const timer = setTimeout(() => {
        setShouldShow(false);
        onComplete?.();
      }, 500); // Match exit animation duration

      return () => clearTimeout(timer);
    }
  }, [isLoading, shouldShow, onComplete]);

  return (
    <AnimatePresence>
      {(isLoading || shouldShow) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-700 to-lime-500"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-20"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  y: [null, Math.random() * window.innerHeight],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center gap-12">
            {/* Logo oficial de Oti con resplandor */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: -30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, type: "spring", stiffness: 150 }}
              className="relative flex flex-col items-center gap-6"
            >
              {/* Logo con efecto de resplandor */}
              <div className="relative">
                {/* Glow de fondo - Gradiente verde oficial */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-lime-400 via-emerald-400 to-emerald-600 blur-3xl"
                  style={{ width: '240px', height: '240px', left: '-60px', top: '-60px' }}
                />
                
                {/* Logo oficial con animación flotante y pulso */}
                <motion.div
                  animate={{
                    y: [0, -12, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <OtiLogo 
                    forceTheme="dark"
                    className="w-32 h-32 object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </div>

              {/* Brand text */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-center space-y-2"
              >
                <p className="text-white/95 tracking-wide font-medium">
                  Tu asistente financiero inteligente
                </p>
              </motion.div>
            </motion.div>

            {/* Spinner verde con colores oficiales de Oti */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="relative w-20 h-20"
            >
              {/* Outer ring - Gradiente verde oficial */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0"
              >
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="url(#spinnerGradientOti)"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="60 160"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="spinnerGradientOti" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#B8E61A" />
                      <stop offset="50%" stopColor="#00A651" />
                      <stop offset="100%" stopColor="#004D2C" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              {/* Inner ring - Verde esmeralda */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0"
              >
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="25"
                    stroke="#10B981"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="40 120"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                </svg>
              </motion.div>

              {/* Center dot - Gradiente verde */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 shadow-lg shadow-emerald-500/50" />
              </motion.div>
            </motion.div>

            {/* Loading text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-white/80 text-sm tracking-widest"
            >
              CARGANDO...
            </motion.div>
          </div>

          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}