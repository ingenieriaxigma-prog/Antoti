/**
 * Unit Test Cases - Tests Unitarios para Funciones Puras
 * 
 * Tests que validan funciones individuales de forma aislada.
 * Cubre: cálculos, formateo, validación y utilidades.
 */

export type UnitTestCase = {
  id: string;
  title: string;
  description: string;
  category: 'calculations' | 'formatting' | 'validation' | 'utilities';
  priority: 'high' | 'medium' | 'low';
  testFunction: () => void | Promise<void>;
};

// ===========================
// CALCULATIONS TESTS (20 tests)
// ===========================

export const CALCULATION_TESTS: Record<string, UnitTestCase> = {
  'calc-001': {
    id: 'calc-001',
    title: 'calculateTotalIncome - con ingresos válidos',
    description: 'Debe calcular correctamente la suma de todos los ingresos',
    category: 'calculations',
    priority: 'high',
    testFunction: async () => {
      const { calculateTotalIncome } = await import('../utils/calculations');
      const transactions = [
        { id: '1', type: 'income' as const, amount: 1000, date: '2026-01-01', description: 'Salario', account: 'acc1' },
        { id: '2', type: 'income' as const, amount: 500, date: '2026-01-02', description: 'Freelance', account: 'acc1' },
        { id: '3', type: 'expense' as const, amount: 200, date: '2026-01-03', description: 'Compra', account: 'acc1' },
      ];
      const result = calculateTotalIncome(transactions);
      if (result !== 1500) throw new Error(`Expected 1500, got ${result}`);
    }
  },

  'calc-002': {
    id: 'calc-002',
    title: 'calculateTotalIncome - sin ingresos',
    description: 'Debe retornar 0 cuando no hay ingresos',
    category: 'calculations',
    priority: 'medium',
    testFunction: async () => {
      const { calculateTotalIncome } = await import('../utils/calculations');
      const transactions = [
        { id: '1', type: 'expense' as const, amount: 200, date: '2026-01-01', description: 'Compra', account: 'acc1' },
      ];
      const result = calculateTotalIncome(transactions);
      if (result !== 0) throw new Error(`Expected 0, got ${result}`);
    }
  },

  'calc-003': {
    id: 'calc-003',
    title: 'calculateTotalExpenses - con gastos válidos',
    description: 'Debe calcular correctamente la suma de todos los gastos',
    category: 'calculations',
    priority: 'high',
    testFunction: async () => {
      const { calculateTotalExpenses } = await import('../utils/calculations');
      const transactions = [
        { id: '1', type: 'expense' as const, amount: 200, date: '2026-01-01', description: 'Compra', account: 'acc1' },
        { id: '2', type: 'expense' as const, amount: 150, date: '2026-01-02', description: 'Transporte', account: 'acc1' },
        { id: '3', type: 'income' as const, amount: 1000, date: '2026-01-03', description: 'Salario', account: 'acc1' },
      ];
      const result = calculateTotalExpenses(transactions);
      if (result !== 350) throw new Error(`Expected 350, got ${result}`);
    }
  },

  'calc-004': {
    id: 'calc-004',
    title: 'calculateBalance - balance positivo',
    description: 'Debe calcular balance positivo (ingresos > gastos)',
    category: 'calculations',
    priority: 'high',
    testFunction: async () => {
      const { calculateBalance } = await import('../utils/calculations');
      const transactions = [
        { id: '1', type: 'income' as const, amount: 1000, date: '2026-01-01', description: 'Salario', account: 'acc1' },
        { id: '2', type: 'expense' as const, amount: 300, date: '2026-01-02', description: 'Compra', account: 'acc1' },
      ];
      const result = calculateBalance(transactions);
      if (result !== 700) throw new Error(`Expected 700, got ${result}`);
    }
  },

  'calc-005': {
    id: 'calc-005',
    title: 'calculateBalance - balance negativo',
    description: 'Debe calcular balance negativo (gastos > ingresos)',
    category: 'calculations',
    priority: 'high',
    testFunction: async () => {
      const { calculateBalance } = await import('../utils/calculations');
      const transactions = [
        { id: '1', type: 'income' as const, amount: 500, date: '2026-01-01', description: 'Salario', account: 'acc1' },
        { id: '2', type: 'expense' as const, amount: 800, date: '2026-01-02', description: 'Compra', account: 'acc1' },
      ];
      const result = calculateBalance(transactions);
      if (result !== -300) throw new Error(`Expected -300, got ${result}`);
    }
  },

  'calc-006': {
    id: 'calc-006',
    title: 'calculateBudgetUsage - uso normal',
    description: 'Debe calcular porcentaje correcto de uso del presupuesto',
    category: 'calculations',
    priority: 'high',
    testFunction: async () => {
      const { calculateBudgetUsage } = await import('../utils/calculations');
      const result = calculateBudgetUsage(750, 1000);
      if (result !== 75) throw new Error(`Expected 75, got ${result}`);
    }
  },

  'calc-007': {
    id: 'calc-007',
    title: 'calculateBudgetUsage - presupuesto cero',
    description: 'Debe retornar 0 cuando el presupuesto es 0',
    category: 'calculations',
    priority: 'medium',
    testFunction: async () => {
      const { calculateBudgetUsage } = await import('../utils/calculations');
      const result = calculateBudgetUsage(500, 0);
      if (result !== 0) throw new Error(`Expected 0, got ${result}`);
    }
  },

  'calc-008': {
    id: 'calc-008',
    title: 'calculateBudgetUsage - sobre presupuesto',
    description: 'Debe calcular correctamente cuando se excede el presupuesto',
    category: 'calculations',
    priority: 'high',
    testFunction: async () => {
      const { calculateBudgetUsage } = await import('../utils/calculations');
      const result = calculateBudgetUsage(1200, 1000);
      if (result !== 120) throw new Error(`Expected 120, got ${result}`);
    }
  },

  'calc-009': {
    id: 'calc-009',
    title: 'getBudgetStatus - safe',
    description: 'Debe retornar "safe" cuando el uso es bajo',
    category: 'calculations',
    priority: 'high',
    testFunction: async () => {
      const { getBudgetStatus } = await import('../utils/calculations');
      const result = getBudgetStatus(500, 1000);
      if (result !== 'safe') throw new Error(`Expected "safe", got "${result}"`);
    }
  },

  'calc-010': {
    id: 'calc-010',
    title: 'getBudgetStatus - warning',
    description: 'Debe retornar "warning" cuando el uso supera el umbral',
    category: 'calculations',
    priority: 'high',
    testFunction: async () => {
      const { getBudgetStatus } = await import('../utils/calculations');
      const result = getBudgetStatus(850, 1000, 80);
      if (result !== 'warning') throw new Error(`Expected "warning", got "${result}"`);
    }
  },

  'calc-011': {
    id: 'calc-011',
    title: 'getBudgetStatus - danger',
    description: 'Debe retornar "danger" cuando se excede el presupuesto',
    category: 'calculations',
    priority: 'high',
    testFunction: async () => {
      const { getBudgetStatus } = await import('../utils/calculations');
      const result = getBudgetStatus(1200, 1000);
      if (result !== 'danger') throw new Error(`Expected "danger", got "${result}"`);
    }
  },

  'calc-012': {
    id: 'calc-012',
    title: 'calculatePercentageChange - aumento',
    description: 'Debe calcular correctamente el cambio porcentual positivo',
    category: 'calculations',
    priority: 'medium',
    testFunction: async () => {
      const { calculatePercentageChange } = await import('../utils/calculations');
      const result = calculatePercentageChange(150, 100);
      if (result !== 50) throw new Error(`Expected 50, got ${result}`);
    }
  },

  'calc-013': {
    id: 'calc-013',
    title: 'calculatePercentageChange - disminución',
    description: 'Debe calcular correctamente el cambio porcentual negativo',
    category: 'calculations',
    priority: 'medium',
    testFunction: async () => {
      const { calculatePercentageChange } = await import('../utils/calculations');
      const result = calculatePercentageChange(50, 100);
      if (result !== -50) throw new Error(`Expected -50, got ${result}`);
    }
  },

  'calc-014': {
    id: 'calc-014',
    title: 'calculatePercentageChange - desde cero',
    description: 'Debe manejar correctamente cambio desde valor anterior 0',
    category: 'calculations',
    priority: 'medium',
    testFunction: async () => {
      const { calculatePercentageChange } = await import('../utils/calculations');
      const result = calculatePercentageChange(100, 0);
      if (result !== 100) throw new Error(`Expected 100, got ${result}`);
    }
  },

  'calc-015': {
    id: 'calc-015',
    title: 'calculateSavingsRate - con ahorro',
    description: 'Debe calcular tasa de ahorro correctamente',
    category: 'calculations',
    priority: 'high',
    testFunction: async () => {
      const { calculateSavingsRate } = await import('../utils/calculations');
      const transactions = [
        { id: '1', type: 'income' as const, amount: 1000, date: '2026-01-01', description: 'Salario', account: 'acc1' },
        { id: '2', type: 'expense' as const, amount: 700, date: '2026-01-02', description: 'Gastos', account: 'acc1' },
      ];
      const result = calculateSavingsRate(transactions);
      if (result !== 30) throw new Error(`Expected 30, got ${result}`);
    }
  },

  'calc-016': {
    id: 'calc-016',
    title: 'calculateSavingsRate - sin ingresos',
    description: 'Debe retornar 0 cuando no hay ingresos',
    category: 'calculations',
    priority: 'medium',
    testFunction: async () => {
      const { calculateSavingsRate } = await import('../utils/calculations');
      const transactions = [
        { id: '1', type: 'expense' as const, amount: 500, date: '2026-01-01', description: 'Gastos', account: 'acc1' },
      ];
      const result = calculateSavingsRate(transactions);
      if (result !== 0) throw new Error(`Expected 0, got ${result}`);
    }
  },

  'calc-017': {
    id: 'calc-017',
    title: 'calculateMonthlyAverage - promedio válido',
    description: 'Debe calcular promedio mensual de gastos',
    category: 'calculations',
    priority: 'medium',
    testFunction: async () => {
      const { calculateMonthlyAverage } = await import('../utils/calculations');
      const transactions = [
        { id: '1', type: 'expense' as const, amount: 600, date: '2026-01-01', description: 'Gastos', account: 'acc1' },
      ];
      const result = calculateMonthlyAverage(transactions, 3);
      if (result !== 200) throw new Error(`Expected 200, got ${result}`);
    }
  },

  'calc-018': {
    id: 'calc-018',
    title: 'calculateMonthlyAverage - meses cero',
    description: 'Debe retornar 0 cuando meses es 0',
    category: 'calculations',
    priority: 'low',
    testFunction: async () => {
      const { calculateMonthlyAverage } = await import('../utils/calculations');
      const transactions = [
        { id: '1', type: 'expense' as const, amount: 600, date: '2026-01-01', description: 'Gastos', account: 'acc1' },
      ];
      const result = calculateMonthlyAverage(transactions, 0);
      if (result !== 0) throw new Error(`Expected 0, got ${result}`);
    }
  },

  'calc-019': {
    id: 'calc-019',
    title: 'calculateCategorySpending - categoría específica',
    description: 'Debe sumar gastos de una categoría específica',
    category: 'calculations',
    priority: 'high',
    testFunction: async () => {
      const { calculateCategorySpending } = await import('../utils/calculations');
      const transactions = [
        { id: '1', type: 'expense' as const, amount: 200, date: '2026-01-01', description: 'Comida', account: 'acc1', category: 'cat-food' },
        { id: '2', type: 'expense' as const, amount: 150, date: '2026-01-02', description: 'Restaurante', account: 'acc1', category: 'cat-food' },
        { id: '3', type: 'expense' as const, amount: 100, date: '2026-01-03', description: 'Transporte', account: 'acc1', category: 'cat-transport' },
      ];
      const result = calculateCategorySpending(transactions, 'cat-food');
      if (result !== 350) throw new Error(`Expected 350, got ${result}`);
    }
  },

  'calc-020': {
    id: 'calc-020',
    title: 'calculateCategorySpending - categoría sin gastos',
    description: 'Debe retornar 0 cuando la categoría no tiene gastos',
    category: 'calculations',
    priority: 'medium',
    testFunction: async () => {
      const { calculateCategorySpending } = await import('../utils/calculations');
      const transactions = [
        { id: '1', type: 'expense' as const, amount: 200, date: '2026-01-01', description: 'Comida', account: 'acc1', category: 'cat-food' },
      ];
      const result = calculateCategorySpending(transactions, 'cat-nonexistent');
      if (result !== 0) throw new Error(`Expected 0, got ${result}`);
    }
  },
};

