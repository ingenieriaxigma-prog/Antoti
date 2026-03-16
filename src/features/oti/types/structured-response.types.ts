/**
 * 📋 TIPOS PARA RESPUESTAS ESTRUCTURADAS DE OTI
 * 
 * Define las estructuras de datos para respuestas complejas
 * que incluyen diagnósticos, recomendaciones y acciones.
 */

/**
 * Tipo de respuesta de Oti
 */
export type OtiResponseType = 
  | 'simple'           // Respuesta de texto simple
  | 'structured'       // Respuesta estructurada con secciones
  | 'error';           // Error en la respuesta

/**
 * Tipo de sección en una respuesta estructurada
 */
export type SectionType = 
  | 'diagnosis'        // Análisis de la situación actual
  | 'recommendation'   // Recomendaciones y consejos
  | 'action'           // Acciones que el usuario puede tomar
  | 'insight'          // Insights basados en datos
  | 'warning'          // Advertencias importantes
  | 'success';         // Mensaje de éxito

/**
 * Tipo de acción que puede ejecutar el usuario
 */
export type ActionType =
  | 'navigate'         // Navegar a otra pantalla
  | 'create'           // Crear un nuevo elemento
  | 'view'             // Ver detalles de algo
  | 'edit'             // Editar algo existente
  | 'delete'           // Eliminar elemento
  | 'export'           // Exportar datos
  | 'refresh'          // Refrescar datos
  | 'search'           // Buscar algo
  | 'filter'           // Filtrar resultados
  | 'external';        // Abrir enlace externo

/**
 * Pantallas de navegación disponibles
 */
export type NavigationTarget =
  | 'dashboard'
  | 'transactions'
  | 'accounts'
  | 'categories'
  | 'budgets'
  | 'statistics'
  | 'settings'
  | 'advisor'
  | 'bankStatement';

/**
 * Tipos de elementos que se pueden crear
 */
export type CreateTarget =
  | 'transaction'
  | 'account'
  | 'category'
  | 'budget'
  | 'subcategory';

/**
 * Sección individual de una respuesta estructurada
 */
export interface ResponseSection {
  type: SectionType;
  title: string;
  content: string;
  icon?: string;       // Emoji o nombre de icono
  items?: string[];    // Lista de items si aplica
}

/**
 * Acción ejecutable desde el chat
 */
export interface OtiAction {
  id: string;
  type: ActionType;
  label: string;
  description?: string;
  icon?: string;
  // Parámetros específicos por tipo
  target?: string;     // Para navigate: nombre de la pantalla
  url?: string;        // Para external: URL
  params?: Record<string, any>; // Parámetros adicionales
  // 🆕 SPRINT 2: Datos de creación estructurados
  creationData?: TransactionData | BudgetData | AccountData;
  requiresConfirmation?: boolean; // Si requiere confirmación del usuario antes de ejecutar
}

// =============================================
// 🆕 SPRINT 2: DATOS DE CREACIÓN
// =============================================

/**
 * Datos para crear una transacción
 */
export interface TransactionData {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  categoryId?: string;
  categoryName?: string; // Si no existe el ID, se usa el nombre
  accountId?: string;
  accountName?: string;
  date?: string; // ISO format
  notes?: string;
}

/**
 * Datos para crear un presupuesto
 */
export interface BudgetData {
  categoryId?: string;
  categoryName?: string;
  amount: number;
  month: string; // Formato: YYYY-MM
  notes?: string;
}

/**
 * Datos para crear múltiples presupuestos (plan financiero)
 */
export interface FinancialPlanData {
  totalIncome: number;
  budgets: BudgetData[];
  savingsGoal?: number;
  notes?: string;
}

/**
 * Datos para crear una cuenta
 */
export interface AccountData {
  name: string;
  type: 'bank' | 'cash' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency?: string;
  color?: string;
  icon?: string;
  notes?: string;
}

/**
 * Respuesta simple (texto plano)
 */
export interface SimpleResponse {
  type: 'simple';
  content: string;
}

/**
 * Respuesta estructurada con múltiples secciones
 */
