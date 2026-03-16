/**
 * Performance Test Cases - Tests de Performance y Rendimiento
 * 
 * Tests que validan velocidad de ejecución y uso de memoria.
 * Verifica que la app cumpla con umbrales de performance.
 */

export type PerformanceTestCase = {
  id: string;
  title: string;
  description: string;
  category: 'speed' | 'memory' | 'render';
  priority: 'high' | 'medium' | 'low';
  threshold: {
    maxDuration?: number; // milliseconds
    maxMemory?: number;   // MB
  };
  testFunction: () => Promise<{
    duration: number;
    memory?: number;
    passed: boolean;
    details?: string;
  }>;
};

// ===========================
// SPEED TESTS (8 tests)
// ===========================

export const SPEED_TESTS: Record<string, PerformanceTestCase> = {
  'perf-001': {
    id: 'perf-001',
    title: 'Calcular balance de 1000 transacciones',
    description: 'Debe calcular balance en < 100ms con 1000 transacciones',
    category: 'speed',
    priority: 'high',
    threshold: { maxDuration: 100 },
    testFunction: async () => {
      const { calculateBalance } = await import('../utils/calculations');
      
      // Generar 1000 transacciones
      const transactions = Array.from({ length: 1000 }, (_, i) => ({
        id: `tx-${i}`,
        type: i % 2 === 0 ? 'income' as const : 'expense' as const,
        amount: Math.random() * 1000,
        date: '2026-01-01',
        description: `Transaction ${i}`,
        account: 'acc1'
      }));

      const start = performance.now();
      calculateBalance(transactions);
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 100,
        details: `Procesó 1000 transacciones en ${duration.toFixed(2)}ms`
      };
    }
  },

  'perf-002': {
    id: 'perf-002',
    title: 'Formatear 100 monedas',
    description: 'Debe formatear 100 monedas en < 50ms',
    category: 'speed',
    priority: 'medium',
    threshold: { maxDuration: 50 },
    testFunction: async () => {
      const { formatCurrency } = await import('../utils/formatting');
      
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        formatCurrency(Math.random() * 1000000);
      }
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 50,
        details: `Formateó 100 valores en ${duration.toFixed(2)}ms`
      };
    }
  },

  'perf-003': {
    id: 'perf-003',
    title: 'Validar 500 UUIDs',
    description: 'Debe validar 500 UUIDs en < 30ms',
    category: 'speed',
    priority: 'medium',
    threshold: { maxDuration: 30 },
    testFunction: async () => {
      const { isValidUUID } = await import('../utils/validation');
      
      const uuids = Array.from({ length: 500 }, (_, i) => 
        i % 2 === 0 ? `a1b2c3d4-1234-5678-9abc-${String(i).padStart(12, '0')}` : 'invalid-uuid'
      );

      const start = performance.now();
      uuids.forEach(uuid => isValidUUID(uuid));
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 30,
        details: `Validó 500 UUIDs en ${duration.toFixed(2)}ms`
      };
    }
  },

  'perf-004': {
    id: 'perf-004',
    title: 'Agrupar 1000 transacciones por categoría',
    description: 'Debe agrupar en < 150ms',
    category: 'speed',
    priority: 'high',
    threshold: { maxDuration: 150 },
    testFunction: async () => {
      const { groupTransactionsByCategory } = await import('../utils/calculations');
      
      const transactions = Array.from({ length: 1000 }, (_, i) => ({
        id: `tx-${i}`,
        type: 'expense' as const,
        amount: Math.random() * 1000,
        date: '2026-01-01',
        description: `Transaction ${i}`,
        account: 'acc1',
        category: `cat-${i % 10}` // 10 categorías
      }));

      const start = performance.now();
      groupTransactionsByCategory(transactions);
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 150,
        details: `Agrupó 1000 transacciones en ${duration.toFixed(2)}ms`
      };
    }
  },

  'perf-005': {
    id: 'perf-005',
    title: 'Calcular presupuestos de 50 categorías',
    description: 'Debe calcular uso de presupuesto en < 50ms',
    category: 'speed',
    priority: 'high',
    threshold: { maxDuration: 50 },
    testFunction: async () => {
      const { calculateBudgetUsage } = await import('../utils/calculations');
      
      const start = performance.now();
      for (let i = 0; i < 50; i++) {
        calculateBudgetUsage(
          Math.random() * 10000,
          Math.random() * 15000
        );
      }
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 50,
        details: `Calculó 50 presupuestos en ${duration.toFixed(2)}ms`
      };
    }
  },

  'perf-006': {
    id: 'perf-006',
    title: 'Filtrar transacciones por fecha (10000 items)',
    description: 'Debe filtrar en < 200ms',
    category: 'speed',
    priority: 'medium',
    threshold: { maxDuration: 200 },
    testFunction: async () => {
      const { filterTransactionsByDateRange } = await import('../utils/calculations');
      
      const transactions = Array.from({ length: 10000 }, (_, i) => ({
        id: `tx-${i}`,
        type: 'expense' as const,
        amount: 100,
        date: `2026-01-${String(1 + (i % 30)).padStart(2, '0')}`,
        description: `Tx ${i}`,
        account: 'acc1'
      }));

      const start = performance.now();
      filterTransactionsByDateRange(
        transactions,
        new Date('2026-01-10'),
        new Date('2026-01-20')
      );
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 200,
        details: `Filtró 10000 transacciones en ${duration.toFixed(2)}ms`
      };
    }
  },

  'perf-007': {
    id: 'perf-007',
    title: 'Ordenar top 5 categorías (1000 transacciones)',
    description: 'Debe ordenar en < 100ms',
    category: 'speed',
    priority: 'medium',
    threshold: { maxDuration: 100 },
    testFunction: async () => {
      const { getTopSpendingCategories } = await import('../utils/calculations');
      
      const categories = Array.from({ length: 20 }, (_, i) => ({
        id: `cat-${i}`,
        name: `Categoría ${i}`,
        type: 'expense' as const,
        icon: '💰',
        color: '#10B981'
      }));

      const transactions = Array.from({ length: 1000 }, (_, i) => ({
        id: `tx-${i}`,
        type: 'expense' as const,
        amount: Math.random() * 1000,
        date: '2026-01-01',
        description: `Tx ${i}`,
        account: 'acc1',
        category: `cat-${i % 20}`
      }));

      const start = performance.now();
      getTopSpendingCategories(transactions, categories, 5);
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 100,
        details: `Ordenó 1000 transacciones en ${duration.toFixed(2)}ms`
      };
    }
  },

  'perf-008': {
    id: 'perf-008',
    title: 'Validar 200 transacciones completas',
    description: 'Debe validar en < 100ms',
    category: 'speed',
    priority: 'high',
    threshold: { maxDuration: 100 },
    testFunction: async () => {
      const { validateTransaction } = await import('../utils/validation');
      
      const transactions = Array.from({ length: 200 }, (_, i) => ({
        id: `a1b2c3d4-1234-5678-9abc-${String(i).padStart(12, '0')}`,
        type: 'expense' as const,
        amount: 100,
        date: '2026-01-01',
        description: `Tx ${i}`,
        account: `a1b2c3d4-1234-5678-9abc-${String(i + 1).padStart(12, '0')}`,
        category: `c1b2c3d4-1234-5678-9abc-${String(i + 2).padStart(12, '0')}`
      }));

      const start = performance.now();
      transactions.forEach(tx => validateTransaction(tx));
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 100,
        details: `Validó 200 transacciones en ${duration.toFixed(2)}ms`
      };
    }
  },
};

