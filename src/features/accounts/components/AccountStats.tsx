/**
 * AccountStats Component
 * 
 * Displays total balance, assets, and liabilities summary
 */

import { useLocalization } from '../../../hooks/useLocalization';
import type { AccountStatsProps } from '../types';

export function AccountStats({ 
  totalBalance, 
  totalAssets, 
  totalLiabilities, 
  formatCurrency 
}: AccountStatsProps) {
  const { t } = useLocalization();

  return (
    // ✅ Summary Card - Contenedor con bordes y sombra
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5" data-tour="accounts-summary">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Total Balance */}
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 uppercase tracking-wide font-medium">
            Total
          </p>
          <p className={`text-sm sm:text-base font-bold ${
            totalBalance >= 0
              ? 'text-[#10B981] dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(totalBalance)}
          </p>
        </div>

        {/* Assets */}
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 uppercase tracking-wide font-medium">
            {t('accounts.assets')}
          </p>
          <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(totalAssets)}
          </p>
        </div>

        {/* Liabilities */}
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 uppercase tracking-wide font-medium">
            {t('accounts.debts')}
          </p>
          <p className="text-sm sm:text-base font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(Math.abs(totalLiabilities))}
          </p>
        </div>
      </div>
    </div>
  );
}