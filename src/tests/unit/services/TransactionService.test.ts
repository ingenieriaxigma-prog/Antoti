/**
 * TransactionService Unit Tests
 * 
 * Tests para validar la lógica de negocio de transacciones
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TransactionService } from '../../../features/transactions/services/TransactionService';
import type { Transaction } from '../../../types';

describe('TransactionService', () => {
  let mockTransactions: Transaction[];

  beforeEach(() => {
    // Mock data para cada test
    mockTransactions = [
      {
        id: '1',
        userId: 'user-1',
        type: 'expense',
        amount: 50000,
        category: 'Comida',
        subcategory: '',
        account: 'account-1',
        date: '2025-11-15',
        note: 'Almuerzo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        userId: 'user-1',
        type: 'income',
        amount: 1000000,
        category: 'Salario',
        subcategory: '',
        account: 'account-1',
        date: '2025-11-01',
        note: 'Salario noviembre',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        userId: 'user-1',
        type: 'expense',
        amount: 30000,
        category: 'Transporte',
        subcategory: '',
        account: 'account-1',
        date: '2025-11-20',
        note: 'Taxi',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  describe('calculateTotalExpenses', () => {
    it('debe calcular el total de gastos correctamente', () => {
      const total = TransactionService.calculateTotalExpenses(mockTransactions);
      expect(total).toBe(80000); // 50000 + 30000
    });

    it('debe retornar 0 si no hay gastos', () => {
      const incomeOnly = mockTransactions.filter(t => t.type === 'income');
      const total = TransactionService.calculateTotalExpenses(incomeOnly);
      expect(total).toBe(0);
    });

    it('debe retornar 0 si el array está vacío', () => {
      const total = TransactionService.calculateTotalExpenses([]);
      expect(total).toBe(0);
    });
  });

  describe('calculateTotalIncome', () => {
    it('debe calcular el total de ingresos correctamente', () => {
      const total = TransactionService.calculateTotalIncome(mockTransactions);
      expect(total).toBe(1000000);
    });

    it('debe retornar 0 si no hay ingresos', () => {
      const expensesOnly = mockTransactions.filter(t => t.type === 'expense');
      const total = TransactionService.calculateTotalIncome(expensesOnly);
      expect(total).toBe(0);
    });
  });

  describe('calculateBalance', () => {
    it('debe calcular el balance (ingresos - gastos)', () => {
      const balance = TransactionService.calculateBalance(mockTransactions);
      expect(balance).toBe(920000); // 1000000 - 80000
    });

    it('debe retornar balance negativo si gastos > ingresos', () => {
      const onlyExpenses: Transaction[] = [
        { ...mockTransactions[0], amount: 500000 },
        { ...mockTransactions[2], amount: 600000 },
      ];
      const balance = TransactionService.calculateBalance(onlyExpenses);
      expect(balance).toBe(-1100000);
    });
  });

  describe('filterByDateRange', () => {
    it('debe filtrar transacciones por rango de fechas', () => {
      const filtered = TransactionService.filterByDateRange(
        mockTransactions,
        '2025-11-10',
        '2025-11-20'
      );
      expect(filtered).toHaveLength(2); // Transacciones del 15 y 20
      expect(filtered[0].id).toBe('1');
      expect(filtered[1].id).toBe('3');
    });

    it('debe retornar array vacío si no hay transacciones en el rango', () => {
      const filtered = TransactionService.filterByDateRange(
        mockTransactions,
        '2025-12-01',
        '2025-12-31'
      );
      expect(filtered).toHaveLength(0);
    });

    it('debe incluir fechas límite (inclusive)', () => {
      const filtered = TransactionService.filterByDateRange(
        mockTransactions,
        '2025-11-15',
        '2025-11-15'
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });
  });

  describe('filterByType', () => {
    it('debe filtrar gastos correctamente', () => {
      const expenses = TransactionService.filterByType(mockTransactions, 'expense');
      expect(expenses).toHaveLength(2);
      expect(expenses.every(t => t.type === 'expense')).toBe(true);
    });

    it('debe filtrar ingresos correctamente', () => {
      const incomes = TransactionService.filterByType(mockTransactions, 'income');
      expect(incomes).toHaveLength(1);
      expect(incomes[0].type).toBe('income');
    });
  });

  describe('filterByCategory', () => {
    it('debe filtrar por categoría específica', () => {
      const foodTransactions = TransactionService.filterByCategory(
        mockTransactions,
        'Comida'
      );
      expect(foodTransactions).toHaveLength(1);
      expect(foodTransactions[0].category).toBe('Comida');
    });

    it('debe retornar array vacío si la categoría no existe', () => {
      const filtered = TransactionService.filterByCategory(
        mockTransactions,
        'Categoría Inexistente'
      );
      expect(filtered).toHaveLength(0);
    });

    it('debe ser case-sensitive', () => {
      const filtered = TransactionService.filterByCategory(
        mockTransactions,
        'comida' // lowercase
      );
      expect(filtered).toHaveLength(0); // No debe encontrar "Comida"
    });
  });

  describe('groupByCategory', () => {
    it('debe agrupar transacciones por categoría', () => {
      const grouped = TransactionService.groupByCategory(mockTransactions);
      
      expect(grouped).toHaveProperty('Comida');
      expect(grouped).toHaveProperty('Salario');
      expect(grouped).toHaveProperty('Transporte');
      
      expect(grouped['Comida']).toHaveLength(1);
      expect(grouped['Salario']).toHaveLength(1);
      expect(grouped['Transporte']).toHaveLength(1);
    });

    it('debe retornar objeto vacío si no hay transacciones', () => {
      const grouped = TransactionService.groupByCategory([]);
      expect(Object.keys(grouped)).toHaveLength(0);
    });
  });

  describe('sortByDate', () => {
    it('debe ordenar transacciones por fecha descendente (más reciente primero)', () => {
      const sorted = TransactionService.sortByDate(mockTransactions, 'desc');
      expect(sorted[0].date).toBe('2025-11-20'); // Más reciente
      expect(sorted[1].date).toBe('2025-11-15');
      expect(sorted[2].date).toBe('2025-11-01'); // Más antigua
    });

    it('debe ordenar transacciones por fecha ascendente (más antigua primero)', () => {
      const sorted = TransactionService.sortByDate(mockTransactions, 'asc');
      expect(sorted[0].date).toBe('2025-11-01'); // Más antigua
      expect(sorted[1].date).toBe('2025-11-15');
      expect(sorted[2].date).toBe('2025-11-20'); // Más reciente
    });
  });

  describe('getMonthlyTotal', () => {
    it('debe calcular el total de un mes específico', () => {
      const total = TransactionService.getMonthlyTotal(
        mockTransactions,
        2025,
        11, // Noviembre
        'expense'
      );
      expect(total).toBe(80000); // 50000 + 30000
    });

    it('debe retornar 0 si no hay transacciones en ese mes', () => {
      const total = TransactionService.getMonthlyTotal(
        mockTransactions,
        2025,
        12, // Diciembre (vacío)
        'expense'
      );
      expect(total).toBe(0);
    });

    it('debe calcular ingresos mensuales correctamente', () => {
      const total = TransactionService.getMonthlyTotal(
        mockTransactions,
        2025,
        11,
        'income'
      );
      expect(total).toBe(1000000);
    });
  });

  describe('validateTransaction', () => {
    it('debe validar una transacción correcta', () => {
      const validTransaction: Partial<Transaction> = {
        type: 'expense',
        amount: 50000,
        category: 'Comida',
        account: 'account-1',
        date: '2025-11-15',
      };

      const result = TransactionService.validateTransaction(validTransaction);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('debe detectar monto inválido (negativo)', () => {
      const invalidTransaction: Partial<Transaction> = {
        type: 'expense',
        amount: -100,
        category: 'Comida',
        account: 'account-1',
        date: '2025-11-15',
      };

      const result = TransactionService.validateTransaction(invalidTransaction);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('amount');
    });

    it('debe detectar campos requeridos faltantes', () => {
      const invalidTransaction: Partial<Transaction> = {
        type: 'expense',
        amount: 50000,
        // Falta category, account, date
      };

      const result = TransactionService.validateTransaction(invalidTransaction);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('debe validar transferencias con cuenta destino', () => {
      const validTransfer: Partial<Transaction> = {
        type: 'transfer',
        amount: 100000,
        account: 'account-1',
        toAccount: 'account-2',
        date: '2025-11-15',
      };

      const result = TransactionService.validateTransaction(validTransfer);
      expect(result.isValid).toBe(true);
    });

    it('debe detectar transferencia sin cuenta destino', () => {
      const invalidTransfer: Partial<Transaction> = {
        type: 'transfer',
        amount: 100000,
        account: 'account-1',
        // Falta toAccount
        date: '2025-11-15',
      };

      const result = TransactionService.validateTransaction(invalidTransfer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('toAccount');
    });
  });

  describe('searchTransactions', () => {
    it('debe buscar por nota', () => {
      const results = TransactionService.searchTransactions(
        mockTransactions,
        'almuerzo'
      );
      expect(results).toHaveLength(1);
      expect(results[0].note).toContain('Almuerzo');
    });

    it('debe buscar por categoría', () => {
      const results = TransactionService.searchTransactions(
        mockTransactions,
        'transporte'
      );
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('Transporte');
    });

    it('debe ser case-insensitive', () => {
      const results = TransactionService.searchTransactions(
        mockTransactions,
        'COMIDA'
      );
      expect(results).toHaveLength(1);
    });

    it('debe retornar array vacío si no encuentra resultados', () => {
      const results = TransactionService.searchTransactions(
        mockTransactions,
        'xyz123'
      );
      expect(results).toHaveLength(0);
    });
  });
});
