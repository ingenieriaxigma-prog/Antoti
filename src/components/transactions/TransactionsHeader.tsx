import { memo } from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useLocalization } from '../../hooks/useLocalization';

/**
 * TransactionsHeader Component
 * 
 * Displays the header with navigation and Oti chat button.
 * Memoized to prevent unnecessary re-renders.
 * 
 * @param {Function} onNavigate - Navigate to different screens
 */

interface TransactionsHeaderProps {
  onNavigate: (screen: string) => void;
}

const TransactionsHeader = memo<TransactionsHeaderProps>(({ onNavigate }) => {
  const { t } = useLocalization();
  
  return (
    <div className="fixed-top-header bg-white dark:bg-gray-900 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm safe-area-top">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-target-md tap-scale"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-gray-900 dark:text-white">{t('transactions.title')}</h1>
        <button 
          onClick={() => onNavigate('oti-chat')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-target-md tap-scale text-purple-600 dark:text-purple-400"
          title="Chat con Oti - Asistente IA"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
});

TransactionsHeader.displayName = 'TransactionsHeader';

export default TransactionsHeader;