// ===========================
// FORMATTING TESTS (15 tests)
// ===========================

export const FORMATTING_TESTS: Record<string, UnitTestCase> = {
  'format-001': {
    id: 'format-001',
    title: 'formatCurrency - COP',
    description: 'Debe formatear moneda colombiana correctamente',
    category: 'formatting',
    priority: 'high',
    testFunction: async () => {
      const { formatCurrency } = await import('../utils/formatting');
      const result = formatCurrency(1000);
      // Verificar que contiene el número formateado
      if (!result.includes('1') || !result.includes('000')) {
        throw new Error(`Expected currency format with 1000, got "${result}"`);
      }
    }
  },

  'format-002': {
    id: 'format-002',
    title: 'formatCurrency - cero',
    description: 'Debe formatear cero correctamente',
    category: 'formatting',
    priority: 'medium',
    testFunction: async () => {
      const { formatCurrency } = await import('../utils/formatting');
      const result = formatCurrency(0);
      if (!result.includes('0')) {
        throw new Error(`Expected "0" in result, got "${result}"`);
      }
    }
  },

  'format-003': {
    id: 'format-003',
    title: 'formatNumber - miles',
    description: 'Debe formatear números con separador de miles',
    category: 'formatting',
    priority: 'high',
    testFunction: async () => {
      const { formatNumber } = await import('../utils/formatting');
      const result = formatNumber(1000000);
      // Verificar separador (puede ser . o , dependiendo del locale)
      if (!result.includes('1') || result.length < 7) {
        throw new Error(`Expected formatted number, got "${result}"`);
      }
    }
  },

  'format-004': {
    id: 'format-004',
    title: 'formatPercentage - sin decimales',
    description: 'Debe formatear porcentaje sin decimales',
    category: 'formatting',
    priority: 'medium',
    testFunction: async () => {
      const { formatPercentage } = await import('../utils/formatting');
      const result = formatPercentage(75.5);
      if (result !== '76%') throw new Error(`Expected "76%", got "${result}"`);
    }
  },

  'format-005': {
    id: 'format-005',
    title: 'formatPercentage - con decimales',
    description: 'Debe formatear porcentaje con decimales',
    category: 'formatting',
    priority: 'medium',
    testFunction: async () => {
      const { formatPercentage } = await import('../utils/formatting');
      const result = formatPercentage(75.5, 1);
      if (result !== '75.5%') throw new Error(`Expected "75.5%", got "${result}"`);
    }
  },

  'format-006': {
    id: 'format-006',
    title: 'formatFileSize - bytes',
    description: 'Debe formatear tamaño en bytes',
    category: 'formatting',
    priority: 'low',
    testFunction: async () => {
      const { formatFileSize } = await import('../utils/formatting');
      const result = formatFileSize(500);
      if (result !== '500 Bytes') throw new Error(`Expected "500 Bytes", got "${result}"`);
    }
  },

  'format-007': {
    id: 'format-007',
    title: 'formatFileSize - kilobytes',
    description: 'Debe formatear tamaño en KB',
    category: 'formatting',
    priority: 'low',
    testFunction: async () => {
      const { formatFileSize } = await import('../utils/formatting');
      const result = formatFileSize(2048);
      if (result !== '2 KB') throw new Error(`Expected "2 KB", got "${result}"`);
    }
  },

  'format-008': {
    id: 'format-008',
    title: 'formatFileSize - megabytes',
    description: 'Debe formatear tamaño en MB',
    category: 'formatting',
    priority: 'low',
    testFunction: async () => {
      const { formatFileSize } = await import('../utils/formatting');
      const result = formatFileSize(1048576);
      if (result !== '1 MB') throw new Error(`Expected "1 MB", got "${result}"`);
    }
  },

  'format-009': {
    id: 'format-009',
    title: 'compactNumber - menos de mil',
    description: 'Debe mantener número sin cambios cuando < 1000',
    category: 'formatting',
    priority: 'medium',
    testFunction: async () => {
      const { compactNumber } = await import('../utils/formatting');
      const result = compactNumber(500);
      if (result !== '500') throw new Error(`Expected "500", got "${result}"`);
    }
  },

  'format-010': {
    id: 'format-010',
    title: 'compactNumber - miles',
    description: 'Debe compactar miles con sufijo K',
    category: 'formatting',
    priority: 'medium',
    testFunction: async () => {
      const { compactNumber } = await import('../utils/formatting');
      const result = compactNumber(1500);
      if (result !== '1.5K') throw new Error(`Expected "1.5K", got "${result}"`);
    }
  },

  'format-011': {
    id: 'format-011',
    title: 'compactNumber - millones',
    description: 'Debe compactar millones con sufijo M',
    category: 'formatting',
    priority: 'medium',
    testFunction: async () => {
      const { compactNumber } = await import('../utils/formatting');
      const result = compactNumber(2500000);
      if (result !== '2.5M') throw new Error(`Expected "2.5M", got "${result}"`);
    }
  },

  'format-012': {
    id: 'format-012',
    title: 'truncateText - texto corto',
    description: 'Debe mantener texto cuando es menor al límite',
    category: 'formatting',
    priority: 'low',
    testFunction: async () => {
      const { truncateText } = await import('../utils/formatting');
      const result = truncateText('Hola', 10);
      if (result !== 'Hola') throw new Error(`Expected "Hola", got "${result}"`);
    }
  },

  'format-013': {
    id: 'format-013',
    title: 'truncateText - texto largo',
    description: 'Debe truncar texto largo con ellipsis',
    category: 'formatting',
    priority: 'low',
    testFunction: async () => {
      const { truncateText } = await import('../utils/formatting');
      const result = truncateText('Este es un texto muy largo', 10);
      if (result !== 'Este es...') throw new Error(`Expected "Este es...", got "${result}"`);
    }
  },

  'format-014': {
    id: 'format-014',
    title: 'formatTransactionType - income',
    description: 'Debe traducir tipo de transacción: income',
    category: 'formatting',
    priority: 'high',
    testFunction: async () => {
      const { formatTransactionType } = await import('../utils/formatting');
      const result = formatTransactionType('income');
      if (result !== 'Ingreso') throw new Error(`Expected "Ingreso", got "${result}"`);
    }
  },

  'format-015': {
    id: 'format-015',
    title: 'formatTransactionType - expense',
    description: 'Debe traducir tipo de transacción: expense',
    category: 'formatting',
    priority: 'high',
    testFunction: async () => {
      const { formatTransactionType } = await import('../utils/formatting');
      const result = formatTransactionType('expense');
      if (result !== 'Gasto') throw new Error(`Expected "Gasto", got "${result}"`);
    }
  },
};

