/**
 * Budget Types
 * 
 * TypeScript type definitions for the budgets feature
 */

/**
 * Budget period type
 */
export type BudgetPeriod = 'monthly' | 'yearly';

/**
 * Budget status based on spending
 */
export type BudgetStatus = 'safe' | 'warning' | 'danger' | 'exceeded';

/**
 * Main budget entity
 */
export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  month?: number | null;        // ✨ NEW: 0-11 for monthly budgets (null = applies to all months)
  year?: number | null;         // ✨ NEW: 2024, 2025, etc. (null = applies to all years)
  alertThreshold?: number; // Percentage (e.g., 80 for 80%)
}

/**
 * Form data for creating/updating budgets
 */
export type BudgetFormData = Omit<Budget, 'id'>;

/**
 * Budget status calculation result
 */
export interface BudgetStatusData {
  spent: number;
  percentage: number;
  remaining: number;
  status: BudgetStatus;
}

/**
 * Props for Budget components
 */
export interface BudgetsScreenProps {
  budgets: Budget[];
  categories: any[]; // Category type from categories feature
  transactions: any[]; // Transaction type
  onNavigate: (screen: string) => void;
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onUpdateBudget: (budgetId: string, updates: Partial<Budget>) => void;
  onDeleteBudget: (budgetId: string) => void;
  onAddCategory?: (category: any) => void;
  onUpdateCategory?: (categoryId: string, updates: any) => void;
  onDeleteCategory?: (categoryId: string) => boolean;
  onSelectBudget?: (budgetId: string) => void;
}

export interface BudgetCardProps {
  budget: Budget;
  budgetStatus: BudgetStatusData;
  categoryName: string;
  categoryColor: string;
  categoryEmoji?: string;
  formatCurrency: (amount: number) => string;
  onSelect?: (budgetId: string) => void;
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
  index?: number; // ✅ NUEVO: Para animación stagger
  isFirstCard?: boolean; // 🎓 NUEVO: Para tour - indica si es el primer card
}

export interface BudgetStatusBadgeProps {
  status: BudgetStatus;
  remaining: number;
  formatCurrency: (amount: number) => string;
}

export interface BudgetSummaryCardProps {
  totalBudget: number;
  totalSpent: number;
  overallPercentage: number;
  formatCurrency: (amount: number) => string;
  currentMonth: string;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export interface BudgetsHeaderProps {
  onNavigate: (screen: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTourClick?: () => void; // 🎓 NEW: Tour callback
  showTourBadge?: boolean; // 🎓 NEW: Show "new" badge
}

export interface BudgetsListProps {
  budgets: Budget[];
  budgetsWithStatus: Array<{
    budget: Budget;
    status: BudgetStatusData;
    categoryName: string;
    categoryColor: string;
    categoryEmoji?: string;
  }>;
  formatCurrency: (amount: number) => string;
  onSelect?: (budgetId: string) => void;
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
}

export interface AddBudgetModalProps {
  show: boolean;
  editingBudget: Budget | null;
  categories: any[];
  selectedCategory: string;
  budgetAmount: string;
  alertThreshold: string;
  onCategoryChange: (categoryId: string) => void;
  onAmountChange: (amount: string) => void;
  onThresholdChange: (threshold: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
}