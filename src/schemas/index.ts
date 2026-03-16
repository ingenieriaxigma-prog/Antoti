/**
 * Schemas Index
 * 
 * Centralized exports for all Zod validation schemas.
 * Import schemas from here for consistent validation across the app.
 * 
 * 🧪 TESTING:
 * - Test cases are defined in /schemas/test-cases.ts
 * - Access testing page via Settings → Admin Panel → Testing de Schemas
 */

// Transaction schemas
export {
  TransactionTypeSchema,
  TransactionCreateSchema,
  TransactionSchema,
  TransactionUpdateSchema,
  BulkTransactionCreateSchema,
  TransactionFilterSchema,
  type TransactionType,
  type TransactionCreate,
  type TransactionData,
  type TransactionUpdate,
  type BulkTransactionCreate,
  type TransactionFilter,
} from './transaction.schema';

// Budget schemas
export {
  BudgetPeriodSchema,
  BudgetCreateSchema,
  BudgetSchema,
  BudgetUpdateSchema,
  BulkBudgetCreateSchema,
  BudgetFilterSchema,
  BudgetStatusInputSchema,
  type BudgetPeriod,
  type BudgetCreate,
  type BudgetData,
  type BudgetUpdate,
  type BulkBudgetCreate,
  type BudgetFilter,
  type BudgetStatusInput,
} from './budget.schema';

// Account schemas
export {
  AccountTypeSchema,
  AccountCreateSchema,
  AccountSchema,
  AccountUpdateSchema,
  BulkAccountCreateSchema,
  AccountBalanceUpdateSchema,
  AccountFilterSchema,
  type AccountType,
  type AccountCreate,
  type AccountData,
  type AccountUpdate,
  type BulkAccountCreate,
  type AccountBalanceUpdate,
  type AccountFilter,
} from './account.schema';

// Category schemas
export {
  CategoryTypeSchema,
  SubcategoryCreateSchema,
  SubcategorySchema,
  SubcategoryUpdateSchema,
  CategoryCreateSchema,
  CategorySchema,
  CategoryUpdateSchema,
  BulkCategoryCreateSchema,
  CategoryFilterSchema,
  AddSubcategorySchema,
  RemoveSubcategorySchema,
  type CategoryType,
  type SubcategoryCreate,
  type SubcategoryData,
  type SubcategoryUpdate,
  type CategoryCreate,
  type CategoryData,
  type CategoryUpdate,
  type BulkCategoryCreate,
  type CategoryFilter,
  type AddSubcategory,
  type RemoveSubcategory,
} from './category.schema';

// 🧪 Test cases (for development and testing)
export { TEST_CASES, getTestCasesByCategory, getAllCategories, getTestCasesCount, getTestCaseStats } from './test-cases';