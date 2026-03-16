/**
 * AccountCard Component
 * 
 * Displays individual account with edit/delete actions
 */

import { Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AccountCardProps } from '../types';

export function AccountCard({ 
  account, 
  onEdit, 
  onDelete, 
  formatCurrency,
  icon: Icon,
  color,
  index = 0, // ✅ NUEVO: Index para animación stagger
  isFirstCard = false, // 🎓 NUEVO: Para tour - indica si es el primer card
}: AccountCardProps & { icon: any; color: string; index?: number; isFirstCard?: boolean }) {
  // ✅ NUEVO: Helper para convertir color hex a pastel (opacity 12%)
  const getPastelBackground = (color: string) => {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.12)`;
    }
    return color;
  };

  return (
    <motion.div 
      className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-colors touch-target"
      data-tour={isFirstCard ? 'account-card' : undefined}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        delay: index * 0.08, // 🎨 Stagger animation: 80ms delay entre items
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] // Cubic bezier para suavidad
      }}
    >
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: getPastelBackground(color) }}
      >
        <Icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color }} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 dark:text-white text-fluid-base truncate">
          {account.name}
        </p>
        <p className={`text-fluid-sm truncate ${
          account.balance >= 0 
            ? 'text-gray-600 dark:text-gray-400' 
            : 'text-red-600 dark:text-red-400'
        }`} data-tour={isFirstCard ? 'account-balance' : undefined}>
          {formatCurrency(account.balance)}
        </p>
      </div>
      
      <div className="flex items-center gap-1" data-tour={isFirstCard ? 'account-actions' : undefined}>
        <button 
          onClick={() => onEdit(account)}
          className="touch-target p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors tap-scale"
          aria-label="Edit account"
        >
          <Edit className="w-5 h-5 text-gray-400" />
        </button>
        <button 
          onClick={() => onDelete(account.id)}
          className="touch-target p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors tap-scale"
          aria-label="Delete account"
        >
          <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
        </button>
      </div>
    </motion.div>
  );
}