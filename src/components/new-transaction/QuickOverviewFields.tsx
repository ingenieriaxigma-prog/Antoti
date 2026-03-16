import { memo, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';

/**
 * QuickOverviewFields Component
 * 
 * Quick access fields showing current transaction values (date, amount, category, account, note).
 * Memoized with custom comparison to prevent unnecessary re-renders.
 * 
 * @param {'income' | 'expense' | 'transfer'} transactionType - Transaction type
 * @param {string} date - Date value (ISO format)
 * @param {string} amount - Amount value
 * @param {string | null} activeField - Currently active field
 * @param {string} selectedCategory - Selected category ID
 * @param {string} selectedSubcategory - Selected subcategory ID
 * @param {string} selectedAccount - Selected account ID
 * @param {string} selectedToAccount - Selected to-account ID (for transfers)
 * @param {string} note - Note text
 * @param {boolean} hasSubcategories - Whether current category has subcategories
 * @param {Function} parseLocalDate - Date parser function
 * @param {Function} formatNumberDisplay - Number formatter
 * @param {Function} getCategoryName - Category name getter
 * @param {Function} getSubcategoryName - Subcategory name getter
 * @param {Function} getAccountName - Account name getter
 * @param {Function} onFieldClick - Field click handler
 */

type ActiveField = 'amount' | 'category' | 'subcategory' | 'account' | 'toAccount' | 'date' | 'note' | null;

interface QuickOverviewFieldsProps {
  transactionType: 'income' | 'expense' | 'transfer';
  date: string;
  amount: string;
  activeField: ActiveField;
  selectedCategory: string;
  selectedSubcategory: string;
  selectedAccount: string;
  selectedToAccount: string;
  note: string;
  hasSubcategories: boolean;
  parseLocalDate: (dateString: string) => Date;
  formatNumberDisplay: (num: string) => string;
  getCategoryName: (categoryId: string) => string;
  getSubcategoryName: (subcategoryId: string) => string;
  getAccountName: (accountId: string) => string;
  onFieldClick: (field: ActiveField) => void;
  onAmountChange?: (value: string) => void; // ✅ NEW: Direct amount change handler
}

const QuickOverviewFields = memo<QuickOverviewFieldsProps>(
  ({
    transactionType,
    date,
    amount,
    activeField,
    selectedCategory,
    selectedSubcategory,
    selectedAccount,
    selectedToAccount,
    note,
    hasSubcategories,
    parseLocalDate,
    formatNumberDisplay,
    getCategoryName,
    getSubcategoryName,
    getAccountName,
    onFieldClick,
    onAmountChange,
  }) => {
    // ✅ NEW: Refs and state for cursor position management
    const inputRef = useRef<HTMLInputElement>(null);
    const cursorPositionRef = useRef<number | null>(null);

    // Colores dinámicos según tipo de transacción
    const getAmountColors = () => {
      if (activeField === 'amount') {
        // Colores intensos cuando está activo
        switch (transactionType) {
          case 'expense':
            return 'bg-gradient-to-br from-red-500 via-red-600 to-rose-600 shadow-2xl shadow-red-500/30 dark:shadow-red-500/50';
          case 'income':
            return 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 shadow-2xl shadow-green-500/30 dark:shadow-green-500/50';
          case 'transfer':
            return 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-2xl shadow-blue-500/30 dark:shadow-blue-500/50';
          default:
            return 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-2xl shadow-blue-500/30 dark:shadow-blue-500/50';
        }
      } else {
        // Colores suaves cuando NO está activo (mantiene color del tipo)
        switch (transactionType) {
          case 'expense':
            return 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 hover:shadow-lg shadow-red-500/10 border border-red-200 dark:border-red-800';
          case 'income':
            return 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 hover:shadow-lg shadow-green-500/10 border border-green-200 dark:border-green-800';
          case 'transfer':
            return 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 hover:shadow-lg shadow-blue-500/10 border border-blue-200 dark:border-blue-800';
          default:
            return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 hover:shadow-lg border border-gray-200 dark:border-gray-700';
        }
      }
    };

    // ✅ NEW: Handle amount input change (Colombian format: . for thousands, , for decimals)
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Remove thousand separators (dots) but keep decimal separator (comma)
      const sanitized = value.replace(/\./g, ''); // Remove all dots (thousand separators)
      
      // Only allow numbers and comma (decimal separator)
      const cleaned = sanitized.replace(/[^\d,]/g, '');
      
      // Prevent multiple decimal commas
      const parts = cleaned.split(',');
      if (parts.length > 2) return;
      
      // Limit decimal places to 2
      if (parts[1] && parts[1].length > 2) return;
      
      // Update the amount with raw value (parent stores raw, we display formatted)
      if (onAmountChange) {
        onAmountChange(cleaned);
      }
    };

    // ✅ UPDATED: Always show formatted value with thousand separators
    const getDisplayValue = () => {
      if (!amount || amount === '0' || amount === '') return '';
      // Always show formatted value, even when editing
      return formatNumberDisplay(amount);
    };
    
    return (
      <div className="bg-white dark:bg-gray-900 px-4 py-4 min-[390px]:py-3 space-y-3 min-[390px]:space-y-2">
        {/* Amount Field - Native Input with Dynamic Gradient */}
        <div
          className={`w-full px-6 min-[390px]:px-5 py-6 min-[390px]:py-4 rounded-2xl min-[390px]:rounded-xl transition-all duration-300 relative overflow-hidden ${getAmountColors()} ${
            activeField === 'amount' ? 'scale-[1.02]' : ''
          }`}
        >
          {/* Shimmer effect cuando está activo */}
          {activeField === 'amount' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          )}
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2 min-[390px]:mb-1">
              <span className={`text-xs sm:text-sm ${
                activeField === 'amount'
                  ? 'text-white/90'
                  : transactionType === 'expense'
                    ? 'text-red-700 dark:text-red-300'
                    : transactionType === 'income'
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-blue-700 dark:text-blue-300'
              }`}>
                Monto
              </span>
              {parseFloat(amount.replace(/\./g, '').replace(',', '.')) > 0 && (
                <div className={`px-2.5 min-[390px]:px-2 py-0.5 rounded-full text-xs ${
                  activeField === 'amount'
                    ? 'bg-white/20 text-white'
                    : transactionType === 'expense'
                      ? 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                      : transactionType === 'income'
                        ? 'bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                        : 'bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                }`}>
                  {transactionType === 'expense' ? 'Gasto' : transactionType === 'income' ? 'Ingreso' : 'Transfer'}
                </div>
              )}
            </div>
            
            {/* Native Input - Always visible with formatted display */}
            <div className="flex items-center gap-2">
              <span className={`text-3xl min-[390px]:text-2xl sm:text-4xl transition-all duration-300 ${
                activeField === 'amount'
                  ? 'text-white'
                  : 'text-gray-900 dark:text-white'
              }`}>
                $
              </span>
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                value={getDisplayValue()}
                onClick={() => onFieldClick('amount')}
                onFocus={() => onFieldClick('amount')}
                onBlur={() => onFieldClick(null)}
                onChange={handleAmountChange}
                className={`flex-1 bg-transparent border-none outline-none text-3xl min-[390px]:text-2xl sm:text-4xl transition-all duration-300 ${
                  activeField === 'amount'
                    ? 'text-white placeholder:text-white/50'
                    : 'text-gray-900 dark:text-white placeholder:text-gray-500'
                } caret-white`}
                placeholder="0"
                style={{ caretColor: activeField === 'amount' ? 'white' : 'currentColor' }}
              />
            </div>
          </div>
        </div>

        {/* 
          Grid de campos secundarios
          ✅ MEJORADO: Siempre visible, incluso cuando activeField === 'amount'
          - Categoría es un campo OBLIGATORIO, debe ser siempre visible
          - Mejora UX: usuario puede ver todos los campos a la vez
        */}
        
        {/* LAYOUT PARA MÓVILES PEQUEÑOS */}
        <div className="min-[390px]:hidden space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Date Field */}
            <button
              onClick={() => onFieldClick('date')}
              className="flex flex-col items-start p-3.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all touch-target tap-scale"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Fecha
              </span>
              <span className="text-sm text-gray-900 dark:text-white truncate w-full">
                {parseLocalDate(date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </button>

            {/* Account Field */}
            <button
              onClick={() => onFieldClick('account')}
              className="flex flex-col items-start p-3.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all touch-target tap-scale"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                {transactionType === 'transfer' ? 'Desde' : 'Cuenta'}
              </span>
              <span className="text-sm text-gray-900 dark:text-white truncate w-full">
                {getAccountName(selectedAccount)}
              </span>
            </button>
          </div>

          {/* Category Field - Destacado cuando no es transfer */}
          {transactionType !== 'transfer' && (
            <button
              onClick={() => onFieldClick('category')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-br from-emerald-50 to-lime-50 dark:from-emerald-900/20 dark:to-lime-900/20 hover:from-emerald-100 hover:to-lime-100 dark:hover:from-emerald-900/30 dark:hover:to-lime-900/30 rounded-xl border border-emerald-200 dark:border-emerald-700 transition-all touch-target tap-scale"
            >
              <span className="text-sm text-purple-700 dark:text-purple-300">
                📂 Categoría
              </span>
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100 truncate ml-2">
                {selectedCategory ? getCategoryName(selectedCategory) : 'Seleccionar'}
              </span>
            </button>
          )}

          {/* Subcategory Field */}
          {transactionType !== 'transfer' && selectedCategory && hasSubcategories && (
            <button
              onClick={() => onFieldClick('subcategory')}
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/40 dark:hover:to-teal-900/40 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 transition-all touch-target tap-scale shadow-sm"
            >
              <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                ↳ Subcategoría
              </span>
              <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100 truncate ml-2">
                {selectedSubcategory ? getSubcategoryName(selectedSubcategory) : 'Opcional'}
              </span>
            </button>
          )}

          {/* To Account (for transfers) */}
          {transactionType === 'transfer' && (
            <button
              onClick={() => onFieldClick('toAccount')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 rounded-xl border border-blue-200 dark:border-blue-700 transition-all touch-target tap-scale"
            >
              <span className="text-sm text-blue-700 dark:text-blue-300">
                ➜ Hacia
              </span>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {getAccountName(selectedToAccount)}
              </span>
            </button>
          )}

          {/* Note Field - Compacto */}
          {note && (
            <button
              onClick={() => onFieldClick('note')}
              className="w-full p-3 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700 transition-all touch-target tap-scale"
            >
              <div className="flex items-start gap-2">
                <span className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">📝</span>
                <span className="text-xs text-amber-700 dark:text-amber-300 text-left truncate flex-1">
                  {note}
                </span>
              </div>
            </button>
          )}
          
          {/* Add Note Button */}
          {!note && !activeField && (
            <button
              onClick={() => onFieldClick('note')}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 transition-all touch-target tap-scale"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">
                + Agregar nota (opcional)
              </span>
            </button>
          )}
        </div>

        {/* LAYOUT PARA MÓVILES GRANDES - Siempre visible, más compacto */}
        <div className="hidden min-[390px]:block space-y-2">
          {/* Primera fila: Fecha y Cuenta - Siempre visible */}
          <div className="grid grid-cols-2 gap-2">
            {/* Date Field */}
            <button
              onClick={() => onFieldClick('date')}
              className="flex flex-col items-start p-2.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all"
            >
              <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" />
                Fecha
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-white truncate w-full">
                {parseLocalDate(date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </button>

            {/* Account Field */}
            <button
              onClick={() => onFieldClick('account')}
              className="flex flex-col items-start p-2.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all"
            >
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                {transactionType === 'transfer' ? 'Desde' : 'Cuenta'}
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-white truncate w-full">
                {getAccountName(selectedAccount)}
              </span>
            </button>
          </div>

          {/* Segunda fila: Categoría/Hacia + Nota */}
          <div className="grid grid-cols-2 gap-2">
            {/* Category Field (o To Account para transfers) */}
            {transactionType !== 'transfer' ? (
              <button
                onClick={() => onFieldClick('category')}
                className="flex flex-col items-start p-2.5 bg-gradient-to-br from-emerald-50 to-lime-50 dark:from-emerald-900/20 dark:to-lime-900/20 hover:from-emerald-100 hover:to-lime-100 dark:hover:from-emerald-900/30 dark:hover:to-lime-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700 transition-all"
              >
                <span className="text-[10px] text-purple-700 dark:text-purple-300 mb-1">
                  📂 Categoría
                </span>
                <span className="text-xs font-medium text-purple-900 dark:text-purple-100 truncate w-full">
                  {selectedCategory ? getCategoryName(selectedCategory) : 'Seleccionar'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => onFieldClick('toAccount')}
                className="flex flex-col items-start p-2.5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 rounded-lg border border-blue-200 dark:border-blue-700 transition-all"
              >
                <span className="text-[10px] text-blue-700 dark:text-blue-300 mb-1">
                  ➜ Hacia
                </span>
                <span className="text-xs font-medium text-blue-900 dark:text-blue-100 truncate w-full">
                  {getAccountName(selectedToAccount)}
                </span>
              </button>
            )}

            {/* Note Field - Siempre visible */}
            <button
              onClick={() => onFieldClick('note')}
              className={`flex flex-col items-start p-2.5 rounded-lg border transition-all ${
                note
                  ? 'bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 border-amber-200 dark:border-amber-700'
                  : 'bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 border-dashed border-gray-300 dark:border-gray-700'
              }`}
            >
              <span className={`text-[10px] mb-1 ${
                note 
                  ? 'text-amber-600 dark:text-amber-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                📝 Nota
              </span>
              <span className={`text-xs truncate w-full text-left ${
                note
                  ? 'text-amber-900 dark:text-amber-100 font-medium'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {note || 'Agregar'}
              </span>
            </button>
          </div>

          {/* Subcategory Field - FULL WIDTH para pantallas grandes */}
          {transactionType !== 'transfer' && selectedCategory && hasSubcategories && (
            <button
              onClick={() => onFieldClick('subcategory')}
              className="w-full flex items-center justify-between p-2.5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/40 dark:hover:to-teal-900/40 rounded-lg border-2 border-emerald-300 dark:border-emerald-700 transition-all shadow-sm"
            >
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium mb-1">
                ↳ Subcategoría
              </span>
              <span className="text-xs font-medium text-emerald-900 dark:text-emerald-100 truncate ml-2">
                {selectedSubcategory ? getSubcategoryName(selectedSubcategory) : 'Opcional'}
              </span>
            </button>
          )}
        </div>
      </div>
    );
  },
  // Custom comparison: re-render only if displayed values change
  (prevProps, nextProps) => {
    return (
      prevProps.transactionType === nextProps.transactionType &&
      prevProps.date === nextProps.date &&
      prevProps.amount === nextProps.amount &&
      prevProps.activeField === nextProps.activeField &&
      prevProps.selectedCategory === nextProps.selectedCategory &&
      prevProps.selectedSubcategory === nextProps.selectedSubcategory &&
      prevProps.selectedAccount === nextProps.selectedAccount &&
      prevProps.selectedToAccount === nextProps.selectedToAccount &&
      prevProps.note === nextProps.note &&
      prevProps.hasSubcategories === nextProps.hasSubcategories
    );
  }
);

QuickOverviewFields.displayName = 'QuickOverviewFields';

export default QuickOverviewFields;