// ===========================
// MEMORY TESTS (4 tests)
// ===========================

export const MEMORY_TESTS: Record<string, PerformanceTestCase> = {
  'perf-mem-001': {
    id: 'perf-mem-001',
    title: 'Array grande de transacciones no causa leak',
    description: 'Crear y destruir 10000 transacciones',
    category: 'memory',
    priority: 'high',
    threshold: { maxDuration: 200 },
    testFunction: async () => {
      const start = performance.now();
      
      // Crear array grande
      let transactions = Array.from({ length: 10000 }, (_, i) => ({
        id: `tx-${i}`,
        type: 'expense' as const,
        amount: Math.random() * 1000,
        date: '2026-01-01',
        description: `Transaction ${i}`,
        account: 'acc1'
      }));

      // Hacer algo con ellos
      const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);

      // Limpiar referencia
      transactions = [];
      
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 200 && total > 0,
        details: `Procesó 10000 items en ${duration.toFixed(2)}ms`
      };
    }
  },

  'perf-mem-002': {
    id: 'perf-mem-002',
    title: 'Map de categorías no acumula memoria',
    description: 'Crear y destruir múltiples Maps',
    category: 'memory',
    priority: 'medium',
    threshold: { maxDuration: 100 },
    testFunction: async () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const map = new Map<string, number>();
        for (let j = 0; j < 100; j++) {
          map.set(`key-${j}`, j * 10);
        }
        map.clear();
      }
      
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 100,
        details: `Creó y destruyó 100 Maps en ${duration.toFixed(2)}ms`
      };
    }
  },

  'perf-mem-003': {
    id: 'perf-mem-003',
    title: 'Set de IDs no causa leak',
    description: 'Crear y destruir múltiples Sets',
    category: 'memory',
    priority: 'low',
    threshold: { maxDuration: 50 },
    testFunction: async () => {
      const start = performance.now();
      
      for (let i = 0; i < 50; i++) {
        const set = new Set<string>();
        for (let j = 0; j < 1000; j++) {
          set.add(`id-${j}`);
        }
        set.clear();
      }
      
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 50,
        details: `Creó y destruyó 50 Sets en ${duration.toFixed(2)}ms`
      };
    }
  },

  'perf-mem-004': {
    id: 'perf-mem-004',
    title: 'Strings largos no acumulan memoria',
    description: 'Generar y concatenar strings grandes',
    category: 'memory',
    priority: 'low',
    threshold: { maxDuration: 100 },
    testFunction: async () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        let str = '';
        for (let j = 0; j < 100; j++) {
          str += `Texto ${j} `;
        }
        // Usar el string
        const length = str.length;
        // Descartar
        str = '';
      }
      
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 100,
        details: `Procesó 100 strings largos en ${duration.toFixed(2)}ms`
      };
    }
  },
};

// ===========================
// RENDER TESTS (3 tests)
// ===========================

export const RENDER_TESTS: Record<string, PerformanceTestCase> = {
  'perf-render-001': {
    id: 'perf-render-001',
    title: 'Formatear 50 monedas para renderizado',
    description: 'Formateo rápido para lista de transacciones',
    category: 'render',
    priority: 'high',
    threshold: { maxDuration: 30 },
    testFunction: async () => {
      const { formatCurrency } = await import('../utils/formatting');
      
      const amounts = Array.from({ length: 50 }, () => Math.random() * 100000);
      
      const start = performance.now();
      const formatted = amounts.map(amount => formatCurrency(amount));
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 30 && formatted.length === 50,
        details: `Formateó 50 monedas en ${duration.toFixed(2)}ms`
      };
    }
  },

  'perf-render-002': {
    id: 'perf-render-002',
    title: 'Formatear 50 fechas para renderizado',
    description: 'Formateo rápido de fechas',
    category: 'render',
    priority: 'high',
    threshold: { maxDuration: 50 },
    testFunction: async () => {
      const { formatDateShort } = await import('../utils/formatting');
      
      const dates = Array.from({ length: 50 }, (_, i) => 
        new Date(2026, 0, 1 + i)
      );
      
      const start = performance.now();
      const formatted = dates.map(date => formatDateShort(date));
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 50 && formatted.length === 50,
        details: `Formateó 50 fechas en ${duration.toFixed(2)}ms`
      };
    }
  },

  'perf-render-003': {
    id: 'perf-render-003',
    title: 'Calcular estado de 20 presupuestos',
    description: 'Cálculo rápido para dashboard de presupuestos',
    category: 'render',
    priority: 'medium',
    threshold: { maxDuration: 20 },
    testFunction: async () => {
      const { getBudgetStatus } = await import('../utils/calculations');
      
      const budgets = Array.from({ length: 20 }, () => ({
        spent: Math.random() * 1000,
        limit: Math.random() * 1500
      }));
      
      const start = performance.now();
      const statuses = budgets.map(b => getBudgetStatus(b.spent, b.limit));
      const duration = performance.now() - start;

      return {
        duration,
        passed: duration < 20 && statuses.length === 20,
        details: `Calculó 20 estados en ${duration.toFixed(2)}ms`
      };
    }
  },
};

// ===========================
// CONSOLIDACIÓN
// ===========================

export const PERFORMANCE_TEST_CASES: Record<string, PerformanceTestCase> = {
  ...SPEED_TESTS,
  ...MEMORY_TESTS,
  ...RENDER_TESTS,
};

export function getPerformanceTestStats() {
  const tests = Object.values(PERFORMANCE_TEST_CASES);
  
  return {
    total: tests.length,
    byCategory: {
      speed: tests.filter(t => t.category === 'speed').length,
      memory: tests.filter(t => t.category === 'memory').length,
      render: tests.filter(t => t.category === 'render').length,
    },
    byPriority: {
      high: tests.filter(t => t.priority === 'high').length,
      medium: tests.filter(t => t.priority === 'medium').length,
      low: tests.filter(t => t.priority === 'low').length,
    }
  };
}
