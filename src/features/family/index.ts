/**
 * 👥 FAMILY GROUPS - INDEX
 * 
 * Punto de entrada para el feature de finanzas familiares.
 * Exporta todos los tipos, servicios y hooks.
 */

// Types
export * from './types/family.types';

// Services
export * as familyService from './services/family.service';

// Hooks
export { useFamilyGroups } from './hooks/useFamilyGroups';
export { useGroupTransactions } from './hooks/useGroupTransactions';
export { useNotifications } from './hooks/useNotifications';

// Components - Exportar componentes útiles para integración
export { QuickShareButton } from './components/QuickShareButton';
export { JoinWithLinkPage } from './components/JoinWithLinkPage';
