import { useLocalization } from '../../hooks/useLocalization';

interface MonthSummaryProps {
  income: number;
  expenses: number;
  balance: number;
  formatCurrency: (amount: number) => string;
}

export default function MonthSummary({ income, expenses, balance, formatCurrency }: MonthSummaryProps) {
  const { t } = useLocalization();
  
  return (
    <div className="px-4 sm:px-6 py-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('dashboard.income')}</p>
          <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(income)}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('dashboard.expenses')}</p>
          <p className="font-bold text-red-600 dark:text-red-400">{formatCurrency(expenses)}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('dashboard.savings')}</p>
          <p className="font-bold" style={{ color: balance >= 0 ? '#16a34a' : '#dc2626' }}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>
    </div>
  );
}