/**
 * Auto Test Runner - Ejecutor Automático de Tests
 * 
 * Componente invisible que ejecuta tests automáticamente en background
 * cuando la app inicia, para mantener métricas siempre actualizadas.
 * 
 * Tipos de tests ejecutados:
 * - Schema Tests (34)
 * - Integration Tests (25)
 * - Unit Tests (50)
 * - Performance Tests (15)
 * - API Contract Tests (12)
 * - Accessibility Tests (20)
 * 
 * Solo se ejecuta una vez por sesión (usando sessionStorage)
 */

import { useEffect, useRef } from 'react';
import { TEST_CASES } from '../../schemas/test-cases';
import { INTEGRATION_TEST_CASES } from '../../tests/integration-test-cases';
import { UNIT_TEST_CASES } from '../../tests/unit-test-cases';
import { PERFORMANCE_TEST_CASES } from '../../tests/performance-test-cases';
import { API_CONTRACT_TEST_CASES } from '../../tests/api-contract-test-cases';
import { ACCESSIBILITY_TEST_CASES } from '../../tests/accessibility-test-cases';
import { saveTestResult, saveTestExecution, getLastUpdateTime } from '../../utils/testResultsStore';
import { IntegrationTestRunner } from './IntegrationTestRunner';
import { UnitTestRunner } from './UnitTestRunner';
import { PerformanceTestRunner } from './PerformanceTestRunner';

const AUTO_TEST_ENABLED = false; // ⚠️ DESHABILITADO por defecto para evitar sobrecarga
const TEST_COOLDOWN_MS = 1000 * 60 * 60; // 1 hora entre ejecuciones automáticas
const DELAY_BETWEEN_TESTS = 100; // Delay en ms entre cada test para evitar sobrecarga

