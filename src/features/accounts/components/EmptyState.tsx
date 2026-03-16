/**
 * EmptyState Component
 * 
 * Displayed when there are no accounts
 */

import { Plus, Wallet, TestTube } from 'lucide-react';
import { useLocalization } from '../../../hooks/useLocalization';

interface EmptyStateProps {
  onAddAccount: () => void;
  onGenerateTestData: () => void;
}

export function EmptyState({ onAddAccount, onGenerateTestData }: EmptyStateProps) {
  const { t } = useLocalization();

  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <Wallet className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-gray-900 dark:text-white mb-2">
        {t('accounts.noAccounts')}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
        {t('accounts.newAccount')}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button
          onClick={onAddAccount}
          className="px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg"
        >
          <Plus className="w-5 h-5 inline-block mr-2 -mt-0.5" />
          {t('accounts.newAccount')}
        </button>
        <button
          onClick={onGenerateTestData}
          className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all"
        >
          <TestTube className="w-5 h-5 inline-block mr-2 -mt-0.5" />
          Datos de Prueba
        </button>
      </div>
    </div>
  );
}
