/**
 * Unit Tests - Financial Calculations
 * 
 * Tests para las funciones de cálculos financieros en /utils/calculations.ts
 * 
 * 📊 Cobertura: calculateTotalIncome, calculateTotalExpenses, calculateBalance,
 *              calculateSavingsRate, calculateBudgetUsage, etc.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  calculateSavingsRate,
  calculateBudgetUsage,
  calculatePercentageChange,
  filterTransactionsByMonth,
  filterTransactionsByDateRange,
  calculateCategorySpending,
} from '@/utils/calculations';
import type { Transaction } from '@/types';

// ============================================
// 🧪 MOCK DATA
// ============================================

const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    userId: 'user-1',
    type: 'income',
    amount: 5000,
    category: 'cat-income',
    account: 'acc-1',
    date: '2025-11-15T10:00:00.000Z',
    note: 'Salario',
    createdAt: '2025-11-15T10:00:00.000Z',
    updatedAt: '2025-11-15T10:00:00.000Z',
  },
  {
    id: 'txn-2',
    userId: 'user-1',
    type: 'income',
    amount: 2000,
    category: 'cat-income',
    account: 'acc-1',
    date: '2025-11-20T10:00:00.000Z',
    note: 'Freelance',
    createdAt: '2025-11-20T10:00:00.000Z',
    updatedAt: '2025-11-20T10:00:00.000Z',
  },
  {
    id: 'txn-3',
    userId: 'user-1',
    type: 'expense',
    amount: 1500,
    category: 'cat-food',
    account: 'acc-1',
    date: '2025-11-18T10:00:00.000Z',
    note: 'Supermercado',
    createdAt: '2025-11-18T10:00:00.000Z',
    updatedAt: '2025-11-18T10:00:00.000Z',
  },
  {
    id: 'txn-4',
    userId: 'user-1',
    type: 'expense',
    amount: 500,
    category: 'cat-transport',
    account: 'acc-1',
    date: '2025-11-22T10:00:00.000Z',
    note: 'Taxi',
    createdAt: '2025-11-22T10:00:00.000Z',
    updatedAt: '2025-11-22T10:00:00.000Z',
  },
  {
    id: 'txn-5',
    userId: 'user-1',
    type: 'expense',
    amount: 800,
    category: 'cat-food',
    account: 'acc-1',
    date: '2025-10-15T10:00:00.000Z',
    note: 'Restaurante (octubre)',
    createdAt: '2025-10-15T10:00:00.000Z',
    updatedAt: '2025-10-15T10:00:00.000Z',
  },
];

// ============================================
// 🧪 INCOME CALCULATIONS
// ============================================

describe('calculateTotalIncome', () => {
  it('debería calcular correctamente el total de ingresos', () => {
    const result = calculateTotalIncome(mockTransactions);
    expect(result).toBe(7000); // 5000 + 2000
  });

  it('debería retornar 0 cuando no hay transacciones', () => {
    const result = calculateTotalIncome([]);
    expect(result).toBe(0);
  });

  it('debería ignorar gastos y transferencias', () => {
    const result = calculateTotalIncome(mockTransactions);
    expect(result).not.toContain(1500); // gasto
    expect(result).toBe(7000);
  });

  it('debería manejar transacciones solo de gastos', () => {
    const expensesOnly = mockTransactions.filter(t => t.type === 'expense');
    const result = calculateTotalIncome(expensesOnly);
    expect(result).toBe(0);
  });
});

// ============================================
// 🧪 EXPENSE CALCULATIONS
// ============================================

describe('calculateTotalExpenses', () => {
  it('debería calcular correctamente el total de gastos', () => {
    const result = calculateTotalExpenses(mockTransactions);
    expect(result).toBe(2800); // 1500 + 500 + 800
  });

  it('debería retornar 0 cuando no hay transacciones', () => {
    const result = calculateTotalExpenses([]);
    expect(result).toBe(0);
  });

  it('debería ignorar ingresos', () => {
    const result = calculateTotalExpenses(mockTransactions);
    expect(result).not.toContain(5000); // ingreso
    expect(result).toBe(2800);
  });
});

// ============================================
// 🧪 BALANCE CALCULATIONS
// ============================================

describe('calculateBalance', () => {
  it('debería calcular el balance neto correctamente', () => {
    const result = calculateBalance(mockTransactions);
    expect(result).toBe(4200); // 7000 - 2800
  });

  it('debería retornar balance positivo cuando ingresos > gastos', () => {
    const result = calculateBalance(mockTransactions);
    expect(result).toBeGreaterThan(0);
  });

  it('debería retornar balance negativo cuando gastos > ingresos', () => {
    const moreExpenses: Transaction[] = [
      ...mockTransactions,
      {
        id: 'txn-6',
        userId: 'user-1',
        type: 'expense',
        amount: 10000,
        category: 'cat-rent',
        account: 'acc-1',
        date: '2025-11-25T10:00:00.000Z',
        note: 'Renta',
        createdAt: '2025-11-25T10:00:00.000Z',
        updatedAt: '2025-11-25T10:00:00.000Z',
      },
    ];
    const result = calculateBalance(moreExpenses);
    expect(result).toBeLessThan(0);
  });

  it('debería retornar 0 cuando no hay transacciones', () => {
    const result = calculateBalance([]);
    expect(result).toBe(0);
  });
});

// ============================================
// 🧪 SAVINGS RATE
// ============================================

describe('calculateSavingsRate', () => {
  it('debería calcular la tasa de ahorro correctamente', () => {
    const result = calculateSavingsRate(mockTransactions);
    // (7000 - 2800) / 7000 * 100 = 60%
    expect(result).toBe(60);
  });

  it('debería retornar 0 cuando no hay ingresos', () => {
    const expensesOnly = mockTransactions.filter(t => t.type === 'expense');
    const result = calculateSavingsRate(expensesOnly);
    expect(result).toBe(0);
  });

  it('debería retornar negativo cuando gastos > ingresos', () => {
    const moreExpenses: Transaction[] = [
      {
        id: 'txn-1',
        userId: 'user-1',
        type: 'income',
        amount: 1000,
        category: 'cat-income',
        account: 'acc-1',
        date: '2025-11-15T10:00:00.000Z',
        note: 'Ingreso',
        createdAt: '2025-11-15T10:00:00.000Z',
        updatedAt: '2025-11-15T10:00:00.000Z',
      },
      {
        id: 'txn-2',
        userId: 'user-1',
        type: 'expense',
        amount: 2000,
        category: 'cat-expense',
        account: 'acc-1',
        date: '2025-11-15T10:00:00.000Z',
        note: 'Gasto',
        createdAt: '2025-11-15T10:00:00.000Z',
        updatedAt: '2025-11-15T10:00:00.000Z',
      },
    ];
    const result = calculateSavingsRate(moreExpenses);
    expect(result).toBeLessThan(0);
  });
});

// ============================================
// 🧪 BUDGET USAGE
// ============================================

describe('calculateBudgetUsage', () => {
  it('debería calcular porcentaje de uso al 50%', () => {
    const result = calculateBudgetUsage(5000, 10000);
    expect(result).toBe(50);
  });

  it('debería calcular porcentaje de sobrepaso al 120%', () => {
    const result = calculateBudgetUsage(12000, 10000);
    expect(result).toBe(120);
  });

  it('debería retornar 0 cuando budget es 0', () => {
    const result = calculateBudgetUsage(5000, 0);
    expect(result).toBe(0);
  });

  it('debería retornar 0 cuando spent es 0', () => {
    const result = calculateBudgetUsage(0, 10000);
    expect(result).toBe(0);
  });

  it('debería redondear correctamente', () => {
    const result = calculateBudgetUsage(3333, 10000);
    expect(result).toBe(33); // 33.33% redondeado
  });
});

// ============================================
// 🧪 PERCENTAGE CHANGE
// ============================================

describe('calculatePercentageChange', () => {
  it('debería calcular cambio positivo del 25%', () => {
    const result = calculatePercentageChange(5000, 4000);
    expect(result).toBe(25);
  });

  it('debería calcular cambio negativo del -20%', () => {
    const result = calculatePercentageChange(4000, 5000);
    expect(result).toBe(-20);
  });

  it('debería retornar 100% cuando previous es 0 y current > 0', () => {
    const result = calculatePercentageChange(5000, 0);
    expect(result).toBe(100);
  });

  it('debería retornar 0 cuando previous es 0 y current es 0', () => {
    const result = calculatePercentageChange(0, 0);
    expect(result).toBe(0);
  });
});

// ============================================
// 🧪 FILTER BY MONTH
// ============================================

describe('filterTransactionsByMonth', () => {
  it('debería filtrar transacciones de noviembre 2025', () => {
    const result = filterTransactionsByMonth(mockTransactions, 10, 2025); // month: 10 = noviembre (0-indexed)
    expect(result).toHaveLength(4); // 4 transacciones en noviembre
    expect(result.every(t => {
      const date = new Date(t.date);
      return date.getMonth() === 10 && date.getFullYear() === 2025;
    })).toBe(true);
  });

  it('debería filtrar transacciones de octubre 2025', () => {
    const result = filterTransactionsByMonth(mockTransactions, 9, 2025); // month: 9 = octubre (0-indexed)
    expect(result).toHaveLength(1); // 1 transacción en octubre
  });

  it('debería retornar array vacío para mes sin transacciones', () => {
    const result = filterTransactionsByMonth(mockTransactions, 0, 2025); // enero
    expect(result).toHaveLength(0);
  });
});

// ============================================
// 🧪 FILTER BY DATE RANGE
// ============================================

describe('filterTransactionsByDateRange', () => {
  it('debería filtrar transacciones en rango de fechas', () => {
    const startDate = new Date('2025-11-01T00:00:00.000Z');
    const endDate = new Date('2025-11-30T23:59:59.999Z');
    const result = filterTransactionsByDateRange(mockTransactions, startDate, endDate);
    expect(result).toHaveLength(4); // 4 transacciones en noviembre
  });

  it('debería incluir transacciones en fecha inicial', () => {
    const startDate = new Date('2025-11-15T00:00:00.000Z');
    const endDate = new Date('2025-11-30T23:59:59.999Z');
    const result = filterTransactionsByDateRange(mockTransactions, startDate, endDate);
    const hasStartDateTxn = result.some(t => t.date.includes('2025-11-15'));
    expect(hasStartDateTxn).toBe(true);
  });

  it('debería incluir transacciones en fecha final', () => {
    const startDate = new Date('2025-11-01T00:00:00.000Z');
    const endDate = new Date('2025-11-22T23:59:59.999Z');
    const result = filterTransactionsByDateRange(mockTransactions, startDate, endDate);
    const hasEndDateTxn = result.some(t => t.date.includes('2025-11-22'));
    expect(hasEndDateTxn).toBe(true);
  });

  it('debería retornar array vacío para rango sin transacciones', () => {
    const startDate = new Date('2025-01-01T00:00:00.000Z');
    const endDate = new Date('2025-01-31T23:59:59.999Z');
    const result = filterTransactionsByDateRange(mockTransactions, startDate, endDate);
    expect(result).toHaveLength(0);
  });
});

// ============================================
// 🧪 CATEGORY SPENDING
// ============================================

describe('calculateCategorySpending', () => {
  it('debería calcular gasto total por categoría', () => {
    const result = calculateCategorySpending(mockTransactions, 'cat-food');
    expect(result).toBe(2300); // 1500 + 800
  });

  it('debería retornar 0 para categoría sin gastos', () => {
    const result = calculateCategorySpending(mockTransactions, 'cat-nonexistent');
    expect(result).toBe(0);
  });

  it('debería ignorar ingresos de la misma categoría', () => {
    const mixedTransactions: Transaction[] = [
      ...mockTransactions,
      {
        id: 'txn-6',
        userId: 'user-1',
        type: 'income',
        amount: 1000,
        category: 'cat-food', // mismo categoryId pero es ingreso
        account: 'acc-1',
        date: '2025-11-25T10:00:00.000Z',
        note: 'Reembolso comida',
        createdAt: '2025-11-25T10:00:00.000Z',
        updatedAt: '2025-11-25T10:00:00.000Z',
      },
    ];
    const result = calculateCategorySpending(mixedTransactions, 'cat-food');
    expect(result).toBe(2300); // Solo gastos, no incluye el ingreso de 1000
  });
});
