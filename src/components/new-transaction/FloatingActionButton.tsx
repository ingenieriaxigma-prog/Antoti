import { memo } from 'react';
import { Check, Save, Edit } from 'lucide-react';

/**
 * FloatingActionButton Component
 * 
 * FAB (Floating Action Button) para guardar transacciones.
 * Posicionado en la esquina inferior izquierda, siempre visible.
 * 
 * Características:
 * - Color dinámico según tipo de transacción (rojo/verde/azul)
 * - Texto descriptivo: "Guardar Gasto", "Guardar Ingreso", "Guardar Transfer"
 * - Estado deshabilitado cuando faltan campos obligatorios
 * - Animación sutil (pulse) cuando se habilita
 * - Icono + texto para máxima claridad
 * 
 * @param {Function} onSubmit - Handler para guardar transacción
 * @param {string} transactionType - Tipo: 'expense' | 'income' | 'transfer'
 * @param {boolean} isDisabled - Si está deshabilitado (campos faltantes)
 * @param {boolean} isEditing - Si está editando transacción existente
 */

interface FloatingActionButtonProps {
  onSubmit: () => void;
  transactionType: 'expense' | 'income' | 'transfer';
  isDisabled: boolean;
  isEditing: boolean;
}

const FloatingActionButton = memo<FloatingActionButtonProps>(
  ({ onSubmit, transactionType, isDisabled, isEditing }) => {
    // Colores dinámicos según tipo de transacción
    const getButtonColors = () => {
      if (isDisabled) {
        return 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed';
      }
      
      switch (transactionType) {
        case 'expense':
          return 'bg-gradient-to-br from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-xl shadow-red-500/40 dark:shadow-red-500/60';
        case 'income':
          return 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl shadow-green-500/40 dark:shadow-green-500/60';
        case 'transfer':
          return 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-xl shadow-blue-500/40 dark:shadow-blue-500/60';
        default:
          return 'bg-gradient-to-br from-blue-500 to-blue-600';
      }
    };

    // Texto dinámico según tipo
    const getButtonText = () => {
      if (isEditing) {
        return 'Actualizar';
      }
      
      switch (transactionType) {
        case 'expense':
          return 'Guardar Gasto';
        case 'income':
          return 'Guardar Ingreso';
        case 'transfer':
          return 'Guardar Transfer';
        default:
          return 'Guardar';
      }
    };

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSubmit();
        }}
        disabled={isDisabled}
        className={`
          fixed bottom-6 left-6 z-50
          flex items-center justify-center
          w-16 h-16 rounded-full
          text-white
          transition-all duration-300
          touch-target
          ${getButtonColors()}
          ${isDisabled 
            ? 'opacity-50 scale-95' 
            : 'hover:scale-110 active:scale-95 animate-fade-in'
          }
          ${!isDisabled && 'shadow-2xl'}
          group
        `}
        style={{
          // Safe area para dispositivos con gestos de navegación
          marginBottom: 'env(safe-area-inset-bottom, 0)',
          touchAction: 'manipulation',
        }}
        aria-label={getButtonText()}
      >
        {/* Icono central */}
        {isEditing ? (
          <Edit className="w-7 h-7 drop-shadow-md relative z-10" strokeWidth={2.5} />
        ) : (
          <Save className="w-7 h-7 drop-shadow-md relative z-10" strokeWidth={2.5} />
        )}
        
        {/* Ping animation cuando está habilitado */}
        {!isDisabled && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-20 animate-ping" />
        )}

        {/* Shimmer effect cuando está habilitado */}
        {!isDisabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full" 
            style={{
              animation: 'shimmer 2s infinite',
            }}
          />
        )}
        
        {/* Pulse glow effect */}
        {!isDisabled && (
          <div className="absolute inset-0 rounded-full animate-pulse-slow opacity-40" 
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
            }}
          />
        )}
      </button>
    );
  }
  // ✅ FIX: Removed custom comparison - let React handle it naturally
  // The custom comparison was preventing re-renders when onSubmit changed,
  // causing stale closure bugs where old values were captured in the callback
);

FloatingActionButton.displayName = 'FloatingActionButton';

export default FloatingActionButton;