/**
 * Performance Test Runner - Ejecutor de Tests de Performance
 * 
 * Ejecuta tests de performance y verifica umbrales de velocidad y memoria
 */

import { PerformanceTestCase } from '../../tests/performance-test-cases';

export type PerformanceTestResult = {
  testCase: PerformanceTestCase;
  status: 'pending' | 'running' | 'passed' | 'failed';
  startTime?: number;
  endTime?: number;
  duration?: number;
  executionDuration?: number; // Duración de la operación testeada
  memory?: number;
  error?: string;
  details?: string;
};

/**
 * Ejecutor de tests de performance
 */
export class PerformanceTestRunner {
  /**
   * Ejecutar un test de performance
   */
  async runTest(testCase: PerformanceTestCase): Promise<PerformanceTestResult> {
    const result: PerformanceTestResult = {
      testCase,
      status: 'running',
      startTime: Date.now(),
    };

    try {
      // Ejecutar la función de test
      const testResult = await testCase.testFunction();

      // Verificar si pasó según threshold
      result.status = testResult.passed ? 'passed' : 'failed';
      result.executionDuration = testResult.duration;
      result.memory = testResult.memory;
      result.details = testResult.details;
      result.endTime = Date.now();
      result.duration = result.endTime - result.startTime;

      // Si falló, agregar detalles
      if (!testResult.passed) {
        if (testCase.threshold.maxDuration && testResult.duration > testCase.threshold.maxDuration) {
          result.error = `Excedió umbral de velocidad: ${testResult.duration.toFixed(2)}ms > ${testCase.threshold.maxDuration}ms`;
        } else if (testCase.threshold.maxMemory && testResult.memory && testResult.memory > testCase.threshold.maxMemory) {
          result.error = `Excedió umbral de memoria: ${testResult.memory}MB > ${testCase.threshold.maxMemory}MB`;
        } else {
          result.error = 'Test falló según criterios definidos';
        }
      }
    } catch (error: any) {
      // Si lanzó error, falló
      result.status = 'failed';
      result.error = error.message || 'Test failed';
      result.endTime = Date.now();
      result.duration = result.endTime - result.startTime;
    }

    return result;
  }

  /**
   * Ejecutar múltiples tests
   */
  async runTests(testCases: PerformanceTestCase[]): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.runTest(testCase);
      results.push(result);
    }

    return results;
  }
}
