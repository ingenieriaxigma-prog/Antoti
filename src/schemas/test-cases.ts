/**
 * Test Cases Centralizados
 * 
 * ⚡ MANTENIMIENTO FÁCIL:
 * - Agrega schemas nuevos aquí
 * - La UI se actualiza automáticamente
 * - Un solo lugar para casos de prueba
 * 
 * 📝 FORMATO:
 * [nombre]: {
 *   schema: SchemaZod,
 *   category: 'transactions' | 'budgets' | 'accounts' | 'categories' | 'filters' | 'ui' | 'navigation' | 'auth' | 'sync' | 'otros',
 *   description: 'Descripción del caso',
 *   validData: { ... },
 *   invalidData: { ... },
 * }
 * 
 * 📊 COBERTURA ACTUAL (36 test cases):
 * - Transacciones: 3 tests
 * - Presupuestos: 4 tests (+2 nuevos: BudgetConfig) 🆕
 * - Cuentas: 3 tests
 * - Categorías: 3 tests
 * - Filtros: 3 tests
 * - UI/Features: 11 tests (+9 nuevos: SpeedDial Actions, Oti Chat, TransactionForm) 🆕
 * - Navigation: 5 tests (+4 nuevos: NavigationState) 🆕
 * - Auth: 1 test
 * - Sync: 1 test
 * 
 * 🆕 SEMANA 1 - FASE 1A: +5 tests para features avanzadas
 * 🆕 SEMANA 1 - FASE 2: +17 tests para componentes (SpeedDial, Navigation, Chat, Forms)
 * 
 * ✅ TOTAL: 36 test cases (+22 desde inicio de Semana 1)
 */

import { z } from 'zod';
import {
  TransactionCreateSchema,
  BudgetCreateSchema,
  AccountCreateSchema,
  CategoryCreateSchema,
  TransactionFilterSchema,
} from './index';

// ============================================
// 🧪 SCHEMAS PARA TESTING DE UI/FEATURES
// ============================================

// Schema para validar configuración de SpeedDial
const SpeedDialContextSchema = z.object({
  context: z.enum(['dashboard', 'transactions', 'budgets', 'accounts', 'statistics', 'settings']),
  enabledActions: z.array(z.enum(['chat', 'voice', 'image', 'manual'])),
  primaryAction: z.enum(['chat', 'voice', 'image', 'manual']).optional(),
});

// Schema para validar navegación
const NavigationSchema = z.object({
  fromScreen: z.string().min(1),
  toScreen: z.string().min(1),
  transition: z.enum(['push', 'replace', 'back']).optional(),
  params: z.record(z.string(), z.unknown()).optional(),
});

// Schema para validar temas
const ThemeConfigSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// Schema para validar auth
const AuthCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Schema para validar sync status
const SyncStatusSchema = z.object({
  status: z.enum(['idle', 'syncing', 'success', 'error']),
  lastSync: z.string().datetime().optional(),
  pendingChanges: z.number().min(0),
});

// Schema para validar props de TransactionForm
const TransactionFormPropsSchema = z.object({
  mode: z.enum(['create', 'edit']),
  initialData: z.object({
    type: z.enum(['income', 'expense', 'transfer']),
    amount: z.number().positive(),
    category: z.string().uuid(),
    account: z.string().uuid(),
    date: z.string().datetime(),
  }).optional(),
});

// Schema para validar estados de navegación
const NavigationStateSchema = z.object({
  currentScreen: z.enum(['dashboard', 'transactions', 'budgets', 'accounts', 'statistics', 'settings']),
  previousScreen: z.enum(['dashboard', 'transactions', 'budgets', 'accounts', 'statistics', 'settings']).optional(),
  canGoBack: z.boolean(),
  params: z.record(z.string(), z.unknown()).optional(),
});

// Schema para validar acciones del SpeedDial por contexto
const SpeedDialActionSchema = z.object({
  id: z.enum(['chat', 'voice', 'image', 'manual']),
  label: z.string().min(1),
  icon: z.string().min(1),
  enabled: z.boolean(),
  primary: z.boolean().optional(),
});

// Schema para validar respuesta del chat Oti
const OtiChatResponseSchema = z.object({
  message: z.string().min(1),
  type: z.enum(['text', 'suggestion', 'error']),
  suggestions: z.array(z.string()).optional(),
  timestamp: z.string().datetime(),
});

