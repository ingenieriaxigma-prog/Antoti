/**
 * Test Results Store - Almacenamiento Real de Resultados
 * 
 * Sistema centralizado para almacenar y recuperar resultados
 * reales de tests ejecutados (Schema, E2E, Integration, Unit)
 */

export type TestType = 'schema' | 'e2e' | 'integration' | 'unit' | 'performance' | 'api-contract' | 'accessibility';

export type TestStepResult = {
  action: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  timestamp: string;
};

export type TestResult = {
  testId: string;
  testName: string;
  testType: TestType;
  category?: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'aborted';
  startTime: number;
  endTime?: number;
  duration?: number;
  steps?: TestStepResult[];
  error?: string;
  passedSteps?: number;
  failedSteps?: number;
  totalSteps?: number;
};

export type TestExecution = {
  executionId: string;
  timestamp: string;
  type: 'schema' | 'e2e' | 'integration' | 'unit' | 'all';
  results: TestResult[];
  stats: {
    total: number;
    passed: number;
    failed: number;
    aborted: number;
    passRate: number;
  };
  duration: number;
};

const STORAGE_KEY = 'oti_test_results';
const HISTORY_KEY = 'oti_test_history';
const MAX_HISTORY = 30; // Mantener últimas 30 ejecuciones

/**
 * Guardar resultado de un test individual
 */
export function saveTestResult(result: TestResult): void {
  try {
    const existingResults = getTestResults();
    
    // Actualizar o agregar resultado
    const index = existingResults.findIndex(r => r.testId === result.testId);
    if (index >= 0) {
      existingResults[index] = result;
    } else {
      existingResults.push(result);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingResults));
  } catch (error) {
    console.error('Error saving test result:', error);
  }
}

/**
 * Guardar múltiples resultados (batch)
 */
export function saveTestResults(results: TestResult[]): void {
  try {
    const existingResults = getTestResults();
    
    // Merge results
    const merged = [...existingResults];
    results.forEach(newResult => {
      const index = merged.findIndex(r => r.testId === newResult.testId);
      if (index >= 0) {
        merged[index] = newResult;
      } else {
        merged.push(newResult);
      }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (error) {
    console.error('Error saving test results:', error);
  }
}

/**
 * Obtener todos los resultados de tests
 */
export function getTestResults(): TestResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading test results:', error);
    return [];
  }
}

/**
 * Obtener resultados por tipo
 */
export function getTestResultsByType(type: TestType): TestResult[] {
  return getTestResults().filter(r => r.testType === type);
}

/**
 * Obtener resultado de un test específico
 */
export function getTestResult(testId: string): TestResult | undefined {
  return getTestResults().find(r => r.testId === testId);
}

/**
 * Limpiar todos los resultados
 */
export function clearTestResults(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing test results:', error);
  }
}

/**
 * Guardar ejecución completa en el historial
 */
export function saveTestExecution(execution: TestExecution): void {
  try {
    const history = getTestHistory();
    
    // Agregar nueva ejecución al inicio
    history.unshift(execution);
    
    // Mantener solo las últimas MAX_HISTORY ejecuciones
    const trimmed = history.slice(0, MAX_HISTORY);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving test execution:', error);
  }
}

/**
 * Obtener historial de ejecuciones
 */
export function getTestHistory(): TestExecution[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading test history:', error);
    return [];
  }
}

/**
 * Limpiar historial
 */
export function clearTestHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing test history:', error);
  }
}

/**
 * Calcular estadísticas consolidadas
 */
export function getConsolidatedStats() {
  const results = getTestResults();
  
  const schema = results.filter(r => r.testType === 'schema');
  const e2e = results.filter(r => r.testType === 'e2e');
  const integration = results.filter(r => r.testType === 'integration');
  const unit = results.filter(r => r.testType === 'unit');
  
  const calculateStats = (tests: TestResult[]) => {
    const total = tests.length;
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const aborted = tests.filter(t => t.status === 'aborted').length;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    
    return { total, passed, failed, aborted, passRate };
  };
  
  const schemaStats = calculateStats(schema);
  const e2eStats = calculateStats(e2e);
  const integrationStats = calculateStats(integration);
  const unitStats = calculateStats(unit);
  
  const totalTests = results.length;
  const totalPassed = results.filter(r => r.status === 'passed').length;
  const totalFailed = results.filter(r => r.status === 'failed').length;
  const totalAborted = results.filter(r => r.status === 'aborted').length;
  const overallPassRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
  
  return {
    overall: {
      total: totalTests,
      passed: totalPassed,
      failed: totalFailed,
      aborted: totalAborted,
      passRate: overallPassRate
    },
    schema: schemaStats,
    e2e: e2eStats,
    integration: integrationStats,
    unit: unitStats,
    totalDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0),
    lastUpdate: results.length > 0 
      ? Math.max(...results.map(r => r.endTime || r.startTime)) 
      : null
  };
}

/**
 * Obtener métricas de performance
 */
export function getPerformanceMetrics() {
  const results = getTestResults();
  
  const getMetricsForType = (type: TestType) => {
    const tests = results.filter(r => r.testType === type && r.duration);
    if (tests.length === 0) {
      return {
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        totalDuration: 0,
        count: 0
      };
    }
    
    const durations = tests.map(t => t.duration!);
    return {
      avgDuration: Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length),
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalDuration: durations.reduce((sum, d) => sum + d, 0),
      count: tests.length
    };
  };
  
  return {
    schema: getMetricsForType('schema'),
    e2e: getMetricsForType('e2e'),
    integration: getMetricsForType('integration'),
    unit: getMetricsForType('unit')
  };
}

/**
 * Obtener tests más lentos
 */
export function getSlowestTests(limit: number = 5): TestResult[] {
  return getTestResults()
    .filter(r => r.duration && r.duration > 0)
    .sort((a, b) => (b.duration || 0) - (a.duration || 0))
    .slice(0, limit);
}

/**
 * Obtener tests más rápidos
 */
export function getFastestTests(limit: number = 5): TestResult[] {
  return getTestResults()
    .filter(r => r.duration && r.duration > 0)
    .sort((a, b) => (a.duration || 0) - (b.duration || 0))
    .slice(0, limit);
}

/**
 * Verificar si hay tests pendientes de ejecutar
 */
export function hasPendingTests(): boolean {
  return getTestResults().some(r => r.status === 'pending' || r.status === 'running');
}

/**
 * Obtener último timestamp de actualización
 */
export function getLastUpdateTime(): number | null {
  const results = getTestResults();
  if (results.length === 0) return null;
  
  return Math.max(...results.map(r => r.endTime || r.startTime));
}