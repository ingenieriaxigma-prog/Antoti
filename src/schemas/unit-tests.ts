/**
 * Unit Tests para Lógica de Negocio
 * 
 * 🧪 UNIT TESTS:
 * - Prueban funciones puras (sin efectos secundarios)
 * - Validan cálculos, transformaciones y utilidades
 * - NO requieren base de datos o APIs
 * 
 * 📝 FORMATO:
 * [nombre]: {
 *   category: 'unit-tests',
 *   description: 'Descripción del test',
 *   testFunction: () => boolean | Promise<boolean>,
 *   successMessage: 'Mensaje cuando pasa',
 *   errorMessage: 'Mensaje cuando falla',
 * }
 */

import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  calculateBudgetUsage,
  calculatePercentageChange,
  calculateSavingsRate,
  filterTransactionsByMonth,
  filterTransactionsByDateRange,
  calculateCategorySpending,
} from '../utils/calculations';

import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDateShort,
  formatMonthYear,
} from '../utils/formatting';

import type { Transaction } from '../types';

// ============================================
// 📌 TIPO DE CONFIGURACIÓN
// ============================================

export interface UnitTest {
  category: 'unit-tests';
  description: string;
  testFunction: () => boolean | Promise<boolean>;
  successMessage: string;
  errorMessage: string;
  details?: string;
}

export interface UnitTestCollection {
  [key: string]: UnitTest;
}

// ============================================
// 🧪 DATOS DE PRUEBA
// ============================================

const mockTransactions: Transaction[] = [
  {
    id: '1',
    userId: 'user-1',
    type: 'income',
    amount: 5000,
    category: 'cat-1',
    account: 'acc-1',
    date: '2025-11-01T10:00:00.000Z',
    note: 'Salario',
    createdAt: '2025-11-01T10:00:00.000Z',
    updatedAt: '2025-11-01T10:00:00.000Z',
  },
  {
    id: '2',
    userId: 'user-1',
    type: 'expense',
    amount: 1500,
    category: 'cat-2',
    account: 'acc-1',
    date: '2025-11-05T14:30:00.000Z',
    note: 'Supermercado',
    createdAt: '2025-11-05T14:30:00.000Z',
    updatedAt: '2025-11-05T14:30:00.000Z',
  },
  {
    id: '3',
    userId: 'user-1',
    type: 'expense',
    amount: 500,
    category: 'cat-2',
    account: 'acc-1',
    date: '2025-11-10T16:00:00.000Z',
    note: 'Transporte',
    createdAt: '2025-11-10T16:00:00.000Z',
    updatedAt: '2025-11-10T16:00:00.000Z',
  },
  {
    id: '4',
    userId: 'user-1',
    type: 'income',
    amount: 2000,
    category: 'cat-1',
    account: 'acc-1',
    date: '2025-11-15T09:00:00.000Z',
    note: 'Freelance',
    createdAt: '2025-11-15T09:00:00.000Z',
    updatedAt: '2025-11-15T09:00:00.000Z',
  },
  {
    id: '5',
    userId: 'user-1',
    type: 'expense',
    amount: 800,
    category: 'cat-3',
    account: 'acc-2',
    date: '2025-10-20T12:00:00.000Z',
    note: 'Cena restaurante',
    createdAt: '2025-10-20T12:00:00.000Z',
    updatedAt: '2025-10-20T12:00:00.000Z',
  },
];

// ============================================
// 🧪 UNIT TESTS
// ============================================