// Schema para validar configuración de presupuesto
const BudgetConfigSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().positive(),
  period: z.enum(['monthly', 'yearly']),
  alertEnabled: z.boolean(),
  alertThreshold: z.number().min(1).max(100).optional(),
  startDate: z.string().datetime().optional(),
});

// ============================================
// 📌 TIPO DE CONFIGURACIÓN
// ============================================

export interface TestCase {
  schema: z.ZodTypeAny;
  category: 'transactions' | 'budgets' | 'accounts' | 'categories' | 'filters' | 'ui' | 'navigation' | 'auth' | 'sync' | 'otros';
  description: string;
  validData: any;
  invalidData: any;
  validDescription?: string;
  invalidDescription?: string;
}

export interface TestCaseCollection {
  [key: string]: TestCase;
}

// ============================================
// 🧪 CASOS DE PRUEBA
// ============================================

export const TEST_CASES: TestCaseCollection = {
  // ==========================================
  // 💰 TRANSACCIONES
  // ==========================================
  
  'TransactionCreate - Ingreso': {
    schema: TransactionCreateSchema,
    category: 'transactions',
    description: 'Creación de transacción de ingreso',
    validDescription: 'Ingreso válido con todos los campos requeridos',
    invalidDescription: 'Ingreso con monto negativo, UUID inválido, fecha malformada, y categoría faltante',
    validData: {
      type: 'income',
      amount: 5000,
      category: '550e8400-e29b-41d4-a716-446655440000',
      account: '550e8400-e29b-41d4-a716-446655440001',
      date: new Date().toISOString(),
      note: 'Salario mensual',
    },
    invalidData: {
      type: 'income',
      amount: -5000, // ❌ Monto negativo
      // category: missing ❌
      account: 'invalid-uuid', // ❌ UUID inválido
      date: 'not-a-date', // ❌ Fecha inválida
    },
  },

  'TransactionCreate - Gasto': {
    schema: TransactionCreateSchema,
    category: 'transactions',
    description: 'Creación de transacción de gasto',
    validDescription: 'Gasto válido con categoría y subcategoría',
    invalidDescription: 'Gasto con monto cero y sin categoría requerida',
    validData: {
      type: 'expense',
      amount: 1500,
      category: '550e8400-e29b-41d4-a716-446655440002',
      subcategory: '550e8400-e29b-41d4-a716-446655440003',
      account: '550e8400-e29b-41d4-a716-446655440001',
      date: new Date().toISOString(),
      note: 'Compras del supermercado',
    },
    invalidData: {
      type: 'expense',
      amount: 0, // ❌ Monto debe ser > 0
      // category: missing ❌ Requerido para gastos
      account: '550e8400-e29b-41d4-a716-446655440001',
      date: new Date().toISOString(),
    },
  },

  'TransactionCreate - Transferencia': {
    schema: TransactionCreateSchema,
    category: 'transactions',
    description: 'Creación de transferencia entre cuentas',
    validDescription: 'Transferencia válida entre dos cuentas diferentes',
    invalidDescription: 'Transferencia con UUID de cuenta destino inválido',
    validData: {
      type: 'transfer',
      amount: 2000,
      account: '550e8400-e29b-41d4-a716-446655440001',
      toAccount: '550e8400-e29b-41d4-a716-446655440004',
      date: new Date().toISOString(),
      note: 'Transferencia entre cuentas',
    },
    invalidData: {
      type: 'transfer',
      amount: 2000,
      account: '550e8400-e29b-41d4-a716-446655440001',
      toAccount: 'invalid-uuid-format', // ❌ UUID inválido
      date: new Date().toISOString(),
    },
  },

  // ==========================================
  // 📊 PRESUPUESTOS
  // ==========================================

  'BudgetCreate - Mensual': {
    schema: BudgetCreateSchema,
    category: 'budgets',
    description: 'Creación de presupuesto mensual',
    validDescription: 'Presupuesto mensual con threshold de alerta al 80%',
    invalidDescription: 'Presupuesto con UUID inválido, monto negativo, periodo incorrecto, y threshold fuera de rango',
    validData: {
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      amount: 15000,
      period: 'monthly',
      alertThreshold: 80,
    },
    invalidData: {
      categoryId: 'not-a-uuid', // ❌ UUID inválido
      amount: -1000, // ❌ Monto negativo
      period: 'weekly', // ❌ Periodo inválido
      alertThreshold: 150, // ❌ Threshold > 100
    },
  },

  'BudgetCreate - Anual': {
    schema: BudgetCreateSchema,
    category: 'budgets',
    description: 'Creación de presupuesto anual',
    validDescription: 'Presupuesto anual con threshold de alerta al 90%',
    invalidDescription: 'Presupuesto con monto excesivo y threshold inválido',
    validData: {
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      amount: 180000,
      period: 'yearly',
      alertThreshold: 90,
    },
    invalidData: {
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      amount: 1000000000000000, // ❌ Monto demasiado grande
      period: 'yearly',
      alertThreshold: 0, // ❌ Threshold < 1
    },
  },

  'BudgetConfig - Mensual con Alerta': {
    schema: BudgetConfigSchema,
    category: 'budgets',
    description: 'Configuración de presupuesto mensual con alerta',
    validDescription: 'Presupuesto mensual con alerta al 85%',
    invalidDescription: 'Threshold fuera de rango y periodo inválido',
    validData: {
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      amount: 20000,
      period: 'monthly',
      alertEnabled: true,
      alertThreshold: 85,
      startDate: new Date('2025-11-01T00:00:00.000Z').toISOString(),
    },
    invalidData: {
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      amount: 20000,
      period: 'quarterly', // ❌ Periodo inválido
      alertEnabled: true,
      alertThreshold: 150, // ❌ Threshold > 100
    },
  },

  'BudgetConfig - Anual sin Alerta': {
    schema: BudgetConfigSchema,
    category: 'budgets',
    description: 'Configuración de presupuesto anual sin alerta',
    validDescription: 'Presupuesto anual sin alertas habilitadas',
    invalidDescription: 'Monto negativo (no permitido)',
    validData: {
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      amount: 240000,
      period: 'yearly',
      alertEnabled: false,
    },
    invalidData: {
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      amount: -5000, // ❌ Monto negativo
      period: 'yearly',
      alertEnabled: false,
    },
  },

  // ==========================================
  // 💳 CUENTAS
  // ==========================================

  'AccountCreate - Cuenta Bancaria': {
    schema: AccountCreateSchema,
    category: 'accounts',
    description: 'Creación de cuenta bancaria',
    validDescription: 'Cuenta bancaria con balance inicial',
    invalidDescription: 'Cuenta con nombre vacío, tipo inválido, balance infinito, y color no hexadecimal',
    validData: {
      name: 'Cuenta de Ahorros',
      type: 'bank',
      balance: 50000,
      icon: 'Building2',
      color: '#10b981',
    },
    invalidData: {
      name: '', // ❌ Nombre vacío
      type: 'crypto', // ❌ Tipo inválido
      balance: Infinity, // ❌ Balance no finito
      icon: '',
      color: 'green', // ❌ Color no hex
    },
  },

  'AccountCreate - Efectivo': {
    schema: AccountCreateSchema,
    category: 'accounts',
    description: 'Creación de cuenta de efectivo',
    validDescription: 'Billetera de efectivo',
    invalidDescription: 'Cuenta con nombre excesivamente largo (>50 caracteres)',
    validData: {
      name: 'Billetera',
      type: 'cash',
      balance: 5000,
      icon: 'Wallet',
      color: '#10b981',
    },
    invalidData: {
      name: 'A'.repeat(60), // ❌ Nombre muy largo (>50)
      type: 'cash',
      balance: 5000,
      icon: 'Wallet',
      color: '#10b981',
    },
  },

  'AccountCreate - Tarjeta de Crédito': {
    schema: AccountCreateSchema,
    category: 'accounts',
    description: 'Creación de tarjeta de crédito',
    validDescription: 'Tarjeta de crédito con balance negativo (deuda)',
    invalidDescription: 'Tarjeta con tipo de cuenta incorrecto',
    validData: {
      name: 'Visa Platinum',
      type: 'card', // ✅ Corregido: 'credit' → 'card'
      balance: -15000, // Balance negativo = deuda
      icon: 'CreditCard',
      color: '#ef4444',
    },
    invalidData: {
      name: 'Visa Platinum',
      type: 'investment', // ❌ Tipo no permitido
      balance: -15000,
      icon: 'CreditCard',
      color: '#ef4444',
    },
  },

  // ==========================================
  // 🏷️ CATEGORÍAS
  // ==========================================

  'CategoryCreate - Ingreso': {
    schema: CategoryCreateSchema,
    category: 'categories',
    description: 'Creación de categoría de ingreso',
    validDescription: 'Categoría de ingreso simple',
    invalidDescription: 'Categoría con nombre vacío, tipo inválido, color malformado, y emoji muy largo',
    validData: {
      name: 'Salario',
      type: 'income',
      icon: 'DollarSign',
      color: '#10b981',
      emoji: '💰',
    },
    invalidData: {
      name: '', // ❌ Nombre vacío
      type: 'both', // ❌ Tipo inválido
      icon: '',
      color: '#GGG', // ❌ Hex inválido
      emoji: '💰'.repeat(10), // ❌ Emoji muy largo
    },
  },

  'CategoryCreate - Gasto con Subcategorías': {
    schema: CategoryCreateSchema,
    category: 'categories',
    description: 'Creación de categoría de gasto con subcategorías',
    validDescription: 'Categoría de alimentación con subcategorías de restaurantes y supermercado',
    invalidDescription: 'Categoría con subcategorías inválidas (nombre vacío y UUID malformado)',
    validData: {
      name: 'Alimentación',
      type: 'expense',
      icon: 'Utensils',
      color: '#ef4444',
      emoji: '🍽️',
      subcategories: [
        {
          name: 'Restaurantes',
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          emoji: '🍴',
        },
        {
          name: 'Supermercado',
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          emoji: '🛒',
        },
      ],
    },
    invalidData: {
      name: 'Alimentación',
      type: 'expense',
      icon: 'Utensils',
      color: '#ef4444',
      subcategories: [
        {
          name: '', // ❌ Nombre vacío
          categoryId: 'not-uuid', // ❌ UUID inválido
        },
      ],
    },
  },

  'CategoryCreate - Transporte': {
    schema: CategoryCreateSchema,
    category: 'categories',
    description: 'Creación de categoría de transporte',
    validDescription: 'Categoría de gastos de transporte',
    invalidDescription: 'Categoría con icono no permitido',
    validData: {
      name: 'Transporte',
      type: 'expense',
      icon: 'Car',
      color: '#3b82f6',
      emoji: '🚗',
    },
    invalidData: {
      name: 'Transporte',
      type: 'expense',
      icon: '<script>alert("xss")</script>', // ❌ Intento de XSS
      color: '#3b82f6',
      emoji: '🚗',
    },
  },

  // ==========================================
  // 🔍 FILTROS
  // ==========================================

  'TransactionFilter - Filtro Básico': {
    schema: TransactionFilterSchema,
    category: 'filters',
    description: 'Filtro básico de transacciones',
    validDescription: 'Filtro de gastos por cuenta y rango de fechas',
    invalidDescription: 'Filtro con tipo inválido, UUID malformado, y rango de fechas invertido',
    validData: {
      type: 'expense',
      accountId: '550e8400-e29b-41d4-a716-446655440000',
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-12-31T23:59:59.999Z',
    },
    invalidData: {
      type: 'invalid', // ❌ Tipo invlido
      accountId: 'not-uuid', // ❌ UUID inválido
      startDate: '2025-12-31T00:00:00.000Z',
      endDate: '2025-01-01T00:00:00.000Z', // ❌ endDate < startDate
    },
  },

  'TransactionFilter - Rango de Montos': {
    schema: TransactionFilterSchema,
    category: 'filters',
    description: 'Filtro por rango de montos',
    validDescription: 'Filtro de transacciones entre $1,000 y $5,000',
    invalidDescription: 'Filtro con rango invertido y término de búsqueda muy largo',
    validData: {
      minAmount: 1000,
      maxAmount: 5000,
      searchTerm: 'supermercado',
    },
    invalidData: {
      minAmount: 5000,
      maxAmount: 1000, // ❌ maxAmount < minAmount
      searchTerm: 'a'.repeat(150), // ❌ searchTerm muy largo
    },
  },

  'TransactionFilter - Por Categoría': {
    schema: TransactionFilterSchema,
    category: 'filters',
    description: 'Filtro por categoría específica',
    validDescription: 'Filtro de transacciones de una categoría',
    invalidDescription: 'Filtro con categoryId malformado',
    validData: {
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'expense',
    },
    invalidData: {
      categoryId: '123-not-uuid', // ❌ UUID inválido
      type: 'expense',
    },
  },

  // ==========================================
  // 🛠️ UI/FEATURES
  // ==========================================

  'SpeedDialContext - Configuración Válida': {
    schema: SpeedDialContextSchema,
    category: 'ui',
    description: 'Configuración válida de SpeedDial',
    validDescription: 'Contexto de dashboard con acciones habilitadas y acción primaria',
    invalidDescription: 'Contexto inválido y acciones no permitidas',
    validData: {
      context: 'dashboard',
      enabledActions: ['chat', 'voice', 'image', 'manual'],
      primaryAction: 'chat',
    },
    invalidData: {
      context: 'invalid-context', // ❌ Contexto inválido
      enabledActions: ['invalid-action'], // ❌ Acción no permitida
      primaryAction: 'chat',
    },
  },

  'Navigation - Transición Válida': {
    schema: NavigationSchema,
    category: 'navigation',
    description: 'Transición válida de navegación',
    validDescription: 'Transición de dashboard a transactions con parámetros',
    invalidDescription: 'Transición con pantalla de destino vacía (requerida)',
    validData: {
      fromScreen: 'dashboard',
      toScreen: 'transactions',
      transition: 'push',
      params: {
        accountId: '550e8400-e29b-41d4-a716-446655440001',
      },
    },
    invalidData: {
      fromScreen: 'dashboard',
      toScreen: '', // ❌ String vacío (requiere min 1 carácter)
      transition: 'push',
    },
  },

  'ThemeConfig - Configuración Válida': {
    schema: ThemeConfigSchema,
    category: 'ui',
    description: 'Configuración válida de tema',
    validDescription: 'Tema oscuro con colores primario y secundario',
    invalidDescription: 'Tema inválido y colores no hexadecimales',
    validData: {
      theme: 'dark',
      primaryColor: '#3b82f6',
      accentColor: '#ef4444',
    },
    invalidData: {
      theme: 'invalid-theme', // ❌ Tema inválido
      primaryColor: '#GGG', // ❌ Color no hex
      accentColor: '#GGG', // ❌ Color no hex
    },
  },

  'AuthCredentials - Credenciales Válidas': {
    schema: AuthCredentialsSchema,
    category: 'auth',
    description: 'Credenciales de autenticación válidas',
    validDescription: 'Correo electrónico y contraseña válidos',
    invalidDescription: 'Correo electrónico inválido y contraseña corta',
    validData: {
      email: 'user@example.com',
      password: 'password123',
    },
    invalidData: {
      email: 'invalid-email', // ❌ Correo electrónico inválido
      password: 'pass', // ❌ Contraseña corta
    },
  },

  'SyncStatus - Estado de Sincronización Válido': {
    schema: SyncStatusSchema,
    category: 'sync',
    description: 'Estado de sincronización válido',
    validDescription: 'Sincronización exitosa con cambios pendientes',
    invalidDescription: 'Estado de sincronización inválido y cambios negativos',
    validData: {
      status: 'success',
      lastSync: new Date().toISOString(),
      pendingChanges: 5,
    },
    invalidData: {
      status: 'invalid-status', // ❌ Estado inválido
      lastSync: new Date().toISOString(),
      pendingChanges: -1, // ❌ Cambios negativos
    },
  },

  // ==========================================
  // 🧩 COMPONENT TESTS - FASE 2
  // ==========================================

  'SpeedDialAction - Dashboard': {
    schema: SpeedDialActionSchema,
    category: 'ui',
    description: 'Acción de SpeedDial en dashboard',
    validDescription: 'Acción primaria de chat habilitada',
    invalidDescription: 'Acción inválida con ID no permitido',
    validData: {
      id: 'chat',
      label: 'Chat con Oti',
      icon: 'MessageCircle',
      enabled: true,
      primary: true,
    },
    invalidData: {
      id: 'invalid-action', // ❌ ID de acción inválido
      label: 'Chat con Oti',
      icon: 'MessageCircle',
      enabled: true,
      primary: true,
    },
  },

  'SpeedDialAction - Voice': {
    schema: SpeedDialActionSchema,
    category: 'ui',
    description: 'Acción de voz en SpeedDial',
    validDescription: 'Acción de voz habilitada',
    invalidDescription: 'Acción con label vacío',
    validData: {
      id: 'voice',
      label: 'Comando de voz',
      icon: 'Mic',
      enabled: true,
      primary: false,
    },
    invalidData: {
      id: 'voice',
      label: '', // ❌ Label vacío
      icon: 'Mic',
      enabled: true,
    },
  },

  'SpeedDialAction - Image': {
    schema: SpeedDialActionSchema,
    category: 'ui',
    description: 'Acción de imagen en SpeedDial',
    validDescription: 'Acción de subir extracto bancario',
    invalidDescription: 'Acción con icon vacío',
    validData: {
      id: 'image',
      label: 'Subir extracto',
      icon: 'Camera',
      enabled: true,
    },
    invalidData: {
      id: 'image',
      label: 'Subir extracto',
      icon: '', // ❌ Icon vacío
      enabled: true,
    },
  },

  'SpeedDialAction - Manual': {
    schema: SpeedDialActionSchema,
    category: 'ui',
    description: 'Acción manual en SpeedDial',
    validDescription: 'Acción de registro manual de transacción',
    invalidDescription: 'Acción con tipo booleano incorrecto',
    validData: {
      id: 'manual',
      label: 'Registro manual',
      icon: 'Plus',
      enabled: true,
    },
    invalidData: {
      id: 'manual',
      label: 'Registro manual',
      icon: 'Plus',
      enabled: 'true', // ❌ Debe ser booleano, no string
    },
  },

  'NavigationState - Dashboard': {
    schema: NavigationStateSchema,
    category: 'navigation',
    description: 'Estado de navegación en dashboard',
    validDescription: 'Dashboard como pantalla actual sin historial',
    invalidDescription: 'Pantalla actual inválida',
    validData: {
      currentScreen: 'dashboard',
      canGoBack: false,
    },
    invalidData: {
      currentScreen: 'invalid-screen', // ❌ Pantalla inválida
      canGoBack: false,
    },
  },

  'NavigationState - Transactions': {
    schema: NavigationStateSchema,
    category: 'navigation',
    description: 'Estado de navegación en transacciones',
    validDescription: 'Pantalla de transacciones con historial del dashboard',
    invalidDescription: 'Estado de navegación con previousScreen inválido',
    validData: {
      currentScreen: 'transactions',
      previousScreen: 'dashboard',
      canGoBack: true,
      params: {
        accountId: '550e8400-e29b-41d4-a716-446655440001',
      },
    },
    invalidData: {
      currentScreen: 'transactions',
      previousScreen: 'invalid-screen', // ❌ Pantalla previa inválida
      canGoBack: true,
    },
  },

  'NavigationState - With Params': {
    schema: NavigationStateSchema,
    category: 'navigation',
    description: 'Estado de navegación con parámetros',
    validDescription: 'Navegación con filtros de cuenta y categoría',
    invalidDescription: 'canGoBack debe ser booleano',
    validData: {
      currentScreen: 'budgets',
      previousScreen: 'dashboard',
      canGoBack: true,
      params: {
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        month: 11,
        year: 2025,
      },
    },
    invalidData: {
      currentScreen: 'budgets',
      canGoBack: 'yes', // ❌ Debe ser booleano
      params: {},
    },
  },

  'NavigationState - Settings': {
    schema: NavigationStateSchema,
    category: 'navigation',
    description: 'Estado de navegación en configuración',
    validDescription: 'Configuración con historial de statistics',
    invalidDescription: 'Pantalla actual no válida (campo requerido faltante)',
    validData: {
      currentScreen: 'settings',
      previousScreen: 'statistics',
      canGoBack: true,
    },
    invalidData: {
      // currentScreen: missing ❌ Campo requerido
      previousScreen: 'statistics',
      canGoBack: true,
    },
  },

  'OtiChatResponse - Text': {
    schema: OtiChatResponseSchema,
    category: 'ui',
    description: 'Respuesta de texto del chat Oti',
    validDescription: 'Respuesta de texto con sugerencias',
    invalidDescription: 'Respuesta con tipo inválido y timestamp malformado',
    validData: {
      message: '¡Hola! ¿En qué puedo ayudarte hoy?',
      type: 'text',
      suggestions: ['Ver presupuestos', 'Crear transacción', 'Ver estadísticas'],
      timestamp: new Date().toISOString(),
    },
    invalidData: {
      message: '¡Hola! ¿En qué puedo ayudarte hoy?',
      type: 'invalid-type', // ❌ Tipo inválido
      timestamp: 'not-a-date', // ❌ Timestamp inválido
    },
  },

  'OtiChatResponse - Suggestion': {
    schema: OtiChatResponseSchema,
    category: 'ui',
    description: 'Respuesta con sugerencia del chat Oti',
    validDescription: 'Sugerencia de optimización de gastos',
    invalidDescription: 'Mensaje vacío (requerido)',
    validData: {
      message: 'Noté que gastaste 30% más en alimentación este mes. ¿Quieres ajustar tu presupuesto?',
      type: 'suggestion',
      suggestions: ['Ajustar presupuesto', 'Ver detalles', 'Ignorar'],
      timestamp: new Date().toISOString(),
    },
    invalidData: {
      message: '', // ❌ Mensaje vacío
      type: 'suggestion',
      timestamp: new Date().toISOString(),
    },
  },

  'OtiChatResponse - Error': {
    schema: OtiChatResponseSchema,
    category: 'ui',
    description: 'Respuesta de error del chat Oti',
    validDescription: 'Error de comunicación con la IA',
    invalidDescription: 'Sugerencias debe ser array de strings',
    validData: {
      message: 'Lo siento, hubo un error al procesar tu solicitud. Intenta nuevamente.',
      type: 'error',
      timestamp: new Date().toISOString(),
    },
    invalidData: {
      message: 'Error',
      type: 'error',
      suggestions: [123, 456], // ❌ Debe ser array de strings
      timestamp: new Date().toISOString(),
    },
  },

  'TransactionFormProps - Create Mode': {
    schema: TransactionFormPropsSchema,
    category: 'ui',
    description: 'Props del formulario de transacción en modo crear',
    validDescription: 'Formulario en modo crear sin datos iniciales',
    invalidDescription: 'Modo inválido',
    validData: {
      mode: 'create',
    },
    invalidData: {
      mode: 'invalid-mode', // ❌ Modo inválido
    },
  },

  'TransactionFormProps - Edit Mode': {
    schema: TransactionFormPropsSchema,
    category: 'ui',
    description: 'Props del formulario de transacción en modo editar',
    validDescription: 'Formulario en modo editar con datos iniciales',
    invalidDescription: 'initialData con campos inválidos',
    validData: {
      mode: 'edit',
      initialData: {
        type: 'expense',
        amount: 1500,
        category: '550e8400-e29b-41d4-a716-446655440000',
        account: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date().toISOString(),
      },
    },
    invalidData: {
      mode: 'edit',
      initialData: {
        type: 'invalid-type', // ❌ Tipo inválido
        amount: -1500, // ❌ Monto negativo
        category: 'not-uuid', // ❌ UUID inválido
        account: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date().toISOString(),
      },
    },
  },
};

