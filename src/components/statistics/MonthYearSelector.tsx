/**
 * MonthYearSelector
 * 
 * Selectores de mes y año optimizados con React.memo.
 * Solo se re-renderizan cuando cambian los valores seleccionados.
 */

import React from 'react';
import { Calendar } from 'lucide-react';

interface MonthYearSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

function MonthYearSelector({
  selectedMonth,
  selectedYear,
  onPreviousMonth,
  onNextMonth,
}: MonthYearSelectorProps) {
  return (
    // ✅ NEW: Compact horizontal layout (same as Dashboard)
    <div className="flex items-center justify-between gap-3" data-tour="stats-month-selector">
      <button
        onClick={onPreviousMonth}
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
        onClick={onNextMonth}
        className="p-2.5 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-target tap-scale"
        aria-label="Mes siguiente"
      >
        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
}

// Memoizar solo si cambian mes o año
export default React.memo(MonthYearSelector, (prevProps, nextProps) => {
  return (
    prevProps.selectedMonth === nextProps.selectedMonth &&
    prevProps.selectedYear === nextProps.selectedYear
  );
});