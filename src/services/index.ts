/**
 * Services Index
 * 
 * Punto central de exportación de todos los servicios
 * 
 * ✅ FASE 2 COMPLETADA: Consolidación de servicios duplicados
 * - AccountService y TransactionService ahora se exportan desde /features/
 * - Se eliminaron las versiones obsoletas en /services/
 * - Se mantiene compatibilidad con imports existentes
 */

// ✅ Re-export from feature modules (Single Source of Truth)
export { AccountService } from '../features/accounts/services';
export { TransactionService } from '../features/transactions/services';
export { BudgetService } from '../features/budgets/services';

// ✅ Servicios que permanecen en /services/
export { ValidationService } from './ValidationService';