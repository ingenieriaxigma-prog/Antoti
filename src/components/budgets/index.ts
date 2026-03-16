/**
 * Barrel export for budgets sub-components
 * Simplifies imports in the main Budgets component
 */

// ❌ ELIMINADOS: Componentes legacy migrados a /features/budgets/components/
// - BudgetsHeader, BudgetSummaryCard, BudgetStatusBadge, BudgetCard, BudgetsList

// ✅ ACTIVOS: Componentes pendientes de migración (usados temporalmente por BudgetsScreen)
export { default as AddBudgetModal } from './AddBudgetModal';
export { default as CategoryListItem } from './CategoryListItem';
export { default as CategoryManagerModal } from './CategoryManagerModal';