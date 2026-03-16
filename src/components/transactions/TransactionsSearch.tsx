import { memo } from 'react';
import { Search } from 'lucide-react';
import { useLocalization } from '../../hooks/useLocalization';

/**
 * TransactionsSearch Component
 * 
 * Search input for filtering transactions.
 * Memoized to prevent unnecessary re-renders when parent updates.
 * 
 * @param {string} value - Current search query
 * @param {Function} onChange - Search query change handler
 */

interface TransactionsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const TransactionsSearch = memo<TransactionsSearchProps>(({ value, onChange }) => {
  const { t } = useLocalization();
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('common.search')}
        className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all text-fluid-base"
      />
    </div>
  );
});

TransactionsSearch.displayName = 'TransactionsSearch';

export default TransactionsSearch;