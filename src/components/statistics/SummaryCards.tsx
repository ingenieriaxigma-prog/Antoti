/**
 * SummaryCards
 * 
 * Tarjetas de resumen de ingresos y gastos optimizadas.
 * Diseño compacto horizontal (mismo estilo que Dashboard).
 */

import React from 'react';

interface SummaryCardsProps {
  monthIncome: number;
  monthExpenses: number;
  viewType: 'income' | 'expense';
  onViewTypeChange: (type: 'income' | 'expense') => void;
  formatCurrency: (amount: number) => string;
}

function SummaryCards({
  monthIncome,
  monthExpenses,
  viewType,
  onViewTypeChange,
  formatCurrency,
}: SummaryCardsProps) {
  const balance = monthIncome - monthExpenses;

  return (
    // ✅ Summary Card - Contenedor con bordes y sombra
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5" data-tour="stats-summary">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Income */}
        <button
          onClick={() => onViewTypeChange('income')}
          className={`text-center transition-all tap-scale ${
            viewType === 'income' ? 'scale-105' : ''
          }`}
          data-tour="stats-income"
        >
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 font-medium uppercase tracking-wide">
            Ingresos
          </p>
          <p className={`text-sm sm:text-base font-bold break-words leading-tight ${
            viewType === 'income' 
              ? 'text-[#10B981] dark:text-green-400' 
              : 'text-[#10B981] dark:text-green-400'
          }`}>
            {formatCurrency(monthIncome)}
          </p>
        </button>

        {/* Expenses */}
        <button
          onClick={() => onViewTypeChange('expense')}
          className={`text-center transition-all tap-scale ${
            viewType === 'expense' ? 'scale-105' : ''
          }`}
          data-tour="stats-expenses"
        >
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 font-medium uppercase tracking-wide">
            Gastos
          </p>
          <p className={`text-sm sm:text-base font-bold break-words leading-tight ${
            viewType === 'expense' 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(monthExpenses)}
          </p>
        </button>

        {/* Balance */}
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 font-medium uppercase tracking-wide">
            Balance
          </p>
          <p className={`text-sm sm:text-base font-bold break-words leading-tight ${
            balance >= 0 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Memoizar comparando valores numéricos y viewType
export default React.memo(SummaryCards, (prevProps, nextProps) => {
  return (
    prevProps.monthIncome === nextProps.monthIncome &&
    prevProps.monthExpenses === nextProps.monthExpenses &&
    prevProps.viewType === nextProps.viewType
  );
});