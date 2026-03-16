import { memo, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Budget, Category } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

/**
 * AddBudgetModal Component
 * 
 * Modal for adding or editing a budget with category selection and amount input.
 * Memoized to prevent unnecessary re-renders.
 * 
 * @param {boolean} isOpen - Modal visibility
 * @param {Budget | null} editingBudget - Budget being edited (null for new)
 * @param {string} selectedCategory - Selected category ID
 * @param {string} budgetAmount - Budget amount input value
 * @param {string} alertThreshold - Alert threshold percentage
 * @param {Category[]} availableCategories - Categories available for selection
 * @param {Budget[]} budgets - All budgets (to check existing)
 * @param {Function} getCategoryName - Get category name
 * @param {Function} getCategoryColor - Get category color
 * @param {Function} onClose - Close modal handler
 * @param {Function} onSelectCategory - Category selection handler
 * @param {Function} onBudgetAmountChange - Amount input change handler
 * @param {Function} onAlertThresholdChange - Threshold change handler
 * @param {Function} onSubmit - Form submit handler
 * @param {Function} onManageCategories - Open category manager
 * @param {boolean} canAddCategory - Whether user can add categories
 * @param {number | null} selectedMonth - Selected month
 * @param {number | null} selectedYear - Selected year
 * @param {Function} onMonthChange - Month change handler
 * @param {Function} onYearChange - Year change handler
 */

interface AddBudgetModalProps {
  isOpen: boolean;
  editingBudget: Budget | null;
  selectedCategory: string;
  budgetAmount: string;
  alertThreshold: string;
  availableCategories: Category[];
  budgets: Budget[];
  getCategoryName: (categoryId: string) => string;
  getCategoryColor: (categoryId: string) => string;
  onClose: () => void;
  onSelectCategory: (categoryId: string) => void;
  onBudgetAmountChange: (value: string) => void;
  onAlertThresholdChange: (value: string) => void;
  onSubmit: () => void;
  onManageCategories?: () => void;
  canAddCategory?: boolean;
  // ✨ NEW: Month and year selection
  selectedMonth: number | null;
  selectedYear: number | null;
  onMonthChange: (month: number | null) => void;
  onYearChange: (year: number | null) => void;
}