export function AutoTestRunner() {
  const hasRun = useRef(false);

  useEffect(() => {
    // Evitar ejecutar múltiples veces
    if (hasRun.current) return;
    if (!AUTO_TEST_ENABLED) return;

    // Verificar si ya ejecutamos en esta sesión
    const sessionKey = 'oti_auto_test_session';
    const sessionRun = sessionStorage.getItem(sessionKey);
    if (sessionRun) {
      console.log('✅ Auto-tests ya ejecutados en esta sesión');
      return;
    }

    // Verificar si ejecutamos recientemente (cooldown)
    const lastUpdate = getLastUpdateTime();
    if (lastUpdate && Date.now() - lastUpdate < TEST_COOLDOWN_MS) {
      const minutesAgo = Math.round((Date.now() - lastUpdate) / (1000 * 60));
      console.log(`✅ Tests ejecutados hace ${minutesAgo} minutos - saltando auto-run`);
      sessionStorage.setItem(sessionKey, 'true');
      return;
    }

    hasRun.current = true;

    // Ejecutar tests en background después de un pequeño delay
    const timer = setTimeout(() => {
      runAutoTests();
      sessionStorage.setItem(sessionKey, 'true');
    }, 3000); // 3 segundos de delay para no interferir con el inicio

    return () => clearTimeout(timer);
  }, []);

  const runAutoTests = async () => {
    console.log('🤖 Iniciando auto-ejecución de tests en background...');
    const startTime = Date.now();

    try {
      // Ejecutar Schema Tests
      console.log('📋 Ejecutando Schema Tests...');
      const schemaResults = await runSchemaTests();

      // Ejecutar Integration Tests
      console.log('📋 Ejecutando Integration Tests...');
      const integrationResults = await runIntegrationTests();

      // Ejecutar Unit Tests
      console.log('📋 Ejecutando Unit Tests...');
      const unitResults = await runUnitTests();

      // Ejecutar Performance Tests
      console.log('📋 Ejecutando Performance Tests...');
      const performanceResults = await runPerformanceTests();

      // Ejecutar API Contract Tests
      console.log('📋 Ejecutando API Contract Tests...');
      const apiContractResults = await runApiContractTests();

      // Ejecutar Accessibility Tests
      console.log('📋 Ejecutando Accessibility Tests...');
      const accessibilityResults = await runAccessibilityTests();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Calcular stats
      const passed = schemaResults.filter(r => r.status === 'passed').length + integrationResults.filter(r => r.status === 'passed').length + unitResults.filter(r => r.status === 'passed').length + performanceResults.filter(r => r.status === 'passed').length + apiContractResults.filter(r => r.status === 'passed').length + accessibilityResults.filter(r => r.status === 'passed').length;
      const failed = schemaResults.filter(r => r.status === 'failed').length + integrationResults.filter(r => r.status === 'failed').length + unitResults.filter(r => r.status === 'failed').length + performanceResults.filter(r => r.status === 'failed').length + apiContractResults.filter(r => r.status === 'failed').length + accessibilityResults.filter(r => r.status === 'failed').length;
      const total = schemaResults.length + integrationResults.length + unitResults.length + performanceResults.length + apiContractResults.length + accessibilityResults.length;
      const passRate = total > 0 ? (passed / total) * 100 : 0;

      // Guardar ejecución en historial
      saveTestExecution({
        executionId: `auto-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'schema',
        results: schemaResults,
        stats: {
          total,
          passed,
          failed,
          aborted: 0,
          passRate
        },
        duration
      });

      console.log(`✅ Auto-tests completados: ${passed}/${total} passed (${passRate.toFixed(1)}%) en ${duration}ms`);
    } catch (error) {
      console.error('❌ Error en auto-ejecución de tests:', error);
    }
  };

  const runSchemaTests = async () => {
    const results = [];

    for (const [testId, testCase] of Object.entries(TEST_CASES)) {
      const startTime = Date.now();

      try {
        // Validar datos válidos
        const validResult = testCase.schema.safeParse(testCase.validData);
        
        // Validar datos inválidos
        const invalidResult = testCase.schema.safeParse(testCase.invalidData);

        // Test pasa si:
        // 1. Datos válidos son aceptados
        // 2. Datos inválidos son rechazados
        const passed = validResult.success && !invalidResult.success;

        const endTime = Date.now();
        const duration = endTime - startTime;

        const result = {
          testId,
          testName: testCase.description,
          testType: 'schema' as const,
          category: testCase.category,
          status: (passed ? 'passed' : 'failed') as const,
          startTime,
          endTime,
          duration,
          error: passed ? undefined : 'Validation failed'
        };

        saveTestResult(result);
        results.push(result);
      } catch (error: any) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        const result = {
          testId,
          testName: testCase.description,
          testType: 'schema' as const,
          category: testCase.category,
          status: 'failed' as const,
          startTime,
          endTime,
          duration,
          error: error.message
        };

        saveTestResult(result);
        results.push(result);
      }

      // ⚡ Delay para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_TESTS));
    }

    return results;
  };

  const runIntegrationTests = async () => {
    const results = [];
    const runner = new IntegrationTestRunner();

    for (const [testId, testCase] of Object.entries(INTEGRATION_TEST_CASES)) {
      const startTime = Date.now();

      try {
        // Ejecutar el test de integración
        const result = await runner.runTest(testCase);

        const endTime = Date.now();
        const duration = endTime - startTime;

        const testResult = {
          testId,
          testName: testCase.title,
          testType: 'integration' as const,
          category: testCase.type,
          status: result.status as const,
          startTime,
          endTime,
          duration,
          error: result.error,
          passedSteps: result.passedAssertions,
          failedSteps: result.failedAssertions,
          totalSteps: result.totalAssertions
        };

        saveTestResult(testResult);
        results.push(testResult);
      } catch (error: any) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        const result = {
          testId,
          testName: testCase.title,
          testType: 'integration' as const,
          category: testCase.type,
          status: 'failed' as const,
          startTime,
          endTime,
          duration,
          error: error.message
        };

        saveTestResult(result);
        results.push(result);
      }
    }

    return results;
  };

  const runUnitTests = async () => {
    const results = [];
    const runner = new UnitTestRunner();

    for (const [testId, testCase] of Object.entries(UNIT_TEST_CASES)) {
      const startTime = Date.now();

      try {
        // Ejecutar el test unitario
        const result = await runner.runTest(testCase);

        const endTime = Date.now();
        const duration = endTime - startTime;

        const testResult = {
          testId,
          testName: testCase.title,
          testType: 'unit' as const,
          category: testCase.type,
          status: result.status as const,
          startTime,
          endTime,
          duration,
          error: result.error,
          passedSteps: result.passedAssertions,
          failedSteps: result.failedAssertions,
          totalSteps: result.totalAssertions
        };

        saveTestResult(testResult);
        results.push(testResult);
      } catch (error: any) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        const result = {
          testId,
          testName: testCase.title,
          testType: 'unit' as const,
          category: testCase.type,
          status: 'failed' as const,
          startTime,
          endTime,
          duration,
          error: error.message
        };

        saveTestResult(result);
        results.push(result);
      }
    }

    return results;
  };

  const runPerformanceTests = async () => {
    const results = [];
    const runner = new PerformanceTestRunner();

    for (const [testId, testCase] of Object.entries(PERFORMANCE_TEST_CASES)) {
      const startTime = Date.now();

      try {
        // Ejecutar el test de rendimiento
        const result = await runner.runTest(testCase);

        const endTime = Date.now();
        const duration = endTime - startTime;

        const testResult = {
          testId,
          testName: testCase.title,
          testType: 'performance' as const,
          category: testCase.type,
          status: result.status as const,
          startTime,
          endTime,
          duration,
          error: result.error,
          passedSteps: result.passedAssertions,
          failedSteps: result.failedAssertions,
          totalSteps: result.totalAssertions
        };

        saveTestResult(testResult);
        results.push(testResult);
      } catch (error: any) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        const result = {
          testId,
          testName: testCase.title,
          testType: 'performance' as const,
          category: testCase.type,
          status: 'failed' as const,
          startTime,
          endTime,
          duration,
          error: error.message
        };

        saveTestResult(result);
        results.push(result);
      }
    }

    return results;
  };

  const runApiContractTests = async () => {
    const results = [];

    for (const [testId, testCase] of Object.entries(API_CONTRACT_TEST_CASES)) {
      const startTime = Date.now();

      try {
        // Ejecutar la función de test
        await testCase.testFunction();

        const endTime = Date.now();
        const duration = endTime - startTime;

        const result = {
          testId,
          testName: testCase.title,
          testType: 'api-contract' as const,
          category: testCase.category,
          status: 'passed' as const,
          startTime,
          endTime,
          duration
        };

        saveTestResult(result);
        results.push(result);
      } catch (error: any) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        const result = {
          testId,
          testName: testCase.title,
          testType: 'api-contract' as const,
          category: testCase.category,
          status: 'failed' as const,
          startTime,
          endTime,
          duration,
          error: error.message
        };

        saveTestResult(result);
        results.push(result);
      }
    }

    return results;
  };

  const runAccessibilityTests = async () => {
    const results = [];

    for (const [testId, testCase] of Object.entries(ACCESSIBILITY_TEST_CASES)) {
      const startTime = Date.now();

      try {
        // Ejecutar la función de test
        await testCase.testFunction();

        const endTime = Date.now();
        const duration = endTime - startTime;

        const result = {
          testId,
          testName: testCase.title,
          testType: 'accessibility' as const,
          category: testCase.category,
          status: 'passed' as const,
          startTime,
          endTime,
          duration
        };

        saveTestResult(result);
        results.push(result);
      } catch (error: any) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        const result = {
          testId,
          testName: testCase.title,
          testType: 'accessibility' as const,
          category: testCase.category,
          status: 'failed' as const,
          startTime,
          endTime,
          duration,
          error: error.message
        };

        saveTestResult(result);
        results.push(result);
      }
    }

    return results;
  };

  // Componente invisible - no renderiza nada
  return null;
}