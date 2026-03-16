import { ArrowLeft, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { Budget, Transaction, Category } from '../types';
import { formatCurrency } from '../utils/format';
import { parseLocalDate, getColombiaTime } from '../utils/dateUtils'; // ✅ Import parseLocalDate and getColombiaTime
import { useLocalization } from '../hooks/useLocalization';

export default function BudgetDetail({ 
  budget, 
  transactions,
  categories,
  onBack 
}: { 
  budget: Budget;
  transactions: Transaction[];
  categories: Category[];
  onBack: () => void;
}) {
  const { t } = useLocalization();
  
  if (!budget) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('budgets.noBudget')}</p>
        </div>
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>
    );
  }

  const colombiaTime = getColombiaTime(); // ✅ FIX: Use Colombia time
  const currentMonth = colombiaTime.getMonth();
  const currentYear = colombiaTime.getFullYear();

  // Filter transactions for this budget's category in the current month
  const categoryTransactions = transactions.filter(t => {
    const date = parseLocalDate(t.date); // ✅ FIX: Use parseLocalDate instead of new Date
    return (
      t.type === 'expense' &&
      t.category === budget.categoryId &&
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
  const percentage = (totalSpent / budget.amount) * 100;
  const remaining = budget.amount - totalSpent;

  // Find the category
  const category = categories.find(c => c.id === budget.categoryId);
  if (!category) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Categoría no encontrada</p>
        <button
          onClick={() => onBack()}
          className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  // Group by subcategory
  const getSubcategoryName = (subcategoryId?: string) => {
    if (!subcategoryId) return null;
    const subcategory = category.subcategories?.find(s => s.id === subcategoryId);
    return subcategory?.name;
  };

  const subcategoryTotals = categoryTransactions.reduce((acc, t) => {
    const subName = getSubcategoryName(t.subcategory) || 'Sin subcategoría';
    if (!acc[subName]) {
      acc[subName] = 0;
    }
    acc[subName] += t.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onBack()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-gray-900 dark:text-white">Detalle de Presupuesto</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{category.name}</p>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">
          {/* Budget Overview Card */}
          <div 
            className="rounded-2xl p-6 text-white shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)`
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/30 rounded-full p-3">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/90 text-sm">Presupuesto Mensual</p>
                <h2 className="text-white">{category.name}</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/90">Gastado</span>
                  <span className="text-white">{formatCurrency(totalSpent)}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white/90">Presupuesto</span>
                  <span className="text-white">{formatCurrency(budget.amount)}</span>
                </div>
                
                <div className="w-full bg-white/30 rounded-full h-2.5 mb-2">
                  <div
                    className="h-2.5 rounded-full bg-white transition-all"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/90">{percentage.toFixed(1)}% usado</span>
                  <span className={`text-sm ${remaining >= 0 ? 'text-white' : 'text-red-200'}`}>
                    {remaining >= 0 ? 'Disponible: ' : 'Excedido: '}
                    {formatCurrency(Math.abs(remaining))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subcategory Breakdown */}
          {Object.keys(subcategoryTotals).length > 0 && (
            <div>
              <h3 className="text-gray-900 dark:text-white mb-3">Desglose por Subcategoría</h3>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 shadow-sm">
                {Object.entries(subcategoryTotals)
                  .sort(([, a], [, b]) => b - a)
                  .map(([subName, amount]) => {
                    const subPercentage = (amount / totalSpent) * 100;
                    return (
                      <div key={subName} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">{subName}</span>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ 
                              width: `${subPercentage}%`,
                              backgroundColor: category.color
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {subPercentage.toFixed(1)}% del total
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-900 dark:text-white">
                Transacciones ({categoryTransactions.length})
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {categoryTransactions.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center shadow-sm">
                <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No hay gastos registrados este mes
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 shadow-sm">
                {categoryTransactions.map((transaction) => {
                  const subcategoryName = getSubcategoryName(transaction.subcategory);
                  return (
                    <div key={transaction.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: getPastelBackground(category.color) }}
                            >
                              <Receipt className="w-4 h-4" style={{ color: category.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 dark:text-white truncate">
                                {transaction.note || category.name}
                              </p>
                              {subcategoryName && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Tag className="w-3 h-3 text-gray-400" />
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {subcategoryName}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-red-600 dark:text-red-400">
                            -{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}