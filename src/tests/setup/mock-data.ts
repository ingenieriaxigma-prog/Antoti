/**
 * Mock Data para Integration Tests
 * 
 * Datos de prueba realistas para usar en tests
 */

import type { Transaction, Account, Budget, Category } from '../../types';

// ============================================
// 👤 TEST USERS
// ============================================

export const TEST_USERS = {
  user1: {
    email: 'test-user-1@xigma.test',
    password: 'TestPassword123!',
    name: 'Usuario Prueba 1',
  },
  user2: {
    email: 'test-user-2@xigma.test',
    password: 'TestPassword456!',
    name: 'Usuario Prueba 2',
  },
  admin: {
    email: 'admin@xigma.test',
    password: 'AdminPassword789!',
    name: 'Admin Prueba',
  },
};

// ============================================
// 💰 TEST ACCOUNTS
// ============================================

export const TEST_ACCOUNTS: Omit<Account, 'id'>[] = [
  {
    name: 'Efectivo Test',
    type: 'cash',
    balance: 100000,
    icon: 'wallet',
    color: '#10b981',
  },
  {
    name: 'Bancolombia Test',
    type: 'bank',
    balance: 500000,
    icon: 'building-2',
    color: '#FFDE00',
  },
  {
    name: 'Nequi Test',
    type: 'digital',
    balance: 200000,
    icon: 'smartphone',
    color: '#FF006B',
  },
];

// ============================================
// 📂 TEST CATEGORIES
// ============================================

export const TEST_CATEGORIES: Omit<Category, 'id'>[] = [
  {
    name: 'Salario Test',
    type: 'income',
    icon: 'briefcase',
    color: '#10b981',
    subcategories: ['Sueldo', 'Bonos', 'Extras'],
  },
  {
    name: 'Alimentación Test',
    type: 'expense',
    icon: 'utensils',
    color: '#f97316',
    subcategories: ['Supermercado', 'Restaurantes', 'Delivery'],
  },
  {
    name: 'Transporte Test',
    type: 'expense',
    icon: 'car',
    color: '#3b82f6',
    subcategories: ['Gasolina', 'Uber', 'Parqueadero'],
  },
  {
    name: 'Entretenimiento Test',
    type: 'expense',
    icon: 'film',
    color: '#8b5cf6',
    subcategories: ['Cine', 'Streaming', 'Salidas'],
  },
];

// ============================================
// 💸 TEST TRANSACTIONS
// ============================================

export const TEST_TRANSACTIONS = {
  income: (userId: string, accountId: string, categoryId: string): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> => ({
    userId,
    type: 'income',
    amount: 5000000,
    category: categoryId,
    subcategory: 'Sueldo',
    account: accountId,
    date: new Date().toISOString(),
    note: 'Salario mensual de prueba',
  }),
  
  expense: (userId: string, accountId: string, categoryId: string): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> => ({
    userId,
    type: 'expense',
    amount: 150000,
    category: categoryId,
    subcategory: 'Supermercado',
    account: accountId,
    date: new Date().toISOString(),
    note: 'Compras del mes',
  }),
  
  transfer: (userId: string, fromAccountId: string, toAccountId: string): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> => ({
    userId,
    type: 'transfer',
    amount: 100000,
    account: fromAccountId,
    toAccount: toAccountId,
    date: new Date().toISOString(),
    note: 'Transferencia de prueba',
  }),
  
  smallExpense: (userId: string, accountId: string, categoryId: string): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> => ({
    userId,
    type: 'expense',
    amount: 50000,
    category: categoryId,
    subcategory: 'Restaurantes',
    account: accountId,
    date: new Date().toISOString(),
    note: 'Almuerzo',
  }),
  
  largeExpense: (userId: string, accountId: string, categoryId: string): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> => ({
    userId,
    type: 'expense',
    amount: 600000,
    category: categoryId,
    subcategory: 'Supermercado',
    account: accountId,
    date: new Date().toISOString(),
    note: 'Compras grandes',
  }),
};

// ============================================
// 📊 TEST BUDGETS
// ============================================

export const TEST_BUDGETS = {
  normal: (userId: string, categoryId: string): Omit<Budget, 'id'> => ({
    userId,
    categoryId,
    amount: 500000,
    period: 'monthly' as const,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    alertThreshold: 80,
  }),
  
  low: (userId: string, categoryId: string): Omit<Budget, 'id'> => ({
    userId,
    categoryId,
    amount: 100000,
    period: 'monthly' as const,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    alertThreshold: 90,
  }),
  
  high: (userId: string, categoryId: string): Omit<Budget, 'id'> => ({
    userId,
    categoryId,
    amount: 2000000,
    period: 'monthly' as const,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    alertThreshold: 75,
  }),
};

// ============================================
// 🎯 TEST SCENARIOS
// ============================================

/**
 * Escenario completo para testing de presupuesto
 */
export const BUDGET_TEST_SCENARIO = {
  budget: {
    amount: 500000,
    alertThreshold: 80,
  },
  transactions: [
    { amount: 100000, description: 'Primera compra (20%)' }, // 20% usado
    { amount: 150000, description: 'Segunda compra (50%)' }, // 50% usado
    { amount: 200000, description: 'Tercera compra (90%)' }, // 90% usado - Excede threshold
    { amount: 100000, description: 'Cuarta compra (110%)' }, // 110% usado - Excede presupuesto
  ],
};

/**
 * Escenario de transferencia entre cuentas
 */
export const TRANSFER_TEST_SCENARIO = {
  fromAccount: {
    name: 'Cuenta Origen',
    initialBalance: 1000000,
  },
  toAccount: {
    name: 'Cuenta Destino',
    initialBalance: 500000,
  },
  transferAmount: 300000,
  expectedBalances: {
    from: 700000, // 1000000 - 300000
    to: 800000,   // 500000 + 300000
  },
};

/**
 * Escenario de edición de transacción
 */
export const EDIT_TRANSACTION_SCENARIO = {
  original: {
    amount: 100000,
    category: 'Alimentación',
    note: 'Compra original',
  },
  edited: {
    amount: 150000,
    category: 'Transporte',
    note: 'Compra editada',
  },
};

// ============================================
// 🔧 HELPER FUNCTIONS
// ============================================

/**
 * Genera una fecha para el mes actual
 */
export function getCurrentMonthDate(day: number = 15): string {
  const date = new Date();
  date.setDate(day);
  return date.toISOString();
}

/**
 * Genera una fecha para el mes anterior
 */
export function getLastMonthDate(day: number = 15): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setDate(day);
  return date.toISOString();
}

/**
 * Genera un ID único para tests
 */
export function generateTestId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Genera un email único para tests
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@xigma.test`;
}
