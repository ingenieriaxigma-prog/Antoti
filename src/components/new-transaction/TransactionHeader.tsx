import { memo } from 'react';
import { ArrowLeft, Mic } from 'lucide-react';

/**
 * TransactionHeader Component
 * 
 * Header with back button, title, and optional voice button.
 * Submit button moved to FAB (Floating Action Button) for better UX.
 * Voice button now optional (removed from NewTransaction, kept in Dashboard via SpeedDial).
 * Memoized to prevent re-renders when form values change.
 * 
 * @param {boolean} isEditing - Whether editing existing transaction
 * @param {Function} onCancel - Back/cancel handler
 * @param {Function} onVoiceClick - Voice recognition handler (optional)
 */

interface TransactionHeaderProps {
  isEditing: boolean;
  onCancel: () => void;
  onVoiceClick?: () => void;
}

const TransactionHeader = memo<TransactionHeaderProps>(
  ({ isEditing, onCancel, onVoiceClick }) => {
    return (
      <div className="flex-shrink-0 bg-gradient-to-r from-white via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 px-4 sm:px-6 pt-6 pb-5 sm:pt-7 sm:pb-6 border-b border-gray-200 dark:border-gray-800 shadow-sm safe-area-top">
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl -ml-2 transition-all touch-target tap-scale group"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="text-gray-900 dark:text-white text-lg font-semibold">
              {isEditing ? 'Editar Transacción' : 'Nueva Transacción'}
            </h1>
            {isEditing && (
              <span className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                Modo edición
              </span>
            )}
          </div>

          {/* Voice button - Optional (only show if onVoiceClick provided) */}
          {onVoiceClick ? (
            <button
              onClick={onVoiceClick}
              className="relative p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl transition-all duration-300 touch-target tap-scale shadow-lg shadow-purple-500/30 dark:shadow-purple-500/50 group"
              title="Comando de voz"
            >
              <Mic className="w-5 h-5 text-white drop-shadow-sm" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            </button>
          ) : (
            <div className="w-10" /> /* Spacer for centering */
          )}
        </div>
      </div>
    );
  }
);

TransactionHeader.displayName = 'TransactionHeader';

export default TransactionHeader;