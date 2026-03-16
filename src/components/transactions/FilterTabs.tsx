import { memo } from 'react';
import { useLocalization } from '../../hooks/useLocalization';

/**
 * FilterTabs Component
 * 
 * Filter tabs for transaction type selection.
 * Memoized to prevent re-renders when parent updates.
 * 
 * @param {string} activeFilter - Currently active filter
 * @param {Function} onFilterChange - Filter change handler
 */

interface FilterTabsProps {
  activeFilter: 'all' | 'income' | 'expense' | 'transfer';
  onFilterChange: (filter: 'all' | 'income' | 'expense' | 'transfer') => void;
}

const FilterTabs = memo<FilterTabsProps>(({ activeFilter, onFilterChange }) => {
  const { t } = useLocalization();
  
  const FILTERS = [
    { id: 'all' as const, label: t('transactions.all') },
    { id: 'income' as const, label: t('transactions.types.income') },
    { id: 'expense' as const, label: t('transactions.types.expense') },
    { id: 'transfer' as const, label: t('transactions.types.transfer') },
  ];
  
  return (
    <div className="px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide momentum-scroll">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`touch-target px-5 py-2.5 rounded-full whitespace-nowrap transition-all tap-scale ${
            activeFilter === filter.id
              ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
});

FilterTabs.displayName = 'FilterTabs';

export default FilterTabs;