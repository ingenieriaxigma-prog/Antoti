/**
 * Schema Validation Tests
 * 
 * Tests automatizados para validación de schemas Zod.
 * Validamos que los schemas acepten datos válidos y rechacen datos inválidos.
 * 
 * 📊 Cobertura: TransactionCreateSchema, BudgetCreateSchema, AccountCreateSchema,
 *              CategoryCreateSchema, TransactionFilterSchema
 */

import { describe, it, expect } from 'vitest';
import {
  TransactionCreateSchema,
  BudgetCreateSchema,
  AccountCreateSchema,
  CategoryCreateSchema,
  TransactionFilterSchema,
} from '@/schemas';

// ============================================
// 🧪 TRANSACTION VALIDATION
// ============================================

describe('TransactionCreateSchema', () => {
  describe('Ingreso válido', () => {
    it('debería validar ingreso con campos requeridos', () => {
      const validIncome = {
        type: 'income',
        amount: 5000,
        category: '550e8400-e29b-41d4-a716-446655440000',
        account: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date().toISOString(),
        note: 'Salario mensual',
      };

      const result = TransactionCreateSchema.safeParse(validIncome);
      expect(result.success).toBe(true);
    });

    it('debería permitir ingreso sin nota', () => {
      const validIncome = {
        type: 'income',
        amount: 5000,
        category: '550e8400-e29b-41d4-a716-446655440000',
        account: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date().toISOString(),
      };

      const result = TransactionCreateSchema.safeParse(validIncome);
      expect(result.success).toBe(true);
    });
  });

  describe('Ingreso inválido', () => {
    it('debería rechazar monto negativo', () => {
      const invalidIncome = {
        type: 'income',
        amount: -5000,
        category: '550e8400-e29b-41d4-a716-446655440000',
        account: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date().toISOString(),
      };

      const result = TransactionCreateSchema.safeParse(invalidIncome);
      expect(result.success).toBe(false);
    });

    it('debería rechazar UUID inválido en account', () => {
      const invalidIncome = {
        type: 'income',
        amount: 5000,
        category: '550e8400-e29b-41d4-a716-446655440000',
        account: 'invalid-uuid',
        date: new Date().toISOString(),
      };

      const result = TransactionCreateSchema.safeParse(invalidIncome);
      expect(result.success).toBe(false);
    });

    it('debería rechazar fecha inválida', () => {
      const invalidIncome = {
        type: 'income',
        amount: 5000,
        category: '550e8400-e29b-41d4-a716-446655440000',
        account: '550e8400-e29b-41d4-a716-446655440001',
        date: 'not-a-date',
      };

      const result = TransactionCreateSchema.safeParse(invalidIncome);
      expect(result.success).toBe(false);
    });
  });

  describe('Gasto válido', () => {
    it('debería validar gasto con categoría', () => {
      const validExpense = {
        type: 'expense',
        amount: 1500,
        category: '550e8400-e29b-41d4-a716-446655440002',
        account: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date().toISOString(),
        note: 'Compras del supermercado',
      };

      const result = TransactionCreateSchema.safeParse(validExpense);
      expect(result.success).toBe(true);
    });

    it('debería validar gasto con subcategoría', () => {
      const validExpense = {
        type: 'expense',
        amount: 1500,
        category: '550e8400-e29b-41d4-a716-446655440002',
        subcategory: '550e8400-e29b-41d4-a716-446655440003',
        account: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date().toISOString(),
      };

      const result = TransactionCreateSchema.safeParse(validExpense);
      expect(result.success).toBe(true);
    });
  });

  describe('Transferencia válida', () => {
    it('debería validar transferencia entre cuentas diferentes', () => {
      const validTransfer = {
        type: 'transfer',
        amount: 2000,
        account: '550e8400-e29b-41d4-a716-446655440001',
        toAccount: '550e8400-e29b-41d4-a716-446655440004',
        date: new Date().toISOString(),
        note: 'Transferencia entre cuentas',
      };

      const result = TransactionCreateSchema.safeParse(validTransfer);
      expect(result.success).toBe(true);
    });
  });
});

// ============================================
// 🧪 BUDGET VALIDATION
// ============================================

