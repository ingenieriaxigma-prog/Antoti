import { memo } from 'react';
import { TrendingDown, TrendingUp, ArrowLeftRight } from 'lucide-react';

/**
 * TransactionTypeTabs Component
 * 
 * Three tabs for transaction type selection (expense/income/transfer).
 * Memoized to prevent re-renders when other form values change.
 * 
 * @param {'income' | 'expense' | 'transfer'} selectedType - Current transaction type
 * @param {boolean} isEditing - Whether editing (tabs disabled when editing)
 * @param {Function} onTypeChange - Type change handler
 */

interface TransactionTypeTabsProps {
  selectedType: 'income' | 'expense' | 'transfer';
  isEditing: boolean;
  onTypeChange: (type: 'income' | 'expense' | 'transfer') => void;
}

const TransactionTypeTabs = memo<TransactionTypeTabsProps>(
  ({ selectedType, isEditing, onTypeChange }) => {
    return (
      <div className="bg-white dark:bg-gray-900 px-4 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-3 gap-3">
          {/* Expense Tab */}
          <button
            onClick={() => !isEditing && onTypeChange('expense')}
            disabled={isEditing}
            className={`relative overflow-hidden flex flex-col items-center justify-center gap-2 py-4 sm:py-5 rounded-2xl transition-all duration-300 touch-target tap-scale ${
              selectedType === 'expense'
                ? 'bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white shadow-2xl shadow-red-500/30 dark:shadow-red-500/50 scale-105'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700'
            } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {selectedType === 'expense' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            )}
            <TrendingDown className={`w-6 h-6 sm:w-7 sm:h-7 relative z-10 ${
              selectedType === 'expense' ? 'drop-shadow-md' : ''
            }`} />
            <span className={`text-sm sm:text-base relative z-10 ${
              selectedType === 'expense' ? 'drop-shadow-sm' : ''
            }`}>Gasto</span>
          </button>

          {/* Income Tab */}
          <button
            onClick={() => !isEditing && onTypeChange('income')}
            disabled={isEditing}
            className={`relative overflow-hidden flex flex-col items-center justify-center gap-2 py-4 sm:py-5 rounded-2xl transition-all duration-300 touch-target tap-scale ${
              selectedType === 'income'
                ? 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white shadow-2xl shadow-green-500/30 dark:shadow-green-500/50 scale-105'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700'
            } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {selectedType === 'income' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            )}
            <TrendingUp className={`w-6 h-6 sm:w-7 sm:h-7 relative z-10 ${
              selectedType === 'income' ? 'drop-shadow-md' : ''
            }`} />
            <span className={`text-sm sm:text-base relative z-10 ${
              selectedType === 'income' ? 'drop-shadow-sm' : ''
            }`}>Ingreso</span>
          </button>

          {/* Transfer Tab */}
          <button
            onClick={() => !isEditing && onTypeChange('transfer')}
            disabled={isEditing}
            className={`relative overflow-hidden flex flex-col items-center justify-center gap-2 py-4 sm:py-5 rounded-2xl transition-all duration-300 touch-target tap-scale ${
              selectedType === 'transfer'
                ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 text-white shadow-2xl shadow-blue-500/30 dark:shadow-blue-500/50 scale-105'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700'
            } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {selectedType === 'transfer' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            )}
            <ArrowLeftRight className={`w-6 h-6 sm:w-7 sm:h-7 relative z-10 ${
              selectedType === 'transfer' ? 'drop-shadow-md' : ''
            }`} />
            <span className={`text-sm sm:text-base relative z-10 ${
              selectedType === 'transfer' ? 'drop-shadow-sm' : ''
            }`}>Transfer</span>
          </button>
        </div>
      </div>
    );
  },
  // Custom comparison: only re-render if selectedType or isEditing changes
  (prevProps, nextProps) => {
    return (
      prevProps.selectedType === nextProps.selectedType &&
      prevProps.isEditing === nextProps.isEditing
    );
  }
);

TransactionTypeTabs.displayName = 'TransactionTypeTabs';

export default TransactionTypeTabs;