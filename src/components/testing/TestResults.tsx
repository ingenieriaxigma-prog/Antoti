/**
 * Test Results Component
 * 
 * Muestra los resultados de tests ejecutados con detalles visuales
 */

import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface TestResultsProps {
  results: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
  };
}

export function TestResults({ results }: TestResultsProps) {
  const passRate = results.total > 0 
    ? ((results.passed / results.total) * 100).toFixed(1) 
    : '0';

  const getProgressColor = () => {
    const rate = parseFloat(passRate);
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="mb-4">Resultados de Tests</h3>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progreso</span>
          <span>{passRate}% completado</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${passRate}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total */}
        <div className="text-center">
          <div className="text-2xl mb-1">{results.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>

        {/* Passed */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle2 className="size-5 text-green-500" />
            <span className="text-2xl text-green-500">{results.passed}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pasados</div>
        </div>

        {/* Failed */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <XCircle className="size-5 text-red-500" />
            <span className="text-2xl text-red-500">{results.failed}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Fallidos</div>
        </div>

        {/* Pending */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertCircle className="size-5 text-gray-400" />
            <span className="text-2xl text-gray-500">{results.pending}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pendientes</div>
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
        {results.failed === 0 && results.passed === results.total && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="size-5" />
            <span>¡Todos los tests pasaron exitosamente!</span>
          </div>
        )}
        
        {results.failed > 0 && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="size-5" />
            <span>{results.failed} test{results.failed > 1 ? 's' : ''} fallaron. Revisa los detalles.</span>
          </div>
        )}
        
        {results.pending > 0 && results.passed === 0 && results.failed === 0 && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <AlertCircle className="size-5" />
            <span>Ejecuta los tests para ver los resultados</span>
          </div>
        )}
      </div>
    </div>
  );
}
