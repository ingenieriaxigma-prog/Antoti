import { memo } from 'react';
import { ArrowLeftRight, Edit, Trash2 } from 'lucide-react';
import { Transaction } from '../../types';

/**
 * TransactionItem Component
 * 
 * Individual transaction item card.
 * Memoized to prevent re-renders when sibling transactions update.
 * Now displays category emoji for better visual identification.
 * 
 * @param {Transaction} transaction - Transaction data
 * @param {Function} getCategoryName - Get category display name
 * @param {Function} getAccountName - Get account name
 * @param {Function} getCategoryColor - Get category color
 * @param {Function} getCategoryEmoji - Get category emoji
 * @param {Function} getSubcategoryName - Get subcategory name
 * @param {Function} formatCurrency - Currency formatter
 * @param {Function} onEdit - Edit handler
 * @param {Function} onDelete - Delete handler
 */

interface TransactionItemProps {
  transaction: Transaction;
  getCategoryName: (categoryId?: string, subcategoryId?: string) => string;
  getAccountName: (accountId: string) => string;
  getCategoryColor: (categoryId?: string) => string;
  getCategoryEmoji?: (categoryId?: string, type?: 'income' | 'expense' | 'transfer') => string;
  getSubcategoryName: (categoryId?: string, subcategoryId?: string) => string | null;
  formatCurrency: (amount: number) => string;
  onEdit: (transactionId: string) => void;
  onDelete: (transactionId: string) => void;
}

const TransactionItem = memo<TransactionItemProps>(
  ({
    transaction,
    getCategoryName,
    getAccountName,
    getCategoryColor,
    getCategoryEmoji,
    getSubcategoryName,
    formatCurrency,
    onEdit,
    onDelete,
  }) => {
    const color = getCategoryColor(transaction.category);

    return (
      <div 
        onClick={() => onEdit(transaction.id)}
        className="px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-colors cursor-pointer touch-target"
      >
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 text-xl sm:text-2xl"
          style={{ backgroundColor: color + '20' }}
        >
          {getCategoryEmoji ? (
            getCategoryEmoji(transaction.category, transaction.type)
          ) : transaction.type === 'transfer' ? (
            <ArrowLeftRight className="w-5 h-5" style={{ color }} />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-gray-900 dark:text-white truncate">
            {transaction.type === 'transfer'
              ? `${getAccountName(transaction.account)} → ${getAccountName(transaction.toAccount!)}`
              : getCategoryName(transaction.category, transaction.subcategory)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {transaction.type === 'transfer'
              ? (transaction.note || 'Transferencia')
              : (getSubcategoryName(transaction.category, transaction.subcategory) || 
                 transaction.note || 
                 getAccountName(transaction.account))}
          </p>
        </div>

        <div className="text-right flex-shrink-0 min-w-[90px]">
          <p
            className={
              transaction.type === 'income'
                ? 'text-green-600 dark:text-green-400'
                : transaction.type === 'expense'
                ? 'text-red-600 dark:text-red-400'
                : 'text-blue-600 dark:text-blue-400'
            }
          >
            {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
            {formatCurrency(transaction.amount)}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(transaction.id);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            style={{ touchAction: 'manipulation' }}
            aria-label="Editar transacción"
          >
            <Edit className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(transaction.id);
            }}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            style={{ touchAction: 'manipulation' }}
            aria-label="Eliminar transacción"
          >
            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
          </button>
        </div>
      </div>
    );
  },
  // Custom comparison: only re-render if transaction ID changes
  (prevProps, nextProps) => {
    return prevProps.transaction.id === nextProps.transaction.id &&
           prevProps.transaction.amount === nextProps.transaction.amount &&
           prevProps.transaction.note === nextProps.transaction.note &&
           prevProps.transaction.type === nextProps.transaction.type;
  }
);

TransactionItem.displayName = 'TransactionItem';

export default TransactionItem;