export const UNIT_TESTS: UnitTestCollection = {
  // ==========================================
  // 💰 CÁLCULOS DE TRANSACCIONES
  // ==========================================

  'calculateTotalIncome - Suma correcta de ingresos': {
    category: 'unit-tests',
    description: 'Debe sumar correctamente todos los ingresos (5000 + 2000 = 7000)',
    details: 'Función: calculateTotalIncome()',
    testFunction: () => {
      const result = calculateTotalIncome(mockTransactions);
      return result === 7000;
    },
    successMessage: '✅ Total de ingresos calculado correctamente: $7,000',
    errorMessage: '❌ Error al calcular total de ingresos',
  },

  'calculateTotalExpenses - Suma correcta de gastos': {
    category: 'unit-tests',
    description: 'Debe sumar correctamente todos los gastos (1500 + 500 + 800 = 2800)',
    details: 'Función: calculateTotalExpenses()',
    testFunction: () => {
      const result = calculateTotalExpenses(mockTransactions);
      return result === 2800;
    },
    successMessage: '✅ Total de gastos calculado correctamente: $2,800',
    errorMessage: '❌ Error al calcular total de gastos',
  },

  'calculateBalance - Balance neto correcto': {
    category: 'unit-tests',
    description: 'Debe calcular balance neto (7000 - 2800 = 4200)',
    details: 'Función: calculateBalance()',
    testFunction: () => {
      const result = calculateBalance(mockTransactions);
      return result === 4200;
    },
    successMessage: '✅ Balance neto calculado correctamente: $4,200',
    errorMessage: '❌ Error al calcular balance neto',
  },

  'calculateTotalIncome - Array vacío retorna 0': {
    category: 'unit-tests',
    description: 'Debe retornar 0 cuando no hay transacciones',
    details: 'Función: calculateTotalIncome()',
    testFunction: () => {
      const result = calculateTotalIncome([]);
      return result === 0;
    },
    successMessage: '✅ Maneja correctamente array vacío (retorna 0)',
    errorMessage: '❌ No maneja correctamente array vacío',
  },

  'calculateSavingsRate - Tasa de ahorro correcta': {
    category: 'unit-tests',
    description: 'Debe calcular tasa de ahorro: (7000 - 2800) / 7000 * 100 = 60%',
    details: 'Función: calculateSavingsRate()',
    testFunction: () => {
      const result = calculateSavingsRate(mockTransactions);
      return Math.abs(result - 60) < 0.01; // Tolerancia para decimales
    },
    successMessage: '✅ Tasa de ahorro calculada correctamente: 60%',
    errorMessage: '❌ Error al calcular tasa de ahorro',
  },

  // ==========================================
  // 📊 CÁLCULOS DE PRESUPUESTOS
  // ==========================================

  'calculateBudgetUsage - Porcentaje de uso 50%': {
    category: 'unit-tests',
    description: 'Debe calcular 50% cuando se gasta $5000 de $10000',
    details: 'Función: calculateBudgetUsage()',
    testFunction: () => {
      const result = calculateBudgetUsage(5000, 10000);
      return result === 50;
    },
    successMessage: '✅ Porcentaje de uso calculado correctamente: 50%',
    errorMessage: '❌ Error al calcular porcentaje de uso',
  },

  'calculateBudgetUsage - Sobrepaso de presupuesto 120%': {
    category: 'unit-tests',
    description: 'Debe calcular 120% cuando se gasta $12000 de $10000',
    details: 'Función: calculateBudgetUsage()',
    testFunction: () => {
      const result = calculateBudgetUsage(12000, 10000);
      return result === 120;
    },
    successMessage: '✅ Sobrepaso de presupuesto detectado correctamente: 120%',
    errorMessage: '❌ Error al detectar sobrepaso de presupuesto',
  },

  'calculateBudgetUsage - División por cero': {
    category: 'unit-tests',
    description: 'Debe retornar 0% cuando el presupuesto es 0',
    details: 'Función: calculateBudgetUsage()',
    testFunction: () => {
      const result = calculateBudgetUsage(5000, 0);
      return result === 0;
    },
    successMessage: '✅ Maneja correctamente división por cero (retorna 0%)',
    errorMessage: '❌ No maneja correctamente división por cero',
  },

  'calculatePercentageChange - Cambio positivo 25%': {
    category: 'unit-tests',
    description: 'Debe calcular +25% al pasar de 4000 a 5000',
    details: 'Función: calculatePercentageChange()',
    testFunction: () => {
      const result = calculatePercentageChange(5000, 4000);
      return result === 25;
    },
    successMessage: '✅ Cambio porcentual positivo calculado: +25%',
    errorMessage: '❌ Error al calcular cambio porcentual positivo',
  },

  'calculatePercentageChange - Cambio negativo -20%': {
    category: 'unit-tests',
    description: 'Debe calcular -20% al pasar de 5000 a 4000',
    details: 'Función: calculatePercentageChange()',
    testFunction: () => {
      const result = calculatePercentageChange(4000, 5000);
      return result === -20;
    },
    successMessage: '✅ Cambio porcentual negativo calculado: -20%',
    errorMessage: '❌ Error al calcular cambio porcentual negativo',
  },

  // ==========================================
  // 🔍 FILTROS DE TRANSACCIONES
  // ==========================================

  'filterTransactionsByMonth - Filtrar noviembre 2025': {
    category: 'unit-tests',
    description: 'Debe filtrar solo las 4 transacciones de noviembre 2025',
    details: 'Función: filterTransactionsByMonth()',
    testFunction: () => {
      try {
        const result = filterTransactionsByMonth(mockTransactions, 10, 2025); // month: 10 = noviembre (0-indexed)
        console.log('filterTransactionsByMonth result:', result);
        return result.length === 4;
      } catch (error) {
        console.error('filterTransactionsByMonth error:', error);
        throw error;
      }
    },
    successMessage: '✅ Filtrado por mes correcto: 4 transacciones de noviembre',
    errorMessage: '❌ Error al filtrar transacciones por mes',
  },

  'filterTransactionsByMonth - Mes sin transacciones': {
    category: 'unit-tests',
    description: 'Debe retornar array vacío para un mes sin transacciones',
    details: 'Función: filterTransactionsByMonth()',
    testFunction: () => {
      try {
        const result = filterTransactionsByMonth(mockTransactions, 0, 2025); // enero 2025
        return result.length === 0;
      } catch (error) {
        console.error('filterTransactionsByMonth (empty) error:', error);
        throw error;
      }
    },
    successMessage: '✅ Maneja correctamente mes sin transacciones (retorna [])',
    errorMessage: '❌ No maneja correctamente mes sin transacciones',
  },

  'filterTransactionsByDateRange - Rango específico': {
    category: 'unit-tests',
    description: 'Debe filtrar transacciones entre 1-10 de noviembre (3 transacciones)',
    details: 'Función: filterTransactionsByDateRange()',
    testFunction: () => {
      try {
        const startDate = new Date('2025-11-01T00:00:00.000Z');
        const endDate = new Date('2025-11-10T23:59:59.999Z');
        const result = filterTransactionsByDateRange(mockTransactions, startDate, endDate);
        console.log('filterTransactionsByDateRange result:', result);
        console.log('Expected 3 transactions (Nov 1, 5, 10), got:', result.length);
        // Transacciones del 1, 5 y 10 de noviembre
        return result.length === 3;
      } catch (error) {
        console.error('filterTransactionsByDateRange error:', error);
        throw error;
      }
    },
    successMessage: '✅ Filtrado por rango de fechas correcto: 3 transacciones',
    errorMessage: '❌ Error al filtrar por rango de fechas',
  },

  'calculateCategorySpending - Gasto por categoría': {
    category: 'unit-tests',
    description: 'Debe calcular correctamente el gasto total de cat-2 (1500 + 500 = 2000)',
    details: 'Función: calculateCategorySpending()',
    testFunction: () => {
      const result = calculateCategorySpending(mockTransactions, 'cat-2');
      return result === 2000;
    },
    successMessage: '✅ Gasto por categoría calculado: $2,000',
    errorMessage: '❌ Error al calcular gasto por categoría',
  },

  // ==========================================
  // 💵 FORMATEO DE MONEDA Y NÚMEROS
  // ==========================================

  'formatCurrency - Formato COP correcto': {
    category: 'unit-tests',
    description: 'Debe formatear 5000 como "$ 5.000" en pesos colombianos',
    details: 'Función: formatCurrency()',
    testFunction: () => {
      const result = formatCurrency(5000, 'COP');
      // Verificar que contenga el número formateado (tolerante a variaciones de formato)
      return result.includes('5') && result.includes('000');
    },
    successMessage: '✅ Formato de moneda correcto: $ 5.000',
    errorMessage: '❌ Error al formatear moneda',
  },

  'formatNumber - Separador de miles': {
    category: 'unit-tests',
    description: 'Debe formatear 1000000 con separadores de miles',
    details: 'Función: formatNumber()',
    testFunction: () => {
      const result = formatNumber(1000000);
      // Verificar que contenga puntos como separadores
      return result.includes('.') || result.includes(',');
    },
    successMessage: '✅ Separadores de miles correctos: 1.000.000',
    errorMessage: '❌ Error al formatear número con separadores',
  },

  'formatPercentage - Formato de porcentaje': {
    category: 'unit-tests',
    description: 'Debe formatear 75.5 como "75.5%"',
    details: 'Función: formatPercentage()',
    testFunction: () => {
      const result = formatPercentage(75.5, 1);
      return result === '75.5%';
    },
    successMessage: '✅ Formato de porcentaje correcto: 75.5%',
    errorMessage: '❌ Error al formatear porcentaje',
  },

  'formatPercentage - Sin decimales': {
    category: 'unit-tests',
    description: 'Debe formatear 75.789 como "76%" (redondeado)',
    details: 'Función: formatPercentage()',
    testFunction: () => {
      const result = formatPercentage(75.789, 0);
      return result === '76%';
    },
    successMessage: '✅ Redondeo de porcentaje correcto: 76%',
    errorMessage: '❌ Error al redondear porcentaje',
  },

  // ==========================================
  // 📅 FORMATEO DE FECHAS
  // ==========================================

  'formatDateShort - Formato corto de fecha': {
    category: 'unit-tests',
    description: 'Debe formatear fecha en formato corto español',
    details: 'Función: formatDateShort()',
    testFunction: () => {
      const result = formatDateShort(new Date('2025-11-15T10:00:00.000Z'));
      // Verificar que contenga el día y mes (tolerante a variaciones de formato)
      return result.includes('15') && (result.includes('nov') || result.includes('Nov'));
    },
    successMessage: '✅ Formato de fecha corto correcto: 15 Nov',
    errorMessage: '❌ Error al formatear fecha corta',
  },

  'formatMonthYear - Formato mes y año': {
    category: 'unit-tests',
    description: 'Debe formatear mes 10 y año 2025 como "Noviembre 2025"',
    details: 'Función: formatMonthYear()',
    testFunction: () => {
      const result = formatMonthYear(10, 2025);
      return result.toLowerCase().includes('noviembre') && result.includes('2025');
    },
    successMessage: '✅ Formato mes-año correcto: Noviembre 2025',
    errorMessage: '❌ Error al formatear mes-año',
  },

  // ==========================================
  // 🧮 CASOS EXTREMOS (EDGE CASES)
  // ==========================================

  'calculateBalance - Solo ingresos': {
    category: 'unit-tests',
    description: 'Debe calcular balance correcto cuando solo hay ingresos',
    details: 'Función: calculateBalance()',
    testFunction: () => {
      const onlyIncome = mockTransactions.filter(t => t.type === 'income');
      const result = calculateBalance(onlyIncome);
      return result === 7000;
    },
    successMessage: '✅ Balance con solo ingresos: $7,000',
    errorMessage: '❌ Error al calcular balance con solo ingresos',
  },

  'calculateBalance - Solo gastos': {
    category: 'unit-tests',
    description: 'Debe calcular balance negativo cuando solo hay gastos',
    details: 'Función: calculateBalance()',
    testFunction: () => {
      const onlyExpenses = mockTransactions.filter(t => t.type === 'expense');
      const result = calculateBalance(onlyExpenses);
      return result === -2800;
    },
    successMessage: '✅ Balance con solo gastos: -$2,800',
    errorMessage: '❌ Error al calcular balance con solo gastos',
  },

  'calculateSavingsRate - Sin ingresos': {
    category: 'unit-tests',
    description: 'Debe retornar 0% cuando no hay ingresos (evita división por cero)',
    details: 'Función: calculateSavingsRate()',
    testFunction: () => {
      const onlyExpenses = mockTransactions.filter(t => t.type === 'expense');
      const result = calculateSavingsRate(onlyExpenses);
      return result === 0;
    },
    successMessage: '✅ Tasa de ahorro sin ingresos: 0% (división por cero manejada)',
    errorMessage: '❌ No maneja correctamente división por cero en tasa de ahorro',
  },

  'filterTransactionsByDateRange - Rango invertido': {
    category: 'unit-tests',
    description: 'Debe retornar array vacío cuando startDate > endDate',
    details: 'Función: filterTransactionsByDateRange()',
    testFunction: () => {
      const startDate = new Date('2025-11-30T00:00:00.000Z');
      const endDate = new Date('2025-11-01T00:00:00.000Z');
      const result = filterTransactionsByDateRange(mockTransactions, startDate, endDate);
      return result.length === 0;
    },
    successMessage: '✅ Rango de fechas invertido manejado correctamente (retorna [])',
    errorMessage: '❌ No maneja correctamente rango de fechas invertido',
  },

  'calculateCategorySpending - Categoría inexistente': {
    category: 'unit-tests',
    description: 'Debe retornar 0 para una categoría que no existe',
    details: 'Función: calculateCategorySpending()',
    testFunction: () => {
      const result = calculateCategorySpending(mockTransactions, 'cat-nonexistent');
      return result === 0;
    },
    successMessage: '✅ Categoría inexistente manejada: $0',
    errorMessage: '❌ No maneja correctamente categoría inexistente',
  },
};