export interface StructuredResponse {
  type: 'structured';
  summary: string;     // Resumen corto al inicio
  sections: ResponseSection[];
  actions?: OtiAction[];
  footer?: string;     // Nota final opcional
}

/**
 * Respuesta de error
 */
export interface ErrorResponse {
  type: 'error';
  message: string;
  code?: string;
}

/**
 * Unión de todos los tipos de respuesta
 */
export type OtiResponse = SimpleResponse | StructuredResponse | ErrorResponse;

/**
 * Respuesta del backend de Oti
 */
export interface OtiBackendResponse {
  response: string;         // Texto de respuesta (puede ser JSON)
  isStructured?: boolean;   // Indica si es respuesta estructurada
  parsedResponse?: OtiResponse; // Respuesta parseada si es estructurada
}

/**
 * Helper para verificar si una respuesta es estructurada
 */
export function isStructuredResponse(response: OtiResponse): response is StructuredResponse {
  return response.type === 'structured';
}

/**
 * Helper para verificar si una respuesta es simple
 */
export function isSimpleResponse(response: OtiResponse): response is SimpleResponse {
  return response.type === 'simple';
}

/**
 * Helper para verificar si una respuesta es error
 */
export function isErrorResponse(response: OtiResponse): response is ErrorResponse {
  return response.type === 'error';
}

// =============================================
// QUICK ACTIONS (FASE 5)
// =============================================

/**
 * Categoría de Quick Action
 */
export type QuickActionCategory = 
  | 'finance'      // Acciones financieras
  | 'data'         // Gestión de datos
  | 'view'         // Cambiar vistas
  | 'help';        // Ayuda y soporte

/**
 * Contexto de pantalla donde está Oti
 */
export type OtiScreenContext = 
  | 'home'           // Dashboard principal
  | 'budgets'        // Pantalla de presupuestos
  | 'accounts'       // Pantalla de cuentas
  | 'transactions'   // Pantalla de transacciones
  | 'statistics'     // Pantalla de estadísticas
  | 'advisor'        // Asesor financiero
  | 'settings'       // Configuración
  | 'categories'     // Gestión de categorías
  | 'groups';        // Grupos familiares/compartidos

/**
 * Quick Action - Acceso rápido desde panel
 */
export interface QuickAction {
  id: string;
  category: QuickActionCategory;
  label: string;
  description: string;
  icon: string;        // Emoji
  action: OtiAction;
  shortcut?: string;   // Atajo de teclado (ej: "Ctrl+N")
  contexts?: OtiScreenContext[]; // 🆕 Contextos donde se muestra (si no se especifica, se muestra en todos)
}

/**
 * Atajo de teclado
 */
