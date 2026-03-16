/**
 * 🎓 ONBOARDING TOUR SUTIL - Tour Minimalista con Blur
 * 
 * Diseño sutil que no tapa la pantalla:
 * - ✨ Fondo claro con blur (no oscuro)
 * - 🎯 Resaltado suave del elemento (sin spotlight exagerado)
 * - 💬 Tooltips compactos y limpios
 * - 👁️ Usuario puede VER todo el dashboard mientras aprende
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Plus,
  Receipt,
  PiggyBank,
  BarChart3,
  Mic,
  MessageCircle,
  Filter,
  Calendar,
  Settings
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../../utils/supabase/client'; // 👤 Import supabase for user ID

interface TourStep {
  id: string;
  target: string; // data-tour attribute
  title: string;
  description: string;
  icon: React.ReactNode;
  placement: 'top' | 'bottom' | 'center';
}

interface OnboardingTourProps {
  onComplete: () => void;
  darkMode?: boolean;
  userId?: string; // 👤 User ID to save tour completion
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '',
    title: '¡Bienvenido! 👋',
    description: 'Tour rápido de 1 minuto',
    icon: <Sparkles className="w-5 h-5" />,
    placement: 'center',
  },
  {
    id: 'header-actions',
    target: 'header-actions',
    title: 'Herramientas 🛠️',
    description: 'Buscar, notificaciones, perfil y configuración',
    icon: <Settings className="w-5 h-5" />,
    placement: 'bottom',
  },
  {
    id: 'month-selector',
    target: 'month-selector',
    title: 'Selector de mes 📅',
    description: 'Navega entre meses para ver tus finanzas',
    icon: <Calendar className="w-5 h-5" />,
    placement: 'bottom',
  },
  {
    id: 'balance-summary',
    target: 'balance-summary',
    title: 'Tu balance 💰',
    description: 'Ingresos, gastos y balance al instante',
    icon: <TrendingUp className="w-5 h-5" />,
    placement: 'bottom',
  },
  {
    id: 'transaction-filters',
    target: 'transaction-filters',
    title: 'Filtrar transacciones 🔍',
    description: 'Filtra por tipo: Ingreso, Gasto o Transferencia',
    icon: <Filter className="w-5 h-5" />,
    placement: 'bottom',
  },
  {
    id: 'transactions-list',
    target: 'transactions-list',
    title: 'Últimas transacciones 📋',
    description: 'Ve tus movimientos más recientes',
    icon: <Receipt className="w-5 h-5" />,
    placement: 'top',
  },
  {
    id: 'quick-actions',
    target: 'quick-actions',
    title: 'Agregar movimientos ➕',
    description: 'Toca aquí para registrar gastos o ingresos',
    icon: <Plus className="w-5 h-5" />,
    placement: 'top',
  },
];

const TOUR_STORAGE_KEY = 'oti_tour_completed';

export function OnboardingTourSubtle({ onComplete, darkMode = false, userId }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isCenterStep = step.placement === 'center';

  // Encontrar elemento y calcular posición
  useEffect(() => {
    if (!isActive) return;

    const updateHighlight = () => {
      if (!step.target) {
        setHighlightRect(null);
        return;
      }

      const element = document.querySelector(`[data-tour="${step.target}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);

        // Scroll suave al elemento
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    };

    updateHighlight();
    
    // Recalcular en resize/scroll
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight, true);

    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight, true);
    };
  }, [currentStep, step.target, isActive]);

  // Activar tour después de un pequeño delay
  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // 🔧 DEFINIR handleComplete y handleSkip PRIMERO (antes de handleNext)
  const handleComplete = useCallback(() => {
    // 🎉 Confetti
    const count = 150;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#10b981', '#22c55e', '#34d399']
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

    // 🔐 STORAGE KEY POR USUARIO
    if (userId) {
      const dashboardTourKey = `oti_dashboard_tour_completed_${userId}`;
      localStorage.setItem(dashboardTourKey, 'true');
      console.log('✅ Dashboard tour completado para usuario:', userId);
    }
    // Compatibilidad con key global (legacy)
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    
    setTimeout(() => {
      onComplete();
    }, 300);
  }, [onComplete, userId]);

  const handleSkip = useCallback(() => {
    // 🔐 STORAGE KEY POR USUARIO
    if (userId) {
      const dashboardTourKey = `oti_dashboard_tour_completed_${userId}`;
      localStorage.setItem(dashboardTourKey, 'true');
      console.log('⏭️ Dashboard tour saltado para usuario:', userId);
    } else {
      console.warn('⚠️  [WARN] ⚠️ No access token available - skipping save, using in-memory defaults only');
    }
    // Compatibilidad con key global (legacy)
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    onComplete();
  }, [onComplete, userId]);

  // 🔧 AHORA SÍ definir handleNext (que depende de handleComplete)
  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  if (!isActive) return null;

  // Calcular posición del tooltip
  const getTooltipPosition = () => {
    if (!highlightRect) {
      return {};
    }

    const padding = 16;
    const screenHeight = window.innerHeight;
    
    if (step.placement === 'bottom') {
      // Posición DEBAJO del elemento
      const top = highlightRect.bottom + padding;
      return { top: `${top}px` };
    }

    if (step.placement === 'top') {
      // Posición ARRIBA del elemento
      const bottom = screenHeight - highlightRect.top + padding;
      return { bottom: `${bottom}px` };
    }

    return {};
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[198] pointer-events-none">
        {/* Backdrop con SPOTLIGHT - área resaltada CLARA, resto OSCURO */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-auto"
          onClick={handleSkip}
        >
          {highlightRect && !isCenterStep ? (
            // SVG Mask para crear "recorte" donde se ve el contenido claramente
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <mask id="spotlight-mask">
                  {/* Fondo blanco = opaco (se ve el fill) */}
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {/* Rectángulo negro = transparente (se ve el contenido) */}
                  <rect
                    x={highlightRect.left - 8}
                    y={highlightRect.top - 8}
                    width={highlightRect.width + 16}
                    height={highlightRect.height + 16}
                    rx="16"
                    fill="black"
                  />
                </mask>
              </defs>
              {/* Overlay oscuro con máscara */}
              <rect 
                x="0" 
                y="0" 
                width="100%" 
                height="100%" 
                fill="rgba(0, 0, 0, 0.7)"
                mask="url(#spotlight-mask)"
              />
            </svg>
          ) : (
            // Backdrop normal para steps centrales
            <div className="absolute inset-0 bg-black/50" />
          )}
        </motion.div>

        {/* Resaltado con borde verde y sombra */}
        {highlightRect && !isCenterStep && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute pointer-events-none"
            style={{
              top: highlightRect.top - 8,
              left: highlightRect.left - 8,
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
            }}
          >
            {/* Anillo de pulso suave */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-2xl border-3 border-emerald-400 dark:border-emerald-500"
              style={{ borderWidth: '3px' }}
            />
            
            {/* Sombra brillante */}
            <div className="absolute inset-0 rounded-2xl shadow-xl shadow-emerald-500/50" />
          </motion.div>
        )}

        {/* Tooltip compacto */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`absolute pointer-events-auto ${
            isCenterStep 
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
              : 'left-1/2 -translate-x-1/2'
          }`}
          style={!isCenterStep ? getTooltipPosition() : undefined}
        >
          <div className={`
            bg-white dark:bg-gray-800 
            rounded-2xl shadow-2xl 
            border border-gray-200 dark:border-gray-700
            ${isCenterStep ? 'w-[85vw] max-w-[340px]' : 'w-[80vw] max-w-[280px]'}
            overflow-hidden
          `}>
            {/* Header compacto */}
            <div className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-emerald-500">
                  {step.icon}
                </div>
                <button
                  onClick={handleSkip}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {step.title}
              </h3>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5 mb-4">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentStep 
                        ? 'w-6 bg-emerald-500' 
                        : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!isLastStep && (
                  <button
                    onClick={handleSkip}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Saltar
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {isLastStep ? (
                    <>
                      Finalizar <Sparkles className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Siguiente <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function resetOnboardingTour() {
  localStorage.removeItem(TOUR_STORAGE_KEY);
}