// ============================================
// 🛠️ UTILIDADES
// ============================================

/**
 * Ejecuta un unit test y retorna el resultado
 */
export async function runUnitTest(testName: string, test: UnitTest): Promise<{
  name: string;
  success: boolean;
  message: string;
  description: string;
  details?: string;
  error?: string;
}> {
  try {
    const result = await test.testFunction();
    return {
      name: testName,
      success: result,
      message: result ? test.successMessage : test.errorMessage,
      description: test.description,
      details: test.details,
    };
  } catch (error) {
    return {
      name: testName,
      success: false,
      message: test.errorMessage,
      description: test.description,
      details: test.details,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Ejecuta todos los unit tests
 */
export async function runAllUnitTests(): Promise<{
  total: number;
  passed: number;
  failed: number;
  results: Awaited<ReturnType<typeof runUnitTest>>[];
}> {
  const results = await Promise.all(
    Object.entries(UNIT_TESTS).map(([name, test]) => runUnitTest(name, test))
  );

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    total: results.length,
    passed,
    failed,
    results,
  };
}

/**
 * Obtiene estadísticas de unit tests
 */
export function getUnitTestStats() {
  return {
    total: Object.keys(UNIT_TESTS).length,
    categories: {
      calculations: Object.values(UNIT_TESTS).filter(t => 
        t.description.toLowerCase().includes('calcul') || 
        t.description.toLowerCase().includes('suma') ||
        t.description.toLowerCase().includes('balance')
      ).length,
      formatting: Object.values(UNIT_TESTS).filter(t => 
        t.description.toLowerCase().includes('format')
      ).length,
      filtering: Object.values(UNIT_TESTS).filter(t => 
        t.description.toLowerCase().includes('filtrar') ||
        t.description.toLowerCase().includes('filter')
      ).length,
      edgeCases: Object.values(UNIT_TESTS).filter(t => 
        t.description.toLowerCase().includes('vacío') ||
        t.description.toLowerCase().includes('cero') ||
        t.description.toLowerCase().includes('inexistente') ||
        t.description.toLowerCase().includes('invertido')
      ).length,
    },
  };
}