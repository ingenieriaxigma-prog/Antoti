/**
 * Statistics Types
 * 
 * TypeScript type definitions for the statistics feature
 */

/**
 * Main statistics props
 */
export interface StatisticsProps {
  transactions: any[];
  categories: any[];
  budgets: any[];
  onNavigate: (screen: string) => void;
  onSelectBudget: (budgetId: string) => void;
  onSelectCategory: (categoryKey: string, month: number, year: number) => void;
  onGoBack: () => void;
}

/**
 * View type for statistics
 */
export type StatisticsViewType = 'income' | 'expense';

/**
 * Category statistics data
 */
export interface CategoryStatData {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  emoji?: string;
  count: number;
}

/**
 * Monthly trend data point
 */
export interface MonthlyTrendData {
  month: string;
  monthShort: string;
  income: number;
  expense: number;
  net: number;
}

/**
 * Period statistics summary
 */
export interface PeriodSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
  averageTransaction: number;
}

/**
 * Category comparison data
 */
export interface CategoryComparison {
  categoryId: string;
  categoryName: string;
  currentMonth: number;
  previousMonth: number;
  change: number;
  changePercentage: number;
}

/**
 * Spending pattern
 */
export interface SpendingPattern {
  dayOfWeek: string;
  amount: number;
  count: number;
}

/**
 * Budget vs actual data
 */
export interface BudgetVsActual {
  categoryId: string;
  categoryName: string;
  budgeted: number;
  actual: number;
  remaining: number;
  percentage: number;
  status: 'under' | 'near' | 'over';
}