describe('BudgetCreateSchema', () => {
  describe('Presupuesto mensual válido', () => {
    it('debería validar presupuesto mensual', () => {
      const validBudget = {
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 15000,
        period: 'monthly',
        alertThreshold: 80,
      };

      const result = BudgetCreateSchema.safeParse(validBudget);
      expect(result.success).toBe(true);
    });

    it('debería permitir threshold opcional', () => {
      const validBudget = {
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 15000,
        period: 'monthly',
      };

      const result = BudgetCreateSchema.safeParse(validBudget);
      expect(result.success).toBe(true);
    });
  });

  describe('Presupuesto inválido', () => {
    it('debería rechazar monto negativo', () => {
      const invalidBudget = {
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        amount: -1000,
        period: 'monthly',
      };

      const result = BudgetCreateSchema.safeParse(invalidBudget);
      expect(result.success).toBe(false);
    });

    it('debería rechazar periodo inválido', () => {
      const invalidBudget = {
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 15000,
        period: 'weekly',
      };

      const result = BudgetCreateSchema.safeParse(invalidBudget);
      expect(result.success).toBe(false);
    });

    it('debería rechazar threshold > 100', () => {
      const invalidBudget = {
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 15000,
        period: 'monthly',
        alertThreshold: 150,
      };

      const result = BudgetCreateSchema.safeParse(invalidBudget);
      expect(result.success).toBe(false);
    });

    it('debería rechazar threshold < 1', () => {
      const invalidBudget = {
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 15000,
        period: 'monthly',
        alertThreshold: 0,
      };

      const result = BudgetCreateSchema.safeParse(invalidBudget);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================
// 🧪 ACCOUNT VALIDATION
// ============================================

describe('AccountCreateSchema', () => {
  describe('Cuenta bancaria válida', () => {
    it('debería validar cuenta con todos los campos', () => {
      const validAccount = {
        name: 'Cuenta de Ahorros',
        type: 'bank',
        balance: 50000,
        icon: 'Building2',
        color: '#10b981',
      };

      const result = AccountCreateSchema.safeParse(validAccount);
      expect(result.success).toBe(true);
    });

    it('debería permitir balance negativo (deuda)', () => {
      const validAccount = {
        name: 'Tarjeta de Crédito',
        type: 'card',
        balance: -15000,
        icon: 'CreditCard',
        color: '#ef4444',
      };

      const result = AccountCreateSchema.safeParse(validAccount);
      expect(result.success).toBe(true);
    });
  });

  describe('Cuenta inválida', () => {
    it('debería rechazar nombre vacío', () => {
      const invalidAccount = {
        name: '',
        type: 'bank',
        balance: 50000,
        icon: 'Building2',
        color: '#10b981',
      };

      const result = AccountCreateSchema.safeParse(invalidAccount);
      expect(result.success).toBe(false);
    });

    it('debería rechazar tipo inválido', () => {
      const invalidAccount = {
        name: 'Cuenta',
        type: 'crypto',
        balance: 50000,
        icon: 'Building2',
        color: '#10b981',
      };

      const result = AccountCreateSchema.safeParse(invalidAccount);
      expect(result.success).toBe(false);
    });

    it('debería rechazar color no hexadecimal', () => {
      const invalidAccount = {
        name: 'Cuenta',
        type: 'bank',
        balance: 50000,
        icon: 'Building2',
        color: 'green',
      };

      const result = AccountCreateSchema.safeParse(invalidAccount);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================
// 🧪 CATEGORY VALIDATION
// ============================================

describe('CategoryCreateSchema', () => {
  describe('Categoría válida', () => {
    it('debería validar categoría simple', () => {
      const validCategory = {
        name: 'Salario',
        type: 'income',
        icon: 'DollarSign',
        color: '#10b981',
        emoji: '💰',
      };

      const result = CategoryCreateSchema.safeParse(validCategory);
      expect(result.success).toBe(true);
    });

    it('debería validar categoría con subcategorías', () => {
      const validCategory = {
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
        ],
      };

      const result = CategoryCreateSchema.safeParse(validCategory);
      expect(result.success).toBe(true);
    });
  });

  describe('Categoría inválida', () => {
    it('debería rechazar nombre vacío', () => {
      const invalidCategory = {
        name: '',
        type: 'income',
        icon: 'DollarSign',
        color: '#10b981',
      };

      const result = CategoryCreateSchema.safeParse(invalidCategory);
      expect(result.success).toBe(false);
    });

    it('debería rechazar tipo inválido', () => {
      const invalidCategory = {
        name: 'Categoría',
        type: 'both',
        icon: 'DollarSign',
        color: '#10b981',
      };

      const result = CategoryCreateSchema.safeParse(invalidCategory);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================
// 🧪 FILTER VALIDATION
// ============================================

describe('TransactionFilterSchema', () => {
  describe('Filtro válido', () => {
    it('debería validar filtro básico', () => {
      const validFilter = {
        type: 'expense',
        accountId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = TransactionFilterSchema.safeParse(validFilter);
      expect(result.success).toBe(true);
    });

    it('debería validar filtro con rango de fechas', () => {
      const validFilter = {
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2025-12-31T23:59:59.999Z',
      };

      const result = TransactionFilterSchema.safeParse(validFilter);
      expect(result.success).toBe(true);
    });

    it('debería validar filtro con rango de montos', () => {
      const validFilter = {
        minAmount: 1000,
        maxAmount: 5000,
      };

      const result = TransactionFilterSchema.safeParse(validFilter);
      expect(result.success).toBe(true);
    });
  });

  describe('Filtro inválido', () => {
    it('debería rechazar tipo inválido', () => {
      const invalidFilter = {
        type: 'invalid',
      };

      const result = TransactionFilterSchema.safeParse(invalidFilter);
      expect(result.success).toBe(false);
    });

    it('debería rechazar UUID inválido', () => {
      const invalidFilter = {
        accountId: 'not-uuid',
      };

      const result = TransactionFilterSchema.safeParse(invalidFilter);
      expect(result.success).toBe(false);
    });
  });
});
