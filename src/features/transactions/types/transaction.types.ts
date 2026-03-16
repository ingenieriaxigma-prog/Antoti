/**
 * Transaction Types
 * 
 * TypeScript type definitions for the transactions feature
 */

/**
 * Transaction type
 */
export type TransactionType = 'income' | 'expense' | 'transfer';

/**
 * Active field in transaction editor
 */
export type ActiveField =
  | 'amount'
  | 'category'
  | 'subcategory'
  | 'account'
  | 'toAccount'
  | 'date'
  | 'note'
  | null;

/**
 * Main transaction entity
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category?: string;
  subcategory?: string;
  account: string;
  toAccount?: string;
  date: string;
  note?: string;
  receiptUrl?: string; // ✨ URL del comprobante/recibo procesado por IA
}

/**
 * Form data for creating/updating transactions
 */
export type TransactionFormData = Omit<Transaction, 'id'>;

/**
 * Transaction with enriched data (for display)
 */
export interface EnrichedTransaction extends Transaction {
  categoryName?: string;
  categoryColor?: string;
  categoryEmoji?: string;
  accountName?: string;
  toAccountName?: string;
}

/**
 * Transaction grouped by date
 */
export interface TransactionGroup {
  date: string;
  dateDisplay: string;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
}

/**
 * Month summary data
 */
export interface MonthSummary {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
}

/**
 * Filter options for transactions
 */
export interface TransactionFilters {
  type: 'all' | TransactionType;
  searchQuery: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  accountId?: string;
}

/**
 * Props for Transaction components
 */
export interface TransactionsScreenProps {
  transactions: Transaction[];
  accounts: any[];
  categories: any[];
  onDeleteTransaction: (transactionId: string) => void;
  onEditTransaction: (transactionId: string) => void;
  onNavigate: (screen: string) => void;
}

export interface NewTransactionScreenProps {
  accounts: any[];
  categories: any[];
  transactions: Transaction[];
  editingTransactionId: string | null;
  onAddTransaction: (transaction: TransactionFormData) => void;
  onUpdateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
  onNavigate: (screen: string) => void;
  onGoBack?: () => void;
  onClearEditing: () => void;
  onAddCategory?: (category: any) => void;
  onUpdateCategory?: (categoryId: string, updates: any) => void;
  onDeleteCategory?: (categoryId: string) => boolean;
}

export interface TransactionItemProps {
  transaction: Transaction;
  categoryName: string;
  categoryColor: string;
  categoryEmoji?: string;
  accountName: string;
  toAccountName?: string;
  formatCurrency: (amount: number) => string;
  onEdit: (transactionId: string) => void;
  onDelete: (transactionId: string) => void;
}

export interface DayGroupProps {
  date: string;
  transactions: Transaction[];
  categories: any[];
  accounts: any[];
  formatCurrency: (amount: number) => string;
  getCategoryName: (categoryId?: string, subcategoryId?: string) => string;
  getCategoryColor: (categoryId?: string) => string;
  getCategoryEmoji: (categoryId?: string, type?: TransactionType) => string;
  getAccountName: (accountId: string) => string;
  onEditTransaction: (transactionId: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

export interface MonthSummaryProps {
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
}

export interface FilterTabsProps {
  filterType: 'all' | TransactionType;
  onFilterChange: (filterType: 'all' | TransactionType) => void;
  transactionCounts: {
    all: number;
    income: number;
    expense: number;
    transfer: number;
  };
}
