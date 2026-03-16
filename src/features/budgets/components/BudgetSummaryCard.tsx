/**
 * BudgetSummaryCard Component
 * 
 * Displays the monthly budget summary with total budget, spent amount, and progress bar
 */

import { memo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import type { BudgetSummaryCardProps } from '../types';

const BudgetSummaryCard = memo<BudgetSummaryCardProps>(
  ({ 
    totalBudget, 
    totalSpent, 
    overallPercentage, 
    formatCurrency, 
    currentMonth,
    selectedMonth,
    selectedYear,
    onMonthChange
  }) => {
    const handlePrevMonth = () => {
      if (selectedMonth === 0) {
        onMonthChange(11, selectedYear - 1);
      } else {
        onMonthChange(selectedMonth - 1, selectedYear);
      }
    };

    const handleNextMonth = () => {
      if (selectedMonth === 11) {
        onMonthChange(0, selectedYear + 1);
      } else {
        onMonthChange(selectedMonth + 1, selectedYear);
      }
    };

    const remaining = totalBudget - totalSpent;
    const isOverBudget = totalSpent > totalBudget;

    return (
      <div className="px-4 sm:px-6 pt-4 pb-4" data-tour="budget-summary-card">
        {/* ✅ NEW: Month Selector (Same as Dashboard) */}
        <div 
          className="flex items-center justify-between gap-3 mb-4"
          data-tour="budget-month-selector"
        >
          <button
            onClick={handlePrevMonth}
            className="p-2.5 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-target tap-scale"
            aria-label="Mes anterior"
          >
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="flex-1 text-center">
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {new Date(selectedYear, selectedMonth).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <button
            onClick={handleNextMonth}
            className="p-2.5 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-target tap-scale"
            aria-label="Mes siguiente"
          >
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* ✅ Summary Card - Contenedor con bordes y sombra */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-4 p-4 sm:p-5">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {/* Presupuestado */}
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 uppercase tracking-wide font-medium">
                Presupuestado
              </p>
              <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalBudget)}
              </p>
            </div>

            {/* Gastado */}
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 uppercase tracking-wide font-medium">
                Gastado
              </p>
              <p className="text-sm sm:text-base font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalSpent)}
              </p>
            </div>

            {/* Disponible/Excedido */}
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 uppercase tracking-wide font-medium">
                {isOverBudget ? 'Excedido' : 'Disponible'}
              </p>
              <p className={`text-sm sm:text-base font-bold ${
                isOverBudget
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-[#10B981] dark:text-green-400'
              }`}>
                {formatCurrency(Math.abs(remaining))}
              </p>
            </div>
          </div>
        </div>

        {/* ✅ IMPROVED: Progress Bar with percentage */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
              Progreso del mes
            </span>
            <span className={`text-sm sm:text-base font-bold ${
              overallPercentage >= 100
                ? 'text-red-600 dark:text-red-400'
                : overallPercentage >= 80
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-green-600 dark:text-green-400'
            }`}>
              {overallPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 sm:h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${ 
                overallPercentage >= 100
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : overallPercentage >= 80
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                  : 'bg-gradient-to-r from-green-500 to-green-600'
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  },
  // Custom comparison: only re-render if values change
  (prevProps, nextProps) => {
    return (
      prevProps.totalBudget === nextProps.totalBudget &&
      prevProps.totalSpent === nextProps.totalSpent &&
      prevProps.overallPercentage === nextProps.overallPercentage &&
      prevProps.selectedMonth === nextProps.selectedMonth &&
      prevProps.selectedYear === nextProps.selectedYear
    );
  }
);

BudgetSummaryCard.displayName = 'BudgetSummaryCard';

export { BudgetSummaryCard };