/**
 * CategoryList Component
 * 
 * Displays a list of categories with a header
 */

import { CategoryCard } from './CategoryCard';
import type { CategoryListProps } from '../types';

export function CategoryList({ 
  title, 
  categories, 
  icon: Icon,
  onEdit, 
  onDelete, 
  onSelect 
}: CategoryListProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-gray-900 dark:text-white">{title}</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({categories.length})
        </span>
      </div>
      
      {categories.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            No hay categorías de {title.toLowerCase()}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
