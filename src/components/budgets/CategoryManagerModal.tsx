import { memo, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Category } from '../../types';
import CategoryListItem from './CategoryListItem';

/**
 * CategoryManagerModal Component
 * 
 * Modal for managing expense categories (add, edit, delete).
 * Now manages its own internal state for easier usage.
 * Memoized to prevent re-renders when parent updates.
 */

interface CategoryManagerModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onAddCategory: (category: { name: string; type: 'income' | 'expense'; color: string }) => void;
  onUpdateCategory: (categoryId: string, updates: { name?: string; color?: string }) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const colorOptions = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

const CategoryManagerModal = memo<CategoryManagerModalProps>(
  ({
    isOpen,
    categories,
    onClose,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
  }) => {
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [categoryColor, setCategoryColor] = useState(colorOptions[0]);

    // Filter only expense categories
    const expenseCategories = categories.filter(c => c.type === 'expense');

    // Handle edit category
    const handleEditCategory = useCallback((category: Category) => {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryColor(category.color);
    }, []);

    // Handle cancel edit
    const handleCancelEdit = useCallback(() => {
      setEditingCategory(null);
      setCategoryName('');
      setCategoryColor(colorOptions[0]);
    }, []);

    // Handle submit (add or update)
    const handleSubmit = useCallback(() => {
      if (!categoryName.trim()) return;

      if (editingCategory) {
        // Update existing category
        onUpdateCategory(editingCategory.id, {
          name: categoryName.trim(),
          color: categoryColor,
        });
      } else {
        // Add new category
        onAddCategory({
          name: categoryName.trim(),
          type: 'expense',
          color: categoryColor,
        });
      }

      // Reset form
      setEditingCategory(null);
      setCategoryName('');
      setCategoryColor(colorOptions[0]);
    }, [categoryName, categoryColor, editingCategory, onAddCategory, onUpdateCategory]);

    // Handle close
    const handleClose = useCallback(() => {
      setEditingCategory(null);
      setCategoryName('');
      setCategoryColor(colorOptions[0]);
      onClose();
    }, [onClose]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center sm:justify-center">
        <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md sm:rounded-t-2xl rounded-t-2xl animate-slide-up max-h-[85vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 dark:text-white">
                {editingCategory ? 'Editar Categoría' : 'Gestionar Categorías'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-45" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Add/Edit Category Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  {editingCategory ? 'Nombre de la Categoría' : 'Nueva Categoría de Gasto'}
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ej: Vivienda, Ropa, etc."
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCategoryColor(color)}
                      className={`w-10 h-10 rounded-full transition-all ${
                        categoryColor === color
                          ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!categoryName.trim()}
                className="w-full py-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingCategory ? 'Actualizar Categoría' : 'Crear Categoría'}
              </button>
            </div>

            {/* Existing Categories List */}
            {!editingCategory && expenseCategories.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-gray-700 dark:text-gray-300 mb-3">
                  Categorías de Gasto
                </h3>
                <div className="space-y-2">
                  {expenseCategories.map((category) => (
                    <CategoryListItem
                      key={category.id}
                      category={category}
                      onEdit={handleEditCategory}
                      onDelete={onDeleteCategory}
                    />
                  ))}
                </div>
              </div>
            )}

            {editingCategory && (
              <button
                onClick={handleCancelEdit}
                className="w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

CategoryManagerModal.displayName = 'CategoryManagerModal';

export default CategoryManagerModal;
