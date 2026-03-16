/**
 * Test Runner Component
 * 
 * Componente para ejecutar tests individuales con visualización en tiempo real
 */

import { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { TestCase } from '../../schemas/test-cases';

interface TestRunnerProps {
  testId: string;
  testCase: TestCase;
  onComplete?: (result: TestResult) => void;
}

export interface TestResult {
  testId: string;
  status: 'passed' | 'failed';
  validResult: any;
  invalidResult: any;
  duration: number;
  executedAt: string;
}

export function TestRunner({ testId, testCase, onComplete }: TestRunnerProps) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const runTest = async () => {
    setRunning(true);
    const startTime = Date.now();

    try {
      // Validar datos válidos
      const validResult = testCase.schema.safeParse(testCase.validData);
      
      // Validar datos inválidos
      const invalidResult = testCase.schema.safeParse(testCase.invalidData);

      // Test pasa si:
      // 1. Datos válidos son aceptados (success = true)
      // 2. Datos inválidos son rechazados (success = false)
      const passed = validResult.success && !invalidResult.success;

      const duration = Date.now() - startTime;

      const testResult: TestResult = {
        testId,
        status: passed ? 'passed' : 'failed',
        validResult,
        invalidResult,
        duration,
        executedAt: new Date().toISOString(),
      };

      setResult(testResult);
      onComplete?.(testResult);
    } catch (error) {
      console.error('Error running test:', error);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={runTest}
        disabled={running}
        className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        {running ? (
          <>
            <Clock className="size-4 animate-spin" />
            Ejecutando...
          </>
        ) : (
          <>
            <Play className="size-4" />
            Ejecutar Test
          </>
        )}
      </button>

      {result && (
        <div className={`p-4 rounded-lg border ${
          result.status === 'passed'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
            : 'bg-red-50 dark:bg-red-900/20 border-red-500'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {result.status === 'passed' ? (
              <CheckCircle2 className="size-5 text-green-600" />
            ) : (
              <XCircle className="size-5 text-red-600" />
            )}
            <span className={result.status === 'passed' ? 'text-green-600' : 'text-red-600'}>
              {result.status === 'passed' ? 'Test Pasado' : 'Test Fallido'}
            </span>
            <span className="text-sm text-gray-600 ml-auto">
              {result.duration}ms
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Datos Válidos: </span>
              {result.validResult.success ? (
                <span className="text-green-600">✓ Aceptados</span>
              ) : (
                <span className="text-red-600">✗ Rechazados (error)</span>
              )}
            </div>
            
            <div>
              <span className="font-medium">Datos Inválidos: </span>
              {!result.invalidResult.success ? (
                <span className="text-green-600">✓ Rechazados (correcto)</span>
              ) : (
                <span className="text-red-600">✗ Aceptados (error)</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
