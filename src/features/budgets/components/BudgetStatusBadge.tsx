/**
 * BudgetStatusBadge Component
 * 
 * Displays status badge for budget (safe, warning, danger, exceeded)
 */

import { memo } from 'react';
import { AlertTriangle, Target } from 'lucide-react';
import type { BudgetStatusBadgeProps } from '../types';

const BudgetStatusBadge = memo<BudgetStatusBadgeProps>(
  ({ status, remaining, formatCurrency }) => {
    if (status === 'exceeded') {
      return (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs">Excedido por {formatCurrency(Math.abs(remaining))}</span>
        </div>
      );
    }

    if (status === 'danger') {
      return (
        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs">¡Cerca del límite!</span>
        </div>
      );
    }

    if (status === 'warning') {
      return (
        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
          <Target className="w-4 h-4" />
          <span className="text-xs">Atención al gasto</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
        <Target className="w-4 h-4" />
        <span className="text-xs">En buen camino</span>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.status === nextProps.status &&
      prevProps.remaining === nextProps.remaining
    );
  }
);

BudgetStatusBadge.displayName = 'BudgetStatusBadge';

export { BudgetStatusBadge };
