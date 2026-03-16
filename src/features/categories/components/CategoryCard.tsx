/**
 * CategoryCard Component
 * 
 * Displays individual category with edit/delete/select actions
 */

import { Edit, Trash2, ChevronRight } from 'lucide-react';
import type { CategoryCardProps } from '../types';

export function CategoryCard({
  category,
  onEdit,
  onDelete,
  onManageSubcategories
}: CategoryCardProps) {
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

  const hasSubcategories = (category.subcategories?.length || 0) > 0;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className="relative group flex items-center gap-3 p-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: getPastelBackground(category.color) }}
        >
          {category.emoji ? (
            <span className="text-xl">{category.emoji}</span>
          ) : (
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-gray-900 dark:text-white">{category.name}</span>
            {hasSubcategories && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({category.subcategories?.length})
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {category.type === 'income' ? 'Ingreso' : 'Gasto'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {onManageSubcategories && (
            <button
              onClick={() => onManageSubcategories(category.id)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Gestionar subcategorías"
              aria-label="Manage subcategories"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          )}
          <button
            onClick={() => onEdit(category)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Edit category"
          >
            <Edit className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Delete category"
          >
            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}