const AddBudgetModal = memo<AddBudgetModalProps>(
  ({
    isOpen,
    editingBudget,
    selectedCategory,
    budgetAmount,
    alertThreshold,
    availableCategories,
    budgets,
    getCategoryName,
    getCategoryColor,
    onClose,
    onSelectCategory,
    onBudgetAmountChange,
    onAlertThresholdChange,
    onSubmit,
    onManageCategories,
    canAddCategory,
    // ✨ NEW: Month and year selection
    selectedMonth,
    selectedYear,
    onMonthChange,
    onYearChange,
  }) => {
    // ✅ CRITICAL: All hooks must be called before any early returns
    const { t } = useLocalization();
    
    // ✅ NEW: Ref para el input de monto mensual
    const budgetAmountInputRef = useRef<HTMLInputElement>(null);

    // ✅ NEW: Auto-focus en el input cuando se selecciona una categoría
    useEffect(() => {
      if (selectedCategory && budgetAmountInputRef.current) {
        // Pequeño delay para asegurar que el input esté renderizado
        setTimeout(() => {
          budgetAmountInputRef.current?.focus();
        }, 100);
      }
    }, [selectedCategory]);

    // Early return AFTER all hooks
    if (!isOpen) return null;

    // ✅ NUEVO: Helper para convertir color hex a pastel (opacity 12%)
    const getPastelBackground = (color: string) => {
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.12)`;
      }
      return color;
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
        <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md sm:rounded-t-2xl rounded-t-2xl animate-slide-up max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 dark:text-white">
                {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-45" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto flex-1 pb-24">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700 dark:text-gray-300">Categoría</label>
                {canAddCategory && !editingBudget && onManageCategories && (
                  <button
                    onClick={onManageCategories}
                    className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Gestionar Categorías
                  </button>
                )}
              </div>

              {editingBudget ? (
                // When editing, show only the selected category (read-only)
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center gap-3 border-2 border-blue-500">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getPastelBackground(getCategoryColor(selectedCategory)) }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: getCategoryColor(selectedCategory) }}
                    />
                  </div>
                  <span className="text-gray-900 dark:text-white flex-1">
                    {getCategoryName(selectedCategory)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    No se puede cambiar
                  </span>
                </div>
              ) : availableCategories.length > 0 ? (
                <div className="space-y-2">
                  {availableCategories.map((category) => {
                    const hasExistingBudget = budgets.some((b) => b.categoryId === category.id);
                    return (
                      <button
                        key={category.id}
                        onClick={() => !hasExistingBudget && onSelectCategory(category.id)}
                        disabled={hasExistingBudget}
                        className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                          selectedCategory === category.id
                            ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                            : hasExistingBudget
                            ? 'bg-gray-50 dark:bg-gray-900 opacity-50 cursor-not-allowed'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                        <span className="text-gray-900 dark:text-white flex-1 text-left">
                          {category.name}
                        </span>
                        {hasExistingBudget && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Ya tiene presupuesto
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                    No hay categorías de gastos disponibles
                  </p>
                  {canAddCategory && onManageCategories && (
                    <button
                      onClick={onManageCategories}
                      className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Crear nueva categoría
                    </button>
                  )}
                </div>
              )}
            </div>

            {selectedCategory && (
              <>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Monto Mensual
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={budgetAmount ? new Intl.NumberFormat('es-CO').format(parseFloat(budgetAmount.replace(/\./g, ''))) : ''}
                      onChange={(e) => {
                        // Remover todo excepto números
                        const rawValue = e.target.value.replace(/\D/g, '');
                        // Guardar el valor sin formato (solo números)
                        onBudgetAmountChange(rawValue);
                      }}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                      ref={budgetAmountInputRef}
                    />
                  </div>
                </div>

                {/* ✨ NEW: Period Selection */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    📅 Período de aplicación
                  </h3>
                  
                  {/* Month Selector */}
                  <div className="mb-3">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Mes específico
                    </label>
                    <select
                      value={selectedMonth === null ? '' : selectedMonth}
                      onChange={(e) => onMonthChange(e.target.value === '' ? null : parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos los meses</option>
                      <option value="0">Enero</option>
                      <option value="1">Febrero</option>
                      <option value="2">Marzo</option>
                      <option value="3">Abril</option>
                      <option value="4">Mayo</option>
                      <option value="5">Junio</option>
                      <option value="6">Julio</option>
                      <option value="7">Agosto</option>
                      <option value="8">Septiembre</option>
                      <option value="9">Octubre</option>
                      <option value="10">Noviembre</option>
                      <option value="11">Diciembre</option>
                    </select>
                  </div>

                  {/* Year Selector */}
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Año específico
                    </label>
                    <select
                      value={selectedYear === null ? '' : selectedYear}
                      onChange={(e) => onYearChange(e.target.value === '' ? null : parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos los años</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                  </div>

                  {/* Info message */}
                  <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                    {selectedMonth === null && selectedYear === null && (
                      <span>💡 Este presupuesto aplicará a <strong>todos los meses y años</strong></span>
                    )}
                    {selectedMonth !== null && selectedYear === null && (
                      <span>💡 Este presupuesto aplicará a <strong>{['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][selectedMonth]} de todos los años</strong></span>
                    )}
                    {selectedMonth === null && selectedYear !== null && (
                      <span>💡 Este presupuesto aplicará a <strong>todos los meses de {selectedYear}</strong></span>
                    )}
                    {selectedMonth !== null && selectedYear !== null && (
                      <span>💡 Este presupuesto aplicará solo a <strong>{['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][selectedMonth]} {selectedYear}</strong></span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Alerta al {alertThreshold}% del presupuesto
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={alertThreshold}
                    onChange={(e) => onAlertThresholdChange(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                <button
                  onClick={onSubmit}
                  disabled={!budgetAmount}
                  className="w-full py-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingBudget ? 'Actualizar Presupuesto' : 'Crear Presupuesto'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

AddBudgetModal.displayName = 'AddBudgetModal';

export default AddBudgetModal;