export interface KeyboardShortcut {
  key: string;         // Tecla principal (ej: "k", "n", "h")
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

/**
 * Quick Actions predefinidas
 */
export const QUICK_ACTIONS: QuickAction[] = [
  // ============================================
  // 🏠 ACCIONES PARA INICIO/HOME
  // ============================================
  {
    id: 'home-create-transaction',
    category: 'finance',
    label: 'Nueva transacción',
    description: 'Registrar ingreso o gasto rápido',
    icon: '💸',
    action: {
      id: 'quick-create-transaction',
      type: 'create',
      label: 'Crear transacción',
      params: { type: 'transaction' }
    },
    contexts: ['home'],
    shortcut: 'Ctrl+N'
  },
  {
    id: 'home-monthly-summary',
    category: 'finance',
    label: 'Resumen del mes',
    description: 'Ver balance y estadísticas',
    icon: '📊',
    action: {
      id: 'quick-monthly-summary',
      type: 'view',
      label: 'Ver resumen mensual',
    },
    contexts: ['home']
  },
  {
    id: 'home-savings-tips',
    category: 'help',
    label: 'Consejos de ahorro',
    description: 'Tips personalizados para ahorrar',
    icon: '💡',
    action: {
      id: 'quick-savings-tips',
      type: 'view',
      label: 'Ver consejos',
    },
    contexts: ['home']
  },
  {
    id: 'home-cash-flow',
    category: 'finance',
    label: 'Analizar flujo de efectivo',
    description: 'Ingresos vs gastos',
    icon: '📈',
    action: {
      id: 'quick-cash-flow',
      type: 'view',
      label: 'Analizar flujo',
    },
    contexts: ['home']
  },
  {
    id: 'home-savings-goal',
    category: 'finance',
    label: 'Crear meta de ahorro',
    description: 'Define objetivo financiero',
    icon: '🎯',
    action: {
      id: 'quick-savings-goal',
      type: 'create',
      label: 'Crear meta',
      params: { type: 'goal' }
    },
    contexts: ['home']
  },

  // ============================================
  // 💰 ACCIONES PARA PRESUPUESTOS
  // ============================================
  {
    id: 'budgets-create-single',
    category: 'finance',
    label: 'Crear presupuesto',
    description: 'Presupuesto individual por categoría',
    icon: '➕',
    action: {
      id: 'quick-create-budget',
      type: 'create',
      label: 'Crear presupuesto',
      params: { type: 'budget' }
    },
    contexts: ['budgets'],
    shortcut: 'Ctrl+N'
  },
  {
    id: 'budgets-financial-plan',
    category: 'finance',
    label: '🌟 Diseñar plan financiero',
    description: 'Plan completo personalizado con IA',
    icon: '🧠',
    action: {
      id: 'quick-financial-plan',
      type: 'create',
      label: 'Diseñar plan completo',
      params: { type: 'financial_plan' }
    },
    contexts: ['budgets'],
    shortcut: 'Ctrl+P'
  },
  {
    id: 'budgets-analyze-progress',
    category: 'finance',
    label: 'Analizar progreso',
    description: 'Ver cómo vas con tus presupuestos',
    icon: '📊',
    action: {
      id: 'quick-budget-progress',
      type: 'view',
      label: 'Ver progreso',
    },
    contexts: ['budgets']
  },
  {
    id: 'budgets-adjust',
    category: 'finance',
    label: 'Ajustar presupuestos',
    description: 'Optimizar distribución',
    icon: '⚙️',
    action: {
      id: 'quick-adjust-budgets',
      type: 'edit',
      label: 'Ajustar',
    },
    contexts: ['budgets']
  },
  {
    id: 'budgets-optimize',
    category: 'finance',
    label: 'Optimizar distribución',
    description: 'Sugerencias de mejora',
    icon: '🎯',
    action: {
      id: 'quick-optimize-budgets',
      type: 'view',
      label: 'Optimizar',
    },
    contexts: ['budgets']
  },

  // ============================================
  // 🏦 ACCIONES PARA CUENTAS
  // ============================================
  {
    id: 'accounts-create',
    category: 'finance',
    label: 'Crear cuenta',
    description: 'Nueva cuenta bancaria o efectivo',
    icon: '➕',
    action: {
      id: 'quick-create-account',
      type: 'create',
      label: 'Crear cuenta',
      params: { type: 'account' }
    },
    contexts: ['accounts'],
    shortcut: 'Ctrl+N'
  },
  {
    id: 'accounts-transfer',
    category: 'finance',
    label: 'Transferir entre cuentas',
    description: 'Mover dinero',
    icon: '🔄',
    action: {
      id: 'quick-transfer',
      type: 'create',
      label: 'Transferir',
      params: { type: 'transfer' }
    },
    contexts: ['accounts'],
    shortcut: 'Ctrl+T'
  },
  {
    id: 'accounts-set-default',
    category: 'finance',
    label: 'Cuenta predeterminada',
    description: 'Configurar cuenta principal',
    icon: '💳',
    action: {
      id: 'quick-set-default',
      type: 'edit',
      label: 'Configurar',
    },
    contexts: ['accounts']
  },
  {
    id: 'accounts-balance',
    category: 'finance',
    label: 'Balance consolidado',
    description: 'Ver total de todas las cuentas',
    icon: '📊',
    action: {
      id: 'quick-total-balance',
      type: 'view',
      label: 'Ver balance',
    },
    contexts: ['accounts']
  },
  {
    id: 'accounts-cashflow',
    category: 'finance',
    label: 'Proyectar flujo de caja',
    description: 'Previsión de ingresos y gastos',
    icon: '📈',
    action: {
      id: 'quick-cashflow-projection',
      type: 'view',
      label: 'Proyectar',
    },
    contexts: ['accounts']
  },

  // ============================================
  // 📝 ACCIONES GENERALES (todas las pantallas)
  // ============================================
  {
    id: 'general-view-transactions',
    category: 'view',
    label: 'Ver transacciones',
    description: 'Historial completo',
    icon: '📝',
    action: {
      id: 'quick-view-transactions',
      type: 'navigate',
      label: 'Ver transacciones',
      target: 'transactions'
    },
    shortcut: 'Ctrl+T'
  },
  {
    id: 'general-view-statistics',
    category: 'view',
    label: 'Estadísticas',
    description: 'Análisis de gastos',
    icon: '📊',
    action: {
      id: 'quick-view-statistics',
      type: 'navigate',
      label: 'Ver estadísticas',
      target: 'statistics'
    },
    shortcut: 'Ctrl+S'
  },
  {
    id: 'general-view-budgets',
    category: 'view',
    label: 'Presupuestos',
    description: 'Gestionar límites',
    icon: '💰',
    action: {
      id: 'quick-view-budgets',
      type: 'navigate',
      label: 'Ver presupuestos',
      target: 'budgets'
    },
    shortcut: 'Ctrl+B'
  },
  {
    id: 'general-view-accounts',
    category: 'view',
    label: 'Cuentas',
    description: 'Gestionar cuentas',
    icon: '🏦',
    action: {
      id: 'quick-view-accounts',
      type: 'navigate',
      label: 'Ver cuentas',
      target: 'accounts'
    },
    shortcut: 'Ctrl+A'
  },
  {
    id: 'general-view-dashboard',
    category: 'view',
    label: 'Dashboard',
    description: 'Vista general',
    icon: '🏠',
    action: {
      id: 'quick-view-dashboard',
      type: 'navigate',
      label: 'Ir al dashboard',
      target: 'dashboard'
    },
    shortcut: 'Ctrl+H'
  },
  {
    id: 'general-export-data',
    category: 'data',
    label: 'Exportar datos',
    description: 'Descargar como CSV',
    icon: '📥',
    action: {
      id: 'quick-export-data',
      type: 'export',
      label: 'Exportar datos',
      params: { format: 'csv' }
    },
    shortcut: 'Ctrl+E'
  },
  {
    id: 'general-refresh-data',
    category: 'data',
    label: 'Refrescar datos',
    description: 'Actualizar información',
    icon: '🔄',
    action: {
      id: 'quick-refresh-data',
      type: 'refresh',
      label: 'Refrescar',
    },
    shortcut: 'Ctrl+R'
  },
  {
    id: 'general-open-advisor',
    category: 'help',
    label: 'Asesor financiero',
    description: 'Consejos personalizados',
    icon: '🤖',
    action: {
      id: 'quick-open-advisor',
      type: 'navigate',
      label: 'Abrir asesor',
      target: 'advisor'
    },
    shortcut: 'Ctrl+I'
  },
  {
    id: 'general-quick-help',
    category: 'help',
    label: 'Ayuda rápida',
    description: 'Comandos de Oti',
    icon: '❓',
    action: {
      id: 'quick-help',
      type: 'view',
      label: 'Ver ayuda',
    },
    shortcut: 'Ctrl+?'
  },
];

/**
 * Helper para obtener Quick Actions según contexto
 */
export function getQuickActionsForContext(context: OtiScreenContext): QuickAction[] {
  return QUICK_ACTIONS.filter(action => {
    // Si no tiene contextos definidos, se muestra en todos
    if (!action.contexts || action.contexts.length === 0) {
      return true;
    }
    // Si tiene contextos, verificar si el actual está incluido
    return action.contexts.includes(context);
  });
}