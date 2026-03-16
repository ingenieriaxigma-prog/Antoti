import { memo } from 'react';
import { Transaction } from '../../types';
import TransactionItem from './TransactionItem';

/**
 * DayGroup Component
 * 
 * Groups transactions by day with date header.
 * Memoized to prevent re-renders when other days update.
 * Now supports category emoji display.
 * 
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {Transaction[]} transactions - Transactions for this day
 * @param {Object} dayTotal - Income and expenses total for the day
 * @param {Function} parseDate - Parse date string to Date object
 * @param {Function} formatCurrency - Currency formatter
 * @param {Function} getCategoryName - Get category display name
 * @param {Function} getAccountName - Get account name
 * @param {Function} getCategoryColor - Get category color
 * @param {Function} getCategoryEmoji - Get category emoji
 * @param {Function} getSubcategoryName - Get subcategory name
 * @param {Function} onEditTransaction - Edit handler
 * @param {Function} onDeleteTransaction - Delete handler
 */

interface DayGroupProps {
  date: string;
  transactions: Transaction[];
  dayTotal: { income: number; expenses: number };
  parseDate: (date: string) => Date;
  formatCurrency: (amount: number) => string;
  getCategoryName: (categoryId?: string, subcategoryId?: string) => string;
  getAccountName: (accountId: string) => string;
  getCategoryColor: (categoryId?: string) => string;
  getCategoryEmoji?: (categoryId?: string, type?: 'income' | 'expense' | 'transfer') => string;
  getSubcategoryName: (categoryId?: string, subcategoryId?: string) => string | null;
  onEditTransaction: (transactionId: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

const DayGroup = memo<DayGroupProps>(
  ({
    date,
    transactions,
    dayTotal,
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
    const dateObj = parseDate(date);
    const isToday = dateObj.toDateString() === new Date().toDateString();

    return (
      <div className="mb-2">
        {/* Date Header - Sticky */}
        <div className="sticky top-0 bg-gray-100 dark:bg-gray-900 px-4 sm:px-6 py-2.5 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-900 dark:text-white font-medium">
              {dateObj.getDate()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isToday 
                ? 'Hoy' 
                : dateObj.toLocaleDateString('es-ES', { weekday: 'short', month: 'short' })}
            </span>
          </div>
          <div className="flex gap-3 sm:gap-4 text-xs">
            {dayTotal.income > 0 && (
              <span className="text-green-600 dark:text-green-400">
                +{formatCurrency(dayTotal.income)}
              </span>
            )}
            {dayTotal.expenses > 0 && (
              <span className="text-red-600 dark:text-red-400">
                -{formatCurrency(dayTotal.expenses)}
              </span>
            )}
          </div>
        </div>

        {/* Day Transactions - Touch-optimized cards */}
        <div className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              getCategoryName={getCategoryName}
              getAccountName={getAccountName}
              getCategoryColor={getCategoryColor}
              getCategoryEmoji={getCategoryEmoji}
              getSubcategoryName={getSubcategoryName}
              formatCurrency={formatCurrency}
              onEdit={onEditTransaction}
              onDelete={onDeleteTransaction}
            />
          ))}
        </div>
      </div>
    );
  },
  // Custom comparison: only re-render if date or transaction count changes
  (prevProps, nextProps) => {
    return (
      prevProps.date === nextProps.date &&
      prevProps.transactions.length === nextProps.transactions.length &&
      prevProps.dayTotal.income === nextProps.dayTotal.income &&
      prevProps.dayTotal.expenses === nextProps.dayTotal.expenses
    );
  }
);

DayGroup.displayName = 'DayGroup';

export default DayGroup;