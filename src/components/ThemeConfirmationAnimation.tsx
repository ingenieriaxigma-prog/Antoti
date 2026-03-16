import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ThemeKey } from '../types';

/**
 * Theme-specific animation configurations
 */
const THEME_ANIMATIONS: Record<ThemeKey, {
  emojis: string[];
  duration: number;
  animationType: 'fall' | 'float' | 'burst' | 'snow';
}> = {
  blue: {
    emojis: ['🌊', '💧', '💙', '🌊', '💧', '💙', '🌊', '💧'],
    duration: 1500,
    animationType: 'fall',
  },
  green: {
    emojis: ['🍃', '🌿', '💚', '🍃', '🌿', '💚', '🍃', '🌿'],
    duration: 1500,
    animationType: 'fall',
  },
  purple: {
    emojis: ['✨', '⭐', '💜', '✨', '⭐', '💜', '✨', '⭐'],
    duration: 1500,
    animationType: 'burst',
  },
  orange: {
    emojis: ['🔥', '🧡', '🌟', '🔥', '🧡', '🌟', '🔥', '🧡'],
    duration: 1500,
    animationType: 'burst',
  },
  pink: {
    emojis: ['💕', '💗', '💖', '💕', '💗', '💖', '💕', '💗'],
    duration: 1500,
    animationType: 'float',
  },
  teal: {
    emojis: ['🫧', '💎', '💙', '🫧', '💎', '💙', '🫧', '💎'],
    duration: 1500,
    animationType: 'float',
  },
  christmas: {
    emojis: ['❄️', '🎄', '🎅', '⭐', '🎁', '❄️', '🎄', '✨'],
    duration: 2000,
    animationType: 'snow',
  },
  rainbow: {
    emojis: ['🌈', '✨', '💫', '🌈', '✨', '💫', '🌈', '✨'],
    duration: 1500,
    animationType: 'burst',
  },
};

interface ThemeConfirmationAnimationProps {
  theme: ThemeKey;
  gradient: string;
  onComplete: () => void;
}

/**
 * ThemeConfirmationAnimation Component
 * 
 * Displays a fullscreen celebration animation when a theme is selected.
 * Auto-closes after animation completes and returns user to Settings screen.
 * 
 * @component
 * @example
 * ```tsx
 * <ThemeConfirmationAnimation
 *   theme="blue"
 *   gradient="linear-gradient(...)"
 *   onComplete={() => setShowAnimation(false)}
 * />
 * ```
 */
export const ThemeConfirmationAnimation: React.FC<ThemeConfirmationAnimationProps> = ({
  theme,
  gradient,
  onComplete,
}) => {
  const config = THEME_ANIMATIONS[theme];

  useEffect(() => {
    // Haptic feedback (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Auto-close after animation duration
    const timer = setTimeout(() => {
      onComplete();
    }, config.duration);

    return () => clearTimeout(timer);
  }, [config.duration, onComplete]);

  /**
   * Get animation variants based on animation type
   */
  const getEmojiVariants = (index: number, type: string) => {
    const baseDelay = index * 0.1;

    switch (type) {
      case 'fall':
        return {
          initial: { 
            y: -100, 
            x: Math.random() * window.innerWidth,
            opacity: 0,
            rotate: 0,
          },
          animate: { 
            y: window.innerHeight + 100, 
            opacity: [0, 1, 1, 0],
            rotate: 360,
            transition: {
              duration: 1.5,
              delay: baseDelay,
              ease: 'easeIn',
            },
          },
        };

      case 'float':
        return {
          initial: { 
            y: window.innerHeight + 100, 
            x: Math.random() * window.innerWidth,
            opacity: 0,
            scale: 0,
          },
          animate: { 
            y: -100,
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0.8],
            x: Math.random() * window.innerWidth,
            transition: {
              duration: 1.5,
              delay: baseDelay,
              ease: 'easeOut',
            },
          },
        };

      case 'burst':
        const angle = (index / 8) * Math.PI * 2;
        const distance = 300;
        return {
          initial: { 
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            opacity: 0,
            scale: 0,
          },
          animate: { 
            x: window.innerWidth / 2 + Math.cos(angle) * distance,
            y: window.innerHeight / 2 + Math.sin(angle) * distance,
            opacity: [0, 1, 1, 0],
            scale: [0, 1.5, 1, 0],
            rotate: [0, 180, 360],
            transition: {
              duration: 1.2,
              delay: baseDelay * 0.5,
              ease: 'easeOut',
            },
          },
        };

      case 'snow':
        return {
          initial: { 
            y: -100, 
            x: Math.random() * window.innerWidth,
            opacity: 0,
            rotate: 0,
          },
          animate: { 
            y: window.innerHeight + 100,
            x: Math.random() * window.innerWidth + (Math.sin(index) * 50),
            opacity: [0, 0.8, 0.8, 0],
            rotate: [0, 360, 720],
            transition: {
              duration: 2,
              delay: baseDelay,
              ease: 'linear',
            },
          },
        };

      default:
        return {
          initial: { opacity: 0, scale: 0 },
          animate: { opacity: 1, scale: 1 },
        };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: gradient }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onComplete} // Allow manual close by tapping
      >
        {/* Backdrop blur effect */}
        <div className="absolute inset-0 backdrop-blur-sm" />

        {/* Animated emojis */}
        {config.emojis.map((emoji, index) => {
          const variants = getEmojiVariants(index, config.animationType);
          return (
            <motion.div
              key={index}
              className="absolute text-6xl pointer-events-none"
              initial={variants.initial}
              animate={variants.animate}
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
              }}
            >
              {emoji}
            </motion.div>
          );
        })}

        {/* Center success indicator */}
        <motion.div
          className="relative z-10 bg-white/20 backdrop-blur-md rounded-full p-8 shadow-2xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Ripple effect */}
        <motion.div
          className="absolute rounded-full border-4 border-white/40"
          style={{
            width: 100,
            height: 100,
            left: '50%',
            top: '50%',
            marginLeft: -50,
            marginTop: -50,
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </motion.div>
    </AnimatePresence>
  );
};