/**
 * Global Type Definitions for Xigma Finance App
 * 
 * Centralized type definitions used across the application.
 * This ensures type safety and consistency throughout the codebase.
 */

// ========================================
// DOMAIN TYPES
// ========================================

/**
 * Represents a financial account (cash, bank, card, digital wallet)
 */
export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'card' | 'digital';
  balance: number;
  icon: string;
  color: string;
}

/**
 * Represents a subcategory within a main category
 */
export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  emoji?: string;
}

/**
 * Represents a transaction category (income or expense)
 */
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  emoji?: string;
  subcategories?: Subcategory[];
  isSystem?: boolean; // ✅ Marca categorías del sistema (no editables/borrables)
}

/**
 * Represents a financial transaction
 */
export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category?: string;
  subcategory?: string;
  account: string;
  toAccount?: string;
  date: string;
  note?: string;
  receiptUrl?: string; // ✨ URL del comprobante/recibo adjunto
}

/**
 * Represents a budget for a specific category
 */
export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
  month?: number | null;        // ✨ NEW: 0-11 for monthly budgets (null = applies to all months)
  year?: number | null;         // ✨ NEW: 2024, 2025, etc. (null = applies to all years)
  alertThreshold?: number; // Percentage (e.g., 80 for 80%) - Optional for backward compatibility
}

/**
 * Theme key type for color themes
 */
export type ThemeKey = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal' | 'christmas' | 'rainbow';

// ========================================
// RE-EXPORT API TYPES
// ========================================

export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationParams,
  AuthResponse,
  BulkOperationResult,
  TransactionStatsResponse,
  BudgetStatusResponse,
  AccountSummaryResponse,
  DashboardDataResponse,
  FileUploadResponse,
  HealthCheckResponse,
  ValidationError,
  ValidationErrorResponse,
  RequestOptions,
  ApiClientConfig,
} from './api.types';

// ========================================
// RE-EXPORT FORM TYPES
// ========================================

export type {
  FormField,
  FormState,
  FormHandlers,
  TransactionFormValues,
  BudgetFormValues,
  AccountFormValues,
  CategoryFormValues,
  SubcategoryFormValues,
  LoginFormValues,
  SignupFormValues,
  ResetPasswordFormValues,
  ChangePasswordFormValues,
  FilterFormValues,
  ValidationRule,
  FieldValidationRules,
  FormValidationSchema,
  FormConfig,
  SelectOption,
  MultiStepFormState,
  MultiStepFormHandlers,
} from './form.types';