// ============================================
// 🛠️ UTILIDADES
// ============================================

/**
 * Obtiene todos los casos de prueba de una categoría
 */
export function getTestCasesByCategory(category: TestCase['category']): TestCaseCollection {
  return Object.entries(TEST_CASES)
    .filter(([_, testCase]) => testCase.category === category)
    .reduce((acc, [key, testCase]) => ({
      ...acc,
      [key]: testCase,
    }), {});
}

/**
 * Obtiene todas las categorías disponibles
 */
export function getAllCategories(): TestCase['category'][] {
  const categories = new Set<TestCase['category']>();
  Object.values(TEST_CASES).forEach(testCase => {
    categories.add(testCase.category);
  });
  return Array.from(categories);
}

/**
 * Cuenta total de casos de prueba
 */
export function getTestCasesCount(): number {
  return Object.keys(TEST_CASES).length;
}

/**
 * Estadísticas de cobertura
 */
export function getTestCaseStats() {
  const stats = {
    total: getTestCasesCount(),
    byCategory: {} as Record<string, number>,
  };

  Object.values(TEST_CASES).forEach(testCase => {
    if (!stats.byCategory[testCase.category]) {
      stats.byCategory[testCase.category] = 0;
    }
    stats.byCategory[testCase.category]++;
  });

  return stats;
}