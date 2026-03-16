/**
 * 🎓 PRODUCT TOUR - Tour de Introducción Visual y Atractivo
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TourStep {
  id: number;
  emoji: string;
  title: string;
  subtitle: string;
}

const tourSteps: TourStep[] = [
  {
    id: 1,
    emoji: '😰',
    title: '¿Dónde quedó mi plata?',
    subtitle: 'Es fin de mes y no sé en qué la gasté',
  },
  {
    id: 2,
    emoji: '🐜',
    title: 'Gastos hormiga',
    subtitle: '2 mil pesos en tinto, 3K en bus, chicles 800 barras... ¿aún no sabes a dónde se van 300 mil al mes?',
  },
  {
    id: 3,
    emoji: '💸',
    title: 'Préstamos olvidados',
    subtitle: '50 mil que me prestaron, 30 mil que preste a mi hermano... ¿Quién le debe a quién?',
  },
  {
    id: 4,
    emoji: '✨',
    title: 'Aquí entra Oti',
    subtitle: 'Ya no más "después lo anoto". Descubre esos: 50 mil en tintos, 20K en chicles...',
  },
  {
    id: 5,
    emoji: '🎤',
    title: 'Solo dile a Oti',
    subtitle: '"Pagué un tinto, 2 mil pesos"... así de fácil registras tus gastos',
  },
  {
    id: 6,
    emoji: '💬',
    title: 'Pregúntale o pídele lo que sea',
    subtitle: '"¿Como hago para poder comprar un iPhone?" Oti responde, según tus finanzas y te aconseja',
  },
  {
    id: 7,
    emoji: '🎯',
    title: 'No te quiebres a mitad de mes',
    subtitle: 'Define presupuestos reales: 100 mil para salir, 50 mil en transporte. Oti te alerta si te pasas',
  },
  {
    id: 8,
    emoji: '📋',
    title: 'Declaración de renta gratis',
    subtitle: 'Ahorra entre $300 mil a 1.5M en contador. Asesoría en tiempo real 24/7',
  },
  {
    id: 9,
    emoji: '👨‍👩‍👧‍👦',
    title: 'Finanzas en familia',
    subtitle: 'Crea grupos para llevar las cuentas claras en tu hogar, así todos pueden ver los gastos',
  },
  {
    id: 10,
    emoji: '🚀',
    title: '¡Listos para despegar!',
    subtitle: 'Tu vida financiera empieza hoy',
  },
];

interface ProductTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function ProductTourClean({ onComplete, onSkip }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    // 🎉 CONFETTI PRIMERO
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#10b981', '#22c55e', '#34d399', '#6ee7b7']
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });

    // Esperar un poco antes de completar para que se vea el confetti
    setTimeout(() => {
      onComplete();
    }, 500);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/85"
          onClick={onSkip}
        />

        {/* Modal */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ 
            type: 'spring', 
            damping: 25, 
            stiffness: 300
          }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[210] w-[90%] max-w-[340px]"
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Content */}
            <div className="pt-12 pb-8 px-6 text-center">
              {/* Emoji GRANDE */}
              <motion.div
                key={step.emoji}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0,
                  // Animación especial de "esfumarse" para el emoji de dinero 💸
                  opacity: step.emoji === '💸' ? [1, 0.3, 1] : 1,
                }}
                transition={{ 
                  type: 'spring',
                  damping: 15,
                  stiffness: 200,
                  // Loop infinito para el efecto de esfumarse
                  opacity: step.emoji === '💸' ? {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  } : undefined
                }}
                className="text-8xl mb-6"
              >
                {step.emoji}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
              >
                {step.title}
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base text-gray-600 dark:text-gray-400 mb-8"
              >
                {step.subtitle}
              </motion.p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {tourSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep 
                        ? 'w-8 bg-emerald-500' 
                        : 'w-2 bg-gray-300 dark:bg-gray-600'
                    }`}
                    layout
                  />
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-semibold text-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                {isLastStep ? (
                  <>
                    ¡Comenzar! <Sparkles className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Siguiente <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Skip */}
              {!isLastStep && (
                <button
                  onClick={onSkip}
                  className="w-full mt-4 py-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Saltar
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}