// ===========================
// VALIDATION TESTS (10 tests)
// ===========================

export const VALIDATION_TESTS: Record<string, UnitTestCase> = {
  'valid-001': {
    id: 'valid-001',
    title: 'isValidUUID - UUID válido',
    description: 'Debe aceptar UUID válido',
    category: 'validation',
    priority: 'high',
    testFunction: async () => {
      const { isValidUUID } = await import('../utils/validation');
      const result = isValidUUID('a1b2c3d4-1234-5678-9abc-def012345678');
      if (!result) throw new Error('Expected true for valid UUID');
    }
  },

  'valid-002': {
    id: 'valid-002',
    title: 'isValidUUID - string inválido',
    description: 'Debe rechazar string no-UUID',
    category: 'validation',
    priority: 'high',
    testFunction: async () => {
      const { isValidUUID } = await import('../utils/validation');
      const result = isValidUUID('not-a-uuid');
      if (result) throw new Error('Expected false for invalid UUID');
    }
  },

  'valid-003': {
    id: 'valid-003',
    title: 'isValidUUID - null',
    description: 'Debe rechazar null',
    category: 'validation',
    priority: 'medium',
    testFunction: async () => {
      const { isValidUUID } = await import('../utils/validation');
      const result = isValidUUID(null);
      if (result) throw new Error('Expected false for null');
    }
  },

  'valid-004': {
    id: 'valid-004',
    title: 'isValidAmount - monto válido',
    description: 'Debe aceptar monto dentro del rango',
    category: 'validation',
    priority: 'high',
    testFunction: async () => {
      const { isValidAmount } = await import('../utils/validation');
      const result = isValidAmount(1000.50);
      if (!result) throw new Error('Expected true for valid amount');
    }
  },

  'valid-005': {
    id: 'valid-005',
    title: 'isValidAmount - monto muy grande',
    description: 'Debe rechazar monto fuera del rango DECIMAL(15,2)',
    category: 'validation',
    priority: 'high',
    testFunction: async () => {
      const { isValidAmount } = await import('../utils/validation');
      const result = isValidAmount(99999999999999);
      if (result) throw new Error('Expected false for amount out of range');
    }
  },

  'valid-006': {
    id: 'valid-006',
    title: 'isValidAmount - cero',
    description: 'Debe aceptar monto cero',
    category: 'validation',
    priority: 'medium',
    testFunction: async () => {
      const { isValidAmount } = await import('../utils/validation');
      const result = isValidAmount(0);
      if (!result) throw new Error('Expected true for zero amount');
    }
  },

  'valid-007': {
    id: 'valid-007',
    title: 'isValidAmount - negativo',
    description: 'Debe aceptar monto negativo válido',
    category: 'validation',
    priority: 'medium',
    testFunction: async () => {
      const { isValidAmount } = await import('../utils/validation');
      const result = isValidAmount(-500);
      if (!result) throw new Error('Expected true for valid negative amount');
    }
  },

  'valid-008': {
    id: 'valid-008',
    title: 'validateTransaction - transacción válida',
    description: 'Debe validar transacción correcta',
    category: 'validation',
    priority: 'high',
    testFunction: async () => {
      const { validateTransaction } = await import('../utils/validation');
      const transaction = {
        id: 'a1b2c3d4-1234-5678-9abc-def012345678',
        type: 'expense' as const,
        amount: 100,
        date: '2026-01-01',
        description: 'Test',
        account: 'b1b2c3d4-1234-5678-9abc-def012345678',
        category: 'c1b2c3d4-1234-5678-9abc-def012345678'
      };
      const result = validateTransaction(transaction);
      if (!result.valid) throw new Error(`Expected valid, got error: ${result.error}`);
    }
  },

  'valid-009': {
    id: 'valid-009',
    title: 'validateTransaction - ID inválido',
    description: 'Debe rechazar transacción con ID inválido',
    category: 'validation',
    priority: 'high',
    testFunction: async () => {
      const { validateTransaction } = await import('../utils/validation');
      const transaction = {
        id: 'invalid-id',
        type: 'expense' as const,
        amount: 100,
        date: '2026-01-01',
        description: 'Test',
        account: 'b1b2c3d4-1234-5678-9abc-def012345678'
      };
      const result = validateTransaction(transaction);
      if (result.valid) throw new Error('Expected invalid for bad ID');
    }
  },

  'valid-010': {
    id: 'valid-010',
    title: 'validateTransaction - transferencia sin categoría',
    description: 'Debe aceptar transferencia sin categoría',
    category: 'validation',
    priority: 'high',
    testFunction: async () => {
      const { validateTransaction } = await import('../utils/validation');
      const transaction = {
        id: 'a1b2c3d4-1234-5678-9abc-def012345678',
        type: 'transfer' as const,
        amount: 100,
        date: '2026-01-01',
        description: 'Transfer',
        account: 'b1b2c3d4-1234-5678-9abc-def012345678',
        toAccount: 'c1b2c3d4-1234-5678-9abc-def012345678'
      };
      const result = validateTransaction(transaction);
      if (!result.valid) throw new Error(`Expected valid transfer, got error: ${result.error}`);
    }
  },
};

// ===========================
// UTILITIES TESTS (5 tests)
// ===========================

export const UTILITIES_TESTS: Record<string, UnitTestCase> = {
  'util-001': {
    id: 'util-001',
    title: 'parseLocalDate - fecha válida',
    description: 'Debe parsear fecha YYYY-MM-DD correctamente',
    category: 'utilities',
    priority: 'high',
    testFunction: async () => {
      const { parseLocalDate } = await import('../utils/dateUtils');
      const result = parseLocalDate('2026-01-15');
      if (result.getFullYear() !== 2026) throw new Error('Expected year 2026');
      if (result.getMonth() !== 0) throw new Error('Expected month January (0)');
      if (result.getDate() !== 15) throw new Error('Expected day 15');
    }
  },

  'util-002': {
    id: 'util-002',
    title: 'formatLocalDate - fecha a string localizado',
    description: 'Debe formatear Date a formato local español',
    category: 'utilities',
    priority: 'high',
    testFunction: async () => {
      const { formatLocalDate } = await import('../utils/dateUtils');
      const date = new Date(2026, 0, 15); // Enero 15, 2026
      const result = formatLocalDate(date);
      // formatLocalDate devuelve formato localizado español (ej: "15/1/2026")
      if (!result.includes('15')) throw new Error(`Expected to contain "15", got "${result}"`);
      if (!result.includes('2026')) throw new Error(`Expected to contain "2026", got "${result}"`);
    }
  },

  'util-003': {
    id: 'util-003',
    title: 'getTodayLocalDate - fecha de hoy en Colombia',
    description: 'Debe retornar fecha actual en formato YYYY-MM-DD',
    category: 'utilities',
    priority: 'medium',
    testFunction: async () => {
      const { getTodayLocalDate } = await import('../utils/dateUtils');
      const result = getTodayLocalDate();
      // Verificar formato YYYY-MM-DD
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(result)) throw new Error(`Expected YYYY-MM-DD format, got "${result}"`);
    }
  },

  'util-004': {
    id: 'util-004',
    title: 'getColombiaTime - obtener hora de Colombia',
    description: 'Debe retornar Date object con hora de Colombia',
    category: 'utilities',
    priority: 'medium',
    testFunction: async () => {
      const { getColombiaTime } = await import('../utils/dateUtils');
      const result = getColombiaTime();
      if (!(result instanceof Date)) throw new Error('Expected Date object');
      if (isNaN(result.getTime())) throw new Error('Invalid Date object');
    }
  },

  'util-005': {
    id: 'util-005',
    title: 'formatDistanceToNow - tiempo relativo',
    description: 'Debe formatear tiempo relativo (ej: "Hace 5 min")',
    category: 'utilities',
    priority: 'low',
    testFunction: async () => {
      const { formatDistanceToNow } = await import('../utils/dateUtils');
      // Fecha de hace 2 minutos
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const result = formatDistanceToNow(twoMinutesAgo);
      // Debe incluir "Hace" o "min"
      if (!result.includes('Hace') && !result.includes('min') && result !== 'Ahora') {
        throw new Error(`Expected relative time format, got "${result}"`);
      }
    }
  },
};

// ===========================
// CONSOLIDACIÓN
// ===========================

export const UNIT_TEST_CASES: Record<string, UnitTestCase> = {
  ...CALCULATION_TESTS,
  ...FORMATTING_TESTS,
  ...VALIDATION_TESTS,
  ...UTILITIES_TESTS,
};

export function getUnitTestStats() {
  const tests = Object.values(UNIT_TEST_CASES);
  
  return {
    total: tests.length,
    byCategory: {
      calculations: tests.filter(t => t.category === 'calculations').length,
      formatting: tests.filter(t => t.category === 'formatting').length,
      validation: tests.filter(t => t.category === 'validation').length,
      utilities: tests.filter(t => t.category === 'utilities').length,
    },
    byPriority: {
      high: tests.filter(t => t.priority === 'high').length,
      medium: tests.filter(t => t.priority === 'medium').length,
      low: tests.filter(t => t.priority === 'low').length,
    }
  };
}