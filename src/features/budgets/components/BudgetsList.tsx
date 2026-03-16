/**
 * BudgetsList Component
 * 
 * Main scrollable list of budget cards or empty state
 */

import { memo } from 'react';
import { DollarSign } from 'lucide-react';
import { BudgetCard } from './BudgetCard';
import type { BudgetsListProps } from '../types';

const BudgetsList = memo<BudgetsListProps>(
  ({
    budgets,
    budgetsWithStatus,
    formatCurrency,
    onSelect,
    onEdit,
    onDelete,
  }) => {
    // Show empty state if original budgets array is empty
    if (budgets.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No hay presupuestos configurados
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Agrega presupuestos para controlar tus gastos
            </p>
          </div>
        </div>
      );
    }

    // Show no results state if filtered results are empty
    if (budgetsWithStatus.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No se encontraron presupuestos
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Intenta con otro término de búsqueda
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        {budgetsWithStatus.map(({ budget, status, categoryName, categoryColor, categoryEmoji }, index) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            budgetStatus={status}
            categoryName={categoryName}
            categoryColor={categoryColor}
            categoryEmoji={categoryEmoji}
            formatCurrency={formatCurrency}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            index={index}
            isFirstCard={index === 0}
          />
        ))}
      </>
    );
  },
  // Custom comparison: re-render if budgets or budgetsWithStatus length changes
  (prevProps, nextProps) => {
    return (
      prevProps.budgets.length === nextProps.budgets.length &&
      prevProps.budgetsWithStatus.length === nextProps.budgetsWithStatus.length &&
      prevProps.budgets.every(
        (budget, index) =>
          budget.id === nextProps.budgets[index].id &&
          budget.amount === nextProps.budgets[index].amount
      )
    );
  }
);

BudgetsList.displayName = 'BudgetsList';

export { BudgetsList };