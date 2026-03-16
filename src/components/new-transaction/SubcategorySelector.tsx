import { memo } from 'react';
import { Plus } from 'lucide-react';

/**
 * SubcategorySelector Component
 * 
 * List of subcategory options including "none" option.
 * Memoized to prevent re-renders when other values change.
 * 
 * @param {Array} subcategories - Available subcategories
 * @param {string} selectedSubcategoryId - Selected subcategory ID
 * @param {Function} onSubcategorySelect - Subcategory selection handler
 * @param {Function} onManageCategories - Open category management
 */

interface Subcategory {
  id: string;
  name: string;
  emoji?: string;
}

interface SubcategorySelectorProps {
  subcategories: Subcategory[];
  selectedSubcategoryId: string;
  onSubcategorySelect: (subcategoryId: string) => void;
  onManageCategories: () => void;
}

const SubcategorySelector = memo<SubcategorySelectorProps>(
  ({ subcategories, selectedSubcategoryId, onSubcategorySelect, onManageCategories }) => {
    return (
      <div className="space-y-2">
        {/* None option */}
        <button
          onClick={() => onSubcategorySelect('')}
          className={`w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-all ${
            selectedSubcategoryId === ''
              ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 ring-2 ring-blue-400 dark:ring-blue-600 text-blue-700 dark:text-blue-300 shadow-md'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700'
          }`}
        >
          Sin especificar
        </button>

        {/* Subcategories */}
        {subcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            onClick={() => onSubcategorySelect(subcategory.id)}
            className={`w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-all ${
              selectedSubcategoryId === subcategory.id
                ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 ring-2 ring-blue-400 dark:ring-blue-600 text-blue-700 dark:text-blue-300 shadow-md'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
          >
            {subcategory.emoji && <span className="text-xl">{subcategory.emoji}</span>}
            <span>{subcategory.name}</span>
          </button>
        ))}

        {/* Add New Subcategory Button */}
        <button
          onClick={onManageCategories}
          className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 w-full"
        >
          <Plus className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Nueva Subcategoría
          </span>
        </button>
      </div>
    );
  },
  // Custom comparison: only re-render if subcategories or selection changes
  (prevProps, nextProps) => {
    return (
      prevProps.subcategories.length === nextProps.subcategories.length &&
      prevProps.selectedSubcategoryId === nextProps.selectedSubcategoryId
    );
  }
);

SubcategorySelector.displayName = 'SubcategorySelector';

export default SubcategorySelector;
