/**
 * API Response Types
 * 
 * Type definitions for API responses and requests.
 * These ensure type safety when communicating with the backend.
 */

/**
 * Standard API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

/**
 * API Error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string; // Only in development
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: ApiError;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Authentication response
 */
export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
  };
  accessToken?: string;
  refreshToken?: string;
  error?: ApiError;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult<T = any> {
  success: boolean;
  created?: T[];
  updated?: T[];
  deleted?: string[];
  failed?: {
    item: T;
    error: string;
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * Transaction statistics response
 */
export interface TransactionStatsResponse {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
    count: number;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }[];
}

/**
 * Budget status response
 */
export interface BudgetStatusResponse {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
  alertThreshold: number;
  isOverBudget: boolean;
}

/**
 * Account summary response
 */
export interface AccountSummaryResponse {
  totalBalance: number;
  accounts: {
    id: string;
    name: string;
    type: string;
    balance: number;
    percentage: number;
  }[];
}

/**
 * Dashboard data response
 */
export interface DashboardDataResponse {
  accounts: AccountSummaryResponse;
  recentTransactions: any[]; // Transaction type from /types/index.ts
  budgetStatus: BudgetStatusResponse[];
  monthlyStats: {
    income: number;
    expenses: number;
    balance: number;
    savingsRate: number;
  };
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  success: boolean;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  error?: ApiError;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: 'up' | 'down';
    auth: 'up' | 'down';
    storage: 'up' | 'down';
  };
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse extends ApiError {
  code: 'VALIDATION_ERROR';
  details: {
    errors: ValidationError[];
  };
}

/**
 * Request options
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

/**
 * API Client configuration
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  onError?: (error: ApiError) => void;
  onSuccess?: (response: any) => void;
}
