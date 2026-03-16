import { memo } from 'react';
import { Plus } from 'lucide-react';

/**
 * FloatingActionButton Component
 * 
 * Floating action button for adding new transactions.
 * Memoized to prevent unnecessary re-renders.
 * 
 * @param {Function} onClick - Click handler
 */

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton = memo<FloatingActionButtonProps>(({ onClick }) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="absolute bottom-24 left-6 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all z-50"
      aria-label="Agregar transacción"
      style={{ touchAction: 'manipulation' }}
    >
      <Plus className="w-6 h-6" />
    </button>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';

export default FloatingActionButton;