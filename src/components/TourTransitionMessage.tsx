/**
 * 🎉 TOUR TRANSITION MESSAGE
 * 
 * Mensaje de transición entre ProductTour y OnboardingTour.
 * Da tiempo al usuario para ver el dashboard antes del tour interactivo.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface TourTransitionMessageProps {
  onComplete: () => void;
  duration?: number; // Duración total en ms (default: 4000ms = 4s)
}

export default function TourTransitionMessage({ 
  onComplete, 
  duration = 4000 
}: TourTransitionMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Después de 3 segundos, inicia el fade out
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, duration - 1000);

    // Después del fade out completo (1s más), llama a onComplete
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[199] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              type: 'spring',
              damping: 20,
              stiffness: 300
            }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl px-8 py-10 mx-4 max-w-sm text-center border-2 border-emerald-500"
          >
            {/* Sparkles animados */}
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="inline-block mb-4"
            >
              <Sparkles className="w-16 h-16 text-emerald-500" />
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              ¡Bienvenido a Oti! 🎉
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Este es tu dashboard financiero
            </p>

            {/* Loading dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-emerald-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
