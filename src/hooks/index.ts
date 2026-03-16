/**
 * Hooks Index
 * 
 * Punto central de exportación de todos los custom hooks
 */

export { useDataLoader } from './useDataLoader';
export { useTransactions } from './useTransactions';
export { useAccounts } from './useAccounts';
export { useCategories } from './useCategories';
export { useBudgets } from './useBudgets';
export { useResetData } from './useResetData';
// ❌ ELIMINADO: useCleanup ya no es necesario (era solo para migración inicial)
export { useInitialLoading, useLoadingState } from './useInitialLoading';
export { useUnifiedNotifications } from './useUnifiedNotifications';
export { useNotificationPreferences } from './useNotificationPreferences';