import { ArrowLeft, Calendar } from 'lucide-react';
import { Transaction, Category, Account } from '../types';
import { parseLocalDate } from '../utils/dateUtils';
import BottomNav from './BottomNav';

interface CategoryTransactionsProps {
  categoryKey: string;
  month: number;
  year: number;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onNavigate: (screen: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export default function CategoryTransactions({
  categoryKey,
  month,
  year,
  transactions,
  categories,
  accounts,
  onNavigate,
  onEditTransaction,
}: CategoryTransactionsProps) {
  // Split the key to get category and subcategory IDs
  const [categoryId, subcategoryId] = categoryKey.split('::');
  const category = categories.find(c => c.id === categoryId);
  
  let categoryName = category?.name || 'Otros';
  if (subcategoryId && category) {
    const subcategory = category.subcategories?.find(s => s.id === subcategoryId);
    if (subcategory) {
      categoryName = `${category.name} - ${subcategory.name}`;
    }
  }

  // Determine the transaction type based on the category
  // For 'others_grouped' and 'unknown', we need to infer from the transactions
  let transactionType: 'income' | 'expense' | null = null;
  if (categoryId !== 'others_grouped' && categoryId !== 'unknown') {
    transactionType = category?.type || null;
  } else {
    // For grouped categories, infer type from the first transaction we find
    const sampleTransaction = transactions.find(t => {
      const date = parseLocalDate(t.date);
      return date.getMonth() === month && date.getFullYear() === year && t.type !== 'transfer';
    });
    transactionType = sampleTransaction?.type || 'expense';
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter transactions for this category and month
  const filteredTransactions = transactions.filter(t => {
    const date = parseLocalDate(t.date);
    const matchesMonth = date.getMonth() === month && date.getFullYear() === year;
    const matchesType = t.type === transactionType;
    
    // Handle the special case of 'unknown' category (transactions without category)
    let matchesCategory = false;
    if (categoryId === 'unknown') {
      // Match transactions with no category or with 'unknown'
      matchesCategory = !t.category || t.category === 'unknown';
    } else if (categoryId === 'others_grouped') {
      // Special case for grouped "Otros" - show only transactions from small categories
      // First, replicate the exact logic from Statistics.tsx to determine small categories
      const monthTransactions = transactions.filter(tx => {
        const txDate = parseLocalDate(tx.date);
        return txDate.getMonth() === month && txDate.getFullYear() === year && tx.type === transactionType && tx.type !== 'transfer';
      });
      
      // Calculate category totals using the same logic as Statistics.tsx (group by category only)
      const categoryTotals: Record<string, number> = {};
      monthTransactions.forEach(tx => {
        const catKey = tx.category || 'unknown';
        categoryTotals[catKey] = (categoryTotals[catKey] || 0) + tx.amount;
      });
      
      const totalAmount = Object.values(categoryTotals).reduce((sum, amt) => sum + amt, 0);
      
      // Calculate percentage for each category
      const categoryPercentages: Record<string, number> = {};
      Object.entries(categoryTotals).forEach(([key, amount]) => {
        categoryPercentages[key] = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      });
      
      // Get the category key for this transaction (category only, not subcategory)
      const txCatKey = t.category || 'unknown';
      
      // Include only transactions from categories with less than 3%
      matchesCategory = categoryPercentages[txCatKey] < 3;
    } else {
      matchesCategory = t.category === categoryId;
    }
    
    // Handle subcategory matching
    let matchesSubcategory = true;
    if (subcategoryId) {
      // If a specific subcategory is selected, only show transactions with that subcategory
      matchesSubcategory = t.subcategory === subcategoryId;
    }
    // REMOVED: No longer filter out subcategories when showing main category
    // We want to show ALL transactions for the category, including subcategories
    
    return matchesMonth && matchesType && matchesCategory && matchesSubcategory && t.type !== 'transfer';
  });

  // Calculate subcategory breakdown for this category
  const subcategoryBreakdown = subcategoryId ? [] : (() => {
    const breakdown: Record<string, { name: string; emoji: string; amount: number; count: number }> = {};
    
    filteredTransactions.forEach(t => {
      if (t.subcategory) {
        const subcategory = category?.subcategories?.find(s => s.id === t.subcategory);
        const key = t.subcategory;
        
        if (!breakdown[key]) {
          breakdown[key] = {
            name: subcategory?.name || 'Sin nombre',
            emoji: subcategory?.emoji || '📁',
            amount: 0,
            count: 0,
          };
        }
        breakdown[key].amount += t.amount;
        breakdown[key].count += 1;
      }
    });
    
    return Object.entries(breakdown)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.amount - a.amount);
  })();

  // Sort by date descending
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
  );

  const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || '';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => onNavigate('statistics')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg -ml-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-gray-900 dark:text-white">Transacciones</h1>
            <div className="w-10" />
          </div>

          {/* Category Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category?.color || '#6b7280' }}
              />
              <h2 className="text-gray-900 dark:text-white">{categoryName}</h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(year, month).toLocaleDateString('es-ES', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-gray-900 dark:text-white">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Subcategory Breakdown */}
        {subcategoryBreakdown.length > 0 && (
          <div className="p-4 mb-2">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Desglose por subcategoría
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
              {subcategoryBreakdown.map((sub) => (
                <div key={sub.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sub.emoji}</span>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {sub.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {sub.count} transacción{sub.count !== 1 ? 'es' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 dark:text-white">
                      {formatCurrency(sub.amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {((sub.amount / total) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sortedTransactions.length > 0 ? (
          <div className="p-4 space-y-2">
            {subcategoryBreakdown.length > 0 && (
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Todas las transacciones
              </h3>
            )}
            {sortedTransactions.map((transaction) => {
              // Get the actual category for this transaction (it might be different from the filter)
              const txnCategory = categories.find(c => c.id === transaction.category);
              const txnCategoryName = txnCategory?.name || 'Sin categoría';
              const txnCategoryColor = txnCategory?.color || '#6b7280';
              
              // Get subcategory info if exists
              let displayName = txnCategoryName;
              if (transaction.subcategory && txnCategory) {
                const txnSubcategory = txnCategory.subcategories?.find(s => s.id === transaction.subcategory);
                if (txnSubcategory) {
                  displayName = `${txnCategoryName} - ${txnSubcategory.name}`;
                }
              }
              
              return (
                <button
                  key={transaction.id}
                  onClick={() => onEditTransaction(transaction)}
                  className="w-full bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: txnCategoryColor }}
                        />
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {displayName}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getAccountName(transaction.account)}
                      </p>
                      {transaction.note && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
                          {transaction.note}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(transaction.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`font-medium ${
                          transaction.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <p className="text-gray-500 dark:text-gray-400">
                No hay transacciones en esta categoría
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                para este período
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sortedTransactions.length} transacción{sortedTransactions.length !== 1 ? 'es' : ''}
          </span>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-gray-900 dark:text-white">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="statistics" onNavigate={onNavigate} />
    </div>
  );
}