/**
 * Unit Test Runner - Ejecutor de Tests Unitarios
 * 
 * Ejecuta tests unitarios de funciones puras de forma aislada.
 */

import { UnitTestCase } from '../../tests/unit-test-cases';

export type UnitTestResult = {
  testCase: UnitTestCase;
  status: 'pending' | 'running' | 'passed' | 'failed';
  startTime?: number;
  endTime?: number;
  duration?: number;
  error?: string;
};

/**
 * Ejecutor de tests unitarios
 */
export class UnitTestRunner {
  /**
   * Ejecutar un test unitario
   */
  async runTest(testCase: UnitTestCase): Promise<UnitTestResult> {
    const result: UnitTestResult = {
      testCase,
      status: 'running',
      startTime: Date.now(),
    };

    try {
      // Ejecutar la función de test
      await testCase.testFunction();

      // Si no lanzó error, pasó
      result.status = 'passed';
      result.endTime = Date.now();
      result.duration = result.endTime - result.startTime;
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
  async runTests(testCases: UnitTestCase[]): Promise<UnitTestResult[]> {
    const results: UnitTestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.runTest(testCase);
      results.push(result);
    }

    return results;
  }
}
