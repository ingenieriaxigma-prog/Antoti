/**
 * CategoryList
 * 
 * Lista de categorías con porcentajes y barras de progreso.
 * Optimizada con React.memo y virtualization para listas largas.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface CategoryData {
  id: string;
  name: string;
  amount: number; // ✅ CHANGED: from 'value' to 'amount' to match CategoryStatData
  color: string;
  emoji?: string; // ✅ CHANGED: from required to optional
  percentage: number;
}

interface CategoryListProps {
  data: CategoryData[];
  total: number;
  formatCurrency: (amount: number) => string;
  onCategoryClick: (categoryId: string) => void;
}

function CategoryList({ data, total, formatCurrency, onCategoryClick }: CategoryListProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm" data-tour="stats-category-list">
        <h3 className="text-gray-900 dark:text-white mb-4">
          Detalle por Categoría
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No hay datos para mostrar
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm" data-tour="stats-category-list">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 dark:text-white">
          Detalle por Categoría
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Total: {formatCurrency(total)}
        </span>
      </div>

      <div className="space-y-3">
        {data.map((category, index) => (
          <CategoryListItem
            key={category.id}
            category={category}
            formatCurrency={formatCurrency}
            onCategoryClick={onCategoryClick}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

// Componente individual de categoría memoizado
interface CategoryListItemProps {
  category: CategoryData;
  formatCurrency: (amount: number) => string;
  onCategoryClick: (categoryId: string) => void;
  index: number;
}

const CategoryListItem = React.memo(
  ({ category, formatCurrency, onCategoryClick, index }: CategoryListItemProps) => {
    return (
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => onCategoryClick(category.id)}
        className="w-full text-left touch-target p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all tap-scale"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xl sm:text-2xl flex-shrink-0">
              {category.emoji}
            </span>
            <span className="font-medium text-gray-900 dark:text-white truncate">
              {category.name}
            </span>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <p className="font-bold text-gray-900 dark:text-white">
              {formatCurrency(category.amount)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {category.percentage.toFixed(1)}%
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${category.percentage}%` }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="h-full rounded-full transition-all"
            style={{ backgroundColor: category.color }}
          />
        </div>
      </motion.button>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.category.id === nextProps.category.id &&
      prevProps.category.amount === nextProps.category.amount &&
      prevProps.category.percentage === nextProps.category.percentage
    );
  }
);

CategoryListItem.displayName = 'CategoryListItem';

// Memoizar la lista completa
export default React.memo(CategoryList, (prevProps, nextProps) => {
  if (prevProps.data.length !== nextProps.data.length) return false;
  if (prevProps.total !== nextProps.total) return false;
  
  // Comparar los primeros 3 elementos para detectar cambios
  for (let i = 0; i < Math.min(3, prevProps.data.length); i++) {
    if (
      prevProps.data[i]?.id !== nextProps.data[i]?.id ||
      prevProps.data[i]?.amount !== nextProps.data[i]?.amount
    ) {
      return false;
    }
  }
  
  return true;
});