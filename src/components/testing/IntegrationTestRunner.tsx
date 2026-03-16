/**
 * Integration Test Runner - Ejecutor de Tests de Integración
 * 
 * Ejecuta tests de integración validando:
 * - Hooks personalizados
 * - React Contexts
 * - Servicios y utilidades
 * - Integraciones con API
 */

import { IntegrationTestCase, IntegrationAssertion } from '../../tests/integration-test-cases';

export type IntegrationAssertionResult = {
  assertion: IntegrationAssertion;
  status: 'pending' | 'running' | 'passed' | 'failed';
  error?: string;
  duration?: number;
};

export type IntegrationTestResult = {
  testCase: IntegrationTestCase;
  status: 'pending' | 'running' | 'passed' | 'failed';
  startTime?: number;
  endTime?: number;
  duration?: number;
  executionResult?: any;
  assertions: IntegrationAssertionResult[];
  passedAssertions: number;
  failedAssertions: number;
  totalAssertions: number;
  error?: string;
};

/**
 * Ejecutor de tests de integración
 */
export class IntegrationTestRunner {
  /**
   * Ejecutar un test de integración completo
   */
  async runTest(
    testCase: IntegrationTestCase,
    onAssertionUpdate?: (assertionResult: IntegrationAssertionResult) => void
  ): Promise<IntegrationTestResult> {
    const result: IntegrationTestResult = {
      testCase,
      status: 'running',
      startTime: Date.now(),
      assertions: testCase.assertions.map(assertion => ({
        assertion,
        status: 'pending' as const
      })),
      passedAssertions: 0,
      failedAssertions: 0,
      totalAssertions: testCase.assertions.length
    };

    try {
      // Setup (si existe)
      if (testCase.setup) {
        await testCase.setup();
      }

      // Ejecutar el test
      result.executionResult = await testCase.execute();

      // Simular delay de ejecución
      await this.delay(100);

      // Ejecutar todas las assertions
      for (let i = 0; i < testCase.assertions.length; i++) {
        const assertionResult = await this.runAssertion(
          testCase.assertions[i],
          result.executionResult
        );

        result.assertions[i] = assertionResult;

        if (assertionResult.status === 'passed') {
          result.passedAssertions++;
        } else if (assertionResult.status === 'failed') {
          result.failedAssertions++;
        }

        // Notificar actualización de assertion
        if (onAssertionUpdate) {
          onAssertionUpdate(assertionResult);
        }

        // Pequeño delay entre assertions
        await this.delay(50);
      }

      // Cleanup (si existe)
      if (testCase.cleanup) {
        await testCase.cleanup();
      }

      // Determinar resultado final
      result.status = result.failedAssertions === 0 ? 'passed' : 'failed';

    } catch (error: any) {
      result.status = 'failed';
      result.error = `Error en ejecución: ${error.message}`;
    }

    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;

    return result;
  }

  /**
   * Ejecutar una assertion individual
   */
  private async runAssertion(
    assertion: IntegrationAssertion,
    executionResult: any
  ): Promise<IntegrationAssertionResult> {
    const result: IntegrationAssertionResult = {
      assertion,
      status: 'running'
    };

    const startTime = Date.now();

    try {
      // Ejecutar la validación
      const isValid = assertion.validate(executionResult);

      // ✅ FIX: Cambiar successRate a 1.0 (100%) para eliminar fallos aleatorios
      // Antes era 0.97 (97%) causando 3% de fallos aleatorios
      const successRate = 1.0; // 100% de éxito - sin fallos aleatorios
      const simulatedSuccess = Math.random() <= successRate;

      result.status = (isValid && simulatedSuccess) ? 'passed' : 'failed';

      if (!isValid || !simulatedSuccess) {
        result.error = !simulatedSuccess 
          ? 'Assertion falló aleatoriamente (simulación)'
          : 'Validación falló: resultado no cumple con expectativa';
      }

    } catch (error: any) {
      result.status = 'failed';
      result.error = `Error en validación: ${error.message}`;
    }

    result.duration = Date.now() - startTime;

    return result;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Ejecutar múltiples tests en secuencia
 */
export async function runIntegrationTestSuite(
  testCases: IntegrationTestCase[],
  onTestUpdate?: (result: IntegrationTestResult) => void,
  onAssertionUpdate?: (testId: string, assertionResult: IntegrationAssertionResult) => void
): Promise<IntegrationTestResult[]> {
  const results: IntegrationTestResult[] = [];
  const runner = new IntegrationTestRunner();

  for (const testCase of testCases) {
    const result = await runner.runTest(
      testCase,
      onAssertionUpdate ? (assertionResult) => onAssertionUpdate(testCase.id, assertionResult) : undefined
    );

    results.push(result);

    if (onTestUpdate) {
      onTestUpdate(result);
    }

    // Delay entre tests
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return results;
}