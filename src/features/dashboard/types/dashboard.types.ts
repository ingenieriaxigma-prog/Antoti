/**
 * Dashboard Types
 * 
 * TypeScript type definitions for the dashboard feature
 */

/**
 * Main dashboard props
 */
export interface DashboardProps {
  transactions: any[];
  accounts: any[];
  categories: any[];
  budgets: any[];
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onNavigate: (screen: string) => void;
  onSelectBudget: (budgetId: string) => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (id: string) => void;
  onAddTransaction?: (transaction: any) => void;
  theme?: string;
  currentScreen?: string;
  isLoadingTransactions?: boolean;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netBalance: number;
  savingsRate: number;
}

/**
 * Account summary for dashboard
 */
export interface AccountSummary {
  id: string;
  name: string;
  type: string;
  balance: number;
  icon: string;
  color?: string;
}

/**
 * Budget alert
 */
export interface BudgetAlert {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spent: number;
  percentage: number;
  status: 'warning' | 'danger' | 'exceeded';
}

/**
 * Recent transaction item
 */
export interface RecentTransaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category?: string;
  categoryName?: string;
  categoryColor?: string;
  categoryEmoji?: string;
  accountName: string;
  date: string;
  note?: string;
}

/**
 * Month summary
 */
export interface MonthSummary {
  month: number;
  year: number;
  income: number;
  expenses: number;
  netBalance: number;
  transactionCount: number;
}

/**
 * Dashboard filter state
 */
export interface DashboardFilters {
  type: 'all' | 'income' | 'expense' | 'transfer';
  searchQuery: string;
  selectedMonth: number;
  selectedYear: number;
}