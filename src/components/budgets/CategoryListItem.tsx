import { memo } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Category } from '../../types';

/**
 * CategoryListItem Component
 * 
 * Individual category item in the category manager list.
 * Memoized to prevent re-renders when sibling categories update.
 * 
 * @param {Category} category - Category data
 * @param {Function} onEdit - Edit category handler
 * @param {Function} onDelete - Delete category handler
 */

interface CategoryListItemProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

const CategoryListItem = memo<CategoryListItemProps>(
  ({ category, onEdit, onDelete }) => {
    return (
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: category.color + '20' }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: category.color }}
          />
        </div>
        <span className="text-gray-900 dark:text-white flex-1">{category.name}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(category)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
          </button>
        </div>
      </div>
    );
  },
  // Only re-render if category ID changes
  (prevProps, nextProps) => {
    return (
      prevProps.category.id === nextProps.category.id &&
      prevProps.category.name === nextProps.category.name &&
      prevProps.category.color === nextProps.category.color
    );
  }
);

CategoryListItem.displayName = 'CategoryListItem';

export default CategoryListItem;
