/**
 * Unit Test Dashboard - Panel de Tests Unitarios
 * 
 * Dashboard para ejecutar y visualizar tests unitarios de funciones puras
 */

import { useState } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ChevronDown,
  ChevronRight,
  Loader2,
  Calculator,
  Type,
  Shield,
  Wrench
} from 'lucide-react';
import { UNIT_TEST_CASES, UnitTestCase, getUnitTestStats } from '../../tests/unit-test-cases';
import { UnitTestRunner, UnitTestResult } from './UnitTestRunner';
import { saveTestResult } from '../../utils/testResultsStore';

type TestStatus = 'pending' | 'running' | 'passed' | 'failed';

export function UnitTestDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, UnitTestResult>>({});
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());
  const [currentlyRunningTest, setCurrentlyRunningTest] = useState<string | null>(null);

  const stats = getUnitTestStats();

  // Categorías y prioridades
  const categories = ['all', 'calculations', 'formatting', 'validation', 'utilities'];
  const priorities = ['all', 'high', 'medium', 'low'];

  // Filtrar tests
  const filteredTests = Object.values(UNIT_TEST_CASES).filter(test => {
    const categoryMatch = selectedCategory === 'all' || test.category === selectedCategory;
    const priorityMatch = selectedPriority === 'all' || test.priority === selectedPriority;
    return categoryMatch && priorityMatch;
  });

  // Calcular estadísticas de resultados
  const resultStats = {
    total: Object.keys(testResults).length,
    passed: Object.values(testResults).filter(r => r.status === 'passed').length,
    failed: Object.values(testResults).filter(r => r.status === 'failed').length,
    running: Object.values(testResults).filter(r => r.status === 'running').length,
  };

  const passRate = resultStats.total > 0
    ? ((resultStats.passed / resultStats.total) * 100).toFixed(1)
    : '0';

  // Ejecutar un test individual
  const runSingleTest = async (testId: string) => {
    const testCase = UNIT_TEST_CASES[testId];
    if (!testCase) return;

    setCurrentlyRunningTest(testId);

    // Inicializar resultado
    setTestResults(prev => ({
      ...prev,
      [testId]: {
        testCase,
        status: 'running',
        startTime: Date.now(),
      }
    }));

    // Expandir automáticamente
    setExpandedTests(prev => new Set([...prev, testId]));

    const runner = new UnitTestRunner();
    const result = await runner.runTest(testCase);

    setTestResults(prev => ({
      ...prev,
      [testId]: result
    }));

    setCurrentlyRunningTest(null);

    // ✅ Guardar resultado REAL en testResultsStore
    saveTestResult({
      testId: testCase.id,
      testName: testCase.title,
      testType: 'unit' as any, // Nuevo tipo
      category: testCase.category,
      status: result.status,
      startTime: result.startTime || Date.now(),
      endTime: result.endTime,
      duration: result.duration,
      error: result.error,
    });
  };

  // Ejecutar todos los tests filtrados
  const runFilteredTests = async () => {
    setRunningTests(true);

    for (const test of filteredTests) {
      await runSingleTest(test.id);
      await new Promise(resolve => setTimeout(resolve, 50)); // Pequeño delay
    }

    setRunningTests(false);
  };

  // Toggle expansión
  const toggleExpanded = (testId: string) => {
    setExpandedTests(prev => {
      const next = new Set(prev);
      if (next.has(testId)) {
        next.delete(testId);
      } else {
        next.add(testId);
      }
      return next;
    });
  };

  // Iconos por categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'calculations': return <Calculator className="size-4" />;
      case 'formatting': return <Type className="size-4" />;
      case 'validation': return <Shield className="size-4" />;
      case 'utilities': return <Wrench className="size-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto p-4 sm:p-6">
      {/* Header con Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Unit Tests</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tests de funciones puras aisladas
            </p>
          </div>
          <button
            onClick={runFilteredTests}
            disabled={runningTests || filteredTests.length === 0}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {runningTests ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Play className="size-4" />
                Ejecutar Tests ({filteredTests.length})
              </>
            )}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tests</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Passed</p>
            <p className="text-2xl font-bold text-green-600">{resultStats.passed}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-600">{resultStats.failed}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pass Rate</p>
            <p className="text-2xl font-bold text-emerald-600">{passRate}%</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="size-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Filtro de Categoría */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Todas' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Prioridad */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Prioridad</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            >
              {priorities.map(pri => (
                <option key={pri} value={pri}>
                  {pri === 'all' ? 'Todas' : pri}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Tests */}
      <div className="space-y-2">
        {filteredTests.map(test => {
          const result = testResults[test.id];
          const isExpanded = expandedTests.has(test.id);
          const isRunning = currentlyRunningTest === test.id;

          return (
            <div
              key={test.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Test Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start justify-between gap-3"
                onClick={() => toggleExpanded(test.id)}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Status Icon */}
                  {isRunning ? (
                    <Loader2 className="size-5 text-blue-500 animate-spin flex-shrink-0 mt-0.5" />
                  ) : result ? (
                    result.status === 'passed' ? (
                      <CheckCircle2 className="size-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="size-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )
                  ) : (
                    <Clock className="size-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}

                  {/* Category Icon */}
                  <div className="text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5">
                    {getCategoryIcon(test.category)}
                  </div>

                  {/* Test Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {test.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                        test.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        test.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {test.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {test.description}
                    </p>
                  </div>

                  {/* Duration */}
                  {result?.duration && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {result.duration}ms
                    </span>
                  )}

                  {/* Expand Icon */}
                  {isExpanded ? (
                    <ChevronDown className="size-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="size-5 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </div>

              {/* Test Details (expandido) */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="mt-4 space-y-3">
                    <div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">ID:</span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">{test.id}</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Categoría:</span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">{test.category}</span>
                    </div>
                    
                    {result?.error && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Error:</p>
                        <p className="text-sm text-red-600 dark:text-red-300 font-mono">{result.error}</p>
                      </div>
                    )}

                    {result?.status === 'passed' && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-400">✅ Test pasó correctamente</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTests.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            No hay tests que coincidan con los filtros seleccionados
          </p>
        </div>
      )}
    </div>
  );
}