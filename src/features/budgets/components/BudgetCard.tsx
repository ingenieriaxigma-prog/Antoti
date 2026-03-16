/**
 * BudgetCard Component
 * 
 * OPCIÓN 4: Estilo Fintech Moderno 💳
 * - Super compacto (2 líneas + botones)
 * - Nombre + mini barra inline + % en la primera línea
 * - Gastado "de" Límite en la segunda línea
 * - Botones siempre visibles (importantes para móviles)
 * - Sin decoraciones ni cajas de colores
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, AlertCircle } from 'lucide-react';
import type { BudgetCardProps } from '../types';

const BudgetCard = memo<BudgetCardProps>(
  ({
    budget,
    budgetStatus,
    categoryName,
    categoryColor,
    categoryEmoji,
    formatCurrency,
    onSelect,
    onEdit,
    onDelete,
    index = 0, // ✅ NUEVO: Index para animación stagger
    isFirstCard = false, // ✅ NUEVO: Flag para el primer card
  }) => {
    const { spent, percentage, remaining, status } = budgetStatus;

    const isOverBudget = spent > budget.amount;
    const isWarning = percentage >= 80 && percentage < 100;

    // Determine progress bar color
    const getProgressColor = () => {
      if (isOverBudget) return 'bg-red-500';
      if (isWarning) return 'bg-orange-500';
      return 'bg-green-500';
    };

    // Determine percentage text color
    const getPercentageColor = () => {
      if (isOverBudget) return 'text-red-600 dark:text-red-400';
      if (isWarning) return 'text-orange-600 dark:text-orange-400';
      return 'text-green-600 dark:text-green-400';
    };

    return (
      <motion.div 
        className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          delay: index * 0.08, // 🎨 Stagger animation: 80ms delay entre items
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1] // Cubic bezier para suavidad
        }}
        // 🎓 Tour attributes - Solo el primer card
        {...(isFirstCard && { 'data-tour': 'budget-list' })}
      >
        {/* Main Content */}
        <div className="p-5 sm:p-6">
          {/* Line 1: Name + Mini Progress Bar + Percentage */}
          <div className="flex items-center gap-3 mb-3">
            {/* Category Name */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {categoryEmoji && (
                <span className="text-xl sm:text-2xl flex-shrink-0">{categoryEmoji}</span>
              )}
              <h3 className="font-bold text-gray-900 dark:text-white truncate">
                {categoryName}
              </h3>
            </div>

            {/* Mini Progress Bar + Percentage */}
            <div 
              className="flex items-center gap-2 flex-shrink-0"
              {...(isFirstCard && { 'data-tour': 'budget-progress-bar' })}
            >
              {/* Mini Bar */}
              <div className="w-16 sm:w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getProgressColor()}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              
              {/* Percentage with Warning Icon */}
              <div className="flex items-center gap-1">
                {isOverBudget && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={`font-bold ${getPercentageColor()}`}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Line 2: Gastado "de" Límite */}
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(spent)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              de
            </span>
            <span className="text-base sm:text-lg font-bold text-gray-600 dark:text-gray-400">
              {formatCurrency(budget.amount)}
            </span>
          </div>
        </div>

        {/* Action Buttons - Always Visible */}
        <div 
          className="flex items-center gap-2 px-5 sm:px-6 pb-5 sm:pb-6 border-t border-gray-100 dark:border-gray-800 pt-3"
          {...(isFirstCard && { 'data-tour': 'budget-actions' })}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(budget);
            }}
            className="flex-1 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 tap-scale"
            aria-label="Edit budget"
          >
            <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Editar</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(budget.id);
            }}
            className="flex-1 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-1.5 tap-scale"
            aria-label="Delete budget"
          >
            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
            <span className="text-sm text-red-600 dark:text-red-400">Eliminar</span>
          </button>
        </div>
      </motion.div>
    );
  },
  // Custom comparison: only re-render if budget ID or status changes
  (prevProps, nextProps) => {
    return (
      prevProps.budget.id === nextProps.budget.id &&
      prevProps.budget.amount === nextProps.budget.amount &&
      prevProps.budgetStatus.spent === nextProps.budgetStatus.spent &&
      prevProps.budgetStatus.status === nextProps.budgetStatus.status
    );
  }
);

BudgetCard.displayName = 'BudgetCard';

export { BudgetCard };