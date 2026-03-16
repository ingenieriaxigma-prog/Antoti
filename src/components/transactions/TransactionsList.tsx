import { memo } from 'react';
import { Receipt } from 'lucide-react';
import { Transaction } from '../../types';
import DayGroup from './DayGroup';

/**
 * TransactionsList Component
 * 
 * Main scrollable list of grouped transactions or empty state.
 * Memoized to prevent re-renders when filters change.
 * Now supports category emoji display.
 * 
 * @param {Record<string, Transaction[]>} groupedTransactions - Transactions grouped by date
 * @param {string[]} sortedDates - Sorted array of date keys
 * @param {Function} getDayTotal - Calculate day totals
 * @param {Function} parseDate - Parse date string
 * @param {Function} formatCurrency - Currency formatter
 * @param {Function} getCategoryName - Get category name
 * @param {Function} getAccountName - Get account name
 * @param {Function} getCategoryColor - Get category color
 * @param {Function} getCategoryEmoji - Get category emoji
 * @param {Function} getSubcategoryName - Get subcategory name
 * @param {Function} onEditTransaction - Edit handler
 * @param {Function} onDeleteTransaction - Delete handler
 */

interface TransactionsListProps {
  // New props (required)
  groupedTransactions: Record<string, Transaction[]>;
  sortedDates: string[];
  getDayTotal: (transactions: Transaction[]) => { income: number; expenses: number };
  parseDate: (date: string) => Date;
  formatCurrency: (amount: number) => string;
  getCategoryName: (categoryId?: string, subcategoryId?: string) => string;
  getAccountName: (accountId: string) => string;
  getCategoryColor: (categoryId?: string) => string;
  getCategoryEmoji?: (categoryId?: string, type?: 'income' | 'expense' | 'transfer') => string;
  getSubcategoryName: (categoryId?: string, subcategoryId?: string) => string | null;
  onEditTransaction: (transactionId: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
  
  // Old props (optional, for backward compatibility - will be ignored)
  transactions?: Transaction[];
  categories?: any[];
  accounts?: any[];
}

const TransactionsList = memo<TransactionsListProps>(
  ({
    groupedTransactions,
    sortedDates,
    getDayTotal,
    parseDate,
    formatCurrency,
    getCategoryName,
    getAccountName,
    getCategoryColor,
    getCategoryEmoji,
    getSubcategoryName,
    onEditTransaction,
    onDeleteTransaction,
  }) => {
    // 🛡️ Defensive check: Ensure sortedDates is an array
    if (!sortedDates || !Array.isArray(sortedDates) || sortedDates.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No hay transacciones</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Agrega una nueva transacción para comenzar
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        {sortedDates.map((date) => {
          const dayTransactions = groupedTransactions[date];
          const dayTotal = getDayTotal(dayTransactions);

          return (
            <DayGroup
              key={date}
              date={date}
              transactions={dayTransactions}
              dayTotal={dayTotal}
              parseDate={parseDate}
              formatCurrency={formatCurrency}
              getCategoryName={getCategoryName}
              getAccountName={getAccountName}
              getCategoryColor={getCategoryColor}
              getCategoryEmoji={getCategoryEmoji}
              getSubcategoryName={getSubcategoryName}
              onEditTransaction={onEditTransaction}
              onDeleteTransaction={onDeleteTransaction}
            />
          );
        })}
      </>
    );
  },
  // Custom comparison: only re-render if sorted dates change
  (prevProps, nextProps) => {
    // 🛡️ Defensive check: Handle undefined or null sortedDates
    const prevDates = prevProps.sortedDates || [];
    const nextDates = nextProps.sortedDates || [];
    
    return (
      prevDates.length === nextDates.length &&
      prevDates.join(',') === nextDates.join(',')
    );
  }
);

TransactionsList.displayName = 'TransactionsList';

export default TransactionsList;