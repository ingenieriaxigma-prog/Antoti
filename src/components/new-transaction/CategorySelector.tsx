import { memo } from 'react';
import { Plus } from 'lucide-react';
import { Category } from '../../types';

/**
 * CategorySelector Component
 * 
 * Grid of category cards for selection.
 * Memoized to prevent re-renders when other form values change.
 * 
 * @param {Category[]} categories - Available categories
 * @param {string} selectedCategoryId - Selected category ID
 * @param {Function} onCategorySelect - Category selection handler
 * @param {Function} onManageCategories - Open category management
 */

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategorySelect: (categoryId: string) => void;
  onManageCategories: () => void;
}

const CategorySelector = memo<CategorySelectorProps>(
  ({ categories, selectedCategoryId, onCategorySelect, onManageCategories }) => {
    return (
      <div className="grid grid-cols-3 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`relative overflow-hidden flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
              selectedCategoryId === category.id
                ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-500/30 dark:shadow-blue-500/50 scale-105'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg'
            }`}
          >
            {/* Shimmer effect for selected */}
            {selectedCategoryId === category.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            )}

            <div
              className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform ${
                selectedCategoryId === category.id ? 'scale-110' : ''
              }`}
              style={{
                backgroundColor: selectedCategoryId === category.id
                  ? 'rgba(255, 255, 255, 0.2)'
                  : category.color + '20',
              }}
            >
              {category.emoji ? (
                <span className="text-3xl">{category.emoji}</span>
              ) : (
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              )}
            </div>
            <span
              className={`text-xs text-center relative z-10 ${
                selectedCategoryId === category.id
                  ? 'text-white font-medium'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {category.name}
            </span>
          </button>
        ))}

        {/* Add New Category Button */}
        <button
          onClick={onManageCategories}
          className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:scale-105"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 text-center">Nueva</span>
        </button>
      </div>
    );
  },
  // Custom comparison: only re-render if categories array or selection changes
  (prevProps, nextProps) => {
    return (
      prevProps.categories.length === nextProps.categories.length &&
      prevProps.selectedCategoryId === nextProps.selectedCategoryId
    );
  }
);

CategorySelector.displayName = 'CategorySelector';

export default CategorySelector;