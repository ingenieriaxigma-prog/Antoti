/**
 * TransactionFilters
 * 
 * Componente para filtrar transacciones por tipo.
 * Memoizado para mejor performance.
 */

import React from 'react';
import { TrendingUp, TrendingDown, ArrowLeftRight, List } from 'lucide-react';

interface TransactionFiltersProps {
  filterType: 'all' | 'income' | 'expense' | 'transfer';
  onFilterChange: (type: 'all' | 'income' | 'expense' | 'transfer') => void;
}

function TransactionFilters({ filterType, onFilterChange }: TransactionFiltersProps) {
  const filters = [
    { type: 'all' as const, label: 'Todas', icon: List },
    { type: 'income' as const, label: 'Ingresos', icon: TrendingUp },
    { type: 'expense' as const, label: 'Gastos', icon: TrendingDown },
    { type: 'transfer' as const, label: 'Transferencias', icon: ArrowLeftRight },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => onFilterChange(type)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex-shrink-0
            ${
              filterType === type
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
            }
          `}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

// Memoizar para evitar re-renders
export default React.memo(TransactionFilters, (prevProps, nextProps) => {
  return prevProps.filterType === nextProps.filterType;
});
