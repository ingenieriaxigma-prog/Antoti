/**
 * Integration Test Dashboard - Panel Visual de Tests de Integración
 * 
 * Dashboard interactivo para ejecutar y visualizar
 * tests de integración de hooks, contexts, services y API con almacenamiento REAL
 */

import { useState } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  PlugZap,
  Filter,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  FileText,
  Loader2,
  Box,
  Code2,
  Server,
  Wifi
} from 'lucide-react';
import { 
  INTEGRATION_TEST_CASES, 
  IntegrationTestCase, 
  getIntegrationTestStats,
  IntegrationTestType 
} from '../../tests/integration-test-cases';
import { IntegrationTestRunner, IntegrationTestResult, IntegrationAssertionResult } from './IntegrationTestRunner';
import { saveTestResult } from '../../utils/testResultsStore';

type TestStatus = 'pending' | 'running' | 'passed' | 'failed';

export function IntegrationTestDashboard() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, IntegrationTestResult>>({});
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());
  const [currentlyRunningTest, setCurrentlyRunningTest] = useState<string | null>(null);

  const stats = getIntegrationTestStats();

  // Tipos disponibles
  const types = ['all', 'hooks', 'contexts', 'services', 'api'];
  const priorities = ['all', 'high', 'medium', 'low'];

  // Filtrar tests
  const filteredTests = Object.values(INTEGRATION_TEST_CASES).filter(test => {
    const typeMatch = selectedType === 'all' || test.type === selectedType;
    const priorityMatch = selectedPriority === 'all' || test.priority === selectedPriority;
    return typeMatch && priorityMatch;
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
    const testCase = INTEGRATION_TEST_CASES[testId];
    if (!testCase) return;

    setCurrentlyRunningTest(testId);

    // Inicializar resultado
    setTestResults(prev => ({
      ...prev,
      [testId]: {
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
      }
    }));

    // Expandir automáticamente
    setExpandedTests(prev => new Set([...prev, testId]));

    const runner = new IntegrationTestRunner();

    const result = await runner.runTest(
      testCase,
      (assertionResult: IntegrationAssertionResult) => {
        // Actualizar resultado de assertion
        setTestResults(prev => {
          const current = prev[testId];
          if (!current) return prev;

          const assertionIndex = current.assertions.findIndex(
            a => a.assertion === assertionResult.assertion
          );
          if (assertionIndex === -1) return prev;

          const newAssertions = [...current.assertions];
          newAssertions[assertionIndex] = assertionResult;

          return {
            ...prev,
            [testId]: {
              ...current,
              assertions: newAssertions,
              passedAssertions: newAssertions.filter(a => a.status === 'passed').length,
              failedAssertions: newAssertions.filter(a => a.status === 'failed').length
            }
          };
        });
      }
    );

    setTestResults(prev => ({
      ...prev,
      [testId]: result
    }));

    setCurrentlyRunningTest(null);

    // ✅ Guardar resultado REAL en testResultsStore
    saveTestResult({
      testId: testCase.id,
      testName: testCase.title,
      testType: 'integration',
      category: testCase.type,
      status: result.status,
      startTime: result.startTime || Date.now(),
      endTime: result.endTime,
      duration: result.duration,
      error: result.error,
      passedSteps: result.passedAssertions,
      failedSteps: result.failedAssertions,
      totalSteps: result.totalAssertions
    });
  };

  // Ejecutar todos los tests
  const runAllTests = async () => {
    setRunningTests(true);

    for (const testId of Object.keys(filteredTests.length > 0 ? filteredTests.reduce((acc, test) => ({ ...acc, [test.id]: test }), {}) : INTEGRATION_TEST_CASES)) {
      await runSingleTest(testId);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setRunningTests(false);
  };

  // Ejecutar tests filtrados
  const runFilteredTests = async () => {
    setRunningTests(true);

    for (const test of filteredTests) {
      await runSingleTest(test.id);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setRunningTests(false);
  };

  // Reset tests
  const resetTests = () => {
    setTestResults({});
    setExpandedTests(new Set());
    setCurrentlyRunningTest(null);
  };

  // Exportar resultados
  const exportResults = () => {
    const report = {
      timestamp: new Date().toISOString(),
      type: 'integration-tests',
      stats: resultStats,
      passRate: parseFloat(passRate),
      tests: Object.entries(testResults).map(([testId, result]) => ({
        testId,
        type: result.testCase.type,
        title: result.testCase.title,
        status: result.status,
        duration: result.duration,
        passedAssertions: result.passedAssertions,
        failedAssertions: result.failedAssertions,
        totalAssertions: result.totalAssertions,
        assertions: result.assertions.map(a => ({
          description: a.assertion.description,
          status: a.status,
          duration: a.duration,
          error: a.error
        }))
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oti-integration-test-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Toggle expanded
  const toggleExpanded = (testId: string) => {
    setExpandedTests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testId)) {
        newSet.delete(testId);
      } else {
        newSet.add(testId);
      }
      return newSet;
    });
  };

  // Obtener icono por tipo
  const getTypeIcon = (type: IntegrationTestType) => {
    const icons = {
      hooks: Code2,
      contexts: Box,
      services: Server,
      api: Wifi,
    };
    return icons[type] || Box;
  };

  // Obtener color por tipo
  const getTypeColor = (type: IntegrationTestType) => {
    const colors = {
      hooks: 'bg-blue-500',
      contexts: 'bg-purple-500',
      services: 'bg-orange-500',
      api: 'bg-green-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority?: string) => {
    const colors: Record<string, string> = {
      high: 'text-red-600 dark:text-red-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      low: 'text-gray-600 dark:text-gray-400',
    };
    return colors[priority || 'medium'] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-2">
              <PlugZap className="size-6 sm:size-8 text-emerald-500 flex-shrink-0" />
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl">
                  🔌 Integration Testing Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Tests de hooks, contexts, services y API
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2">
              <button
                onClick={resetTests}
                disabled={runningTests}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <RefreshCw className="size-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                onClick={exportResults}
                disabled={Object.keys(testResults).length === 0}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Download className="size-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              <button
                onClick={selectedType === 'all' && selectedPriority === 'all' ? runAllTests : runFilteredTests}
                disabled={runningTests}
                className="col-span-2 sm:col-span-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                {runningTests ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Ejecutando...
                  </>
                ) : (
                  <>
                    <Play className="size-4" />
                    {selectedType === 'all' && selectedPriority === 'all' ? 'Ejecutar Todos' : 'Ejecutar Filtrados'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Tests Executed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Ejecutados</p>
                <p className="text-2xl mt-1">{resultStats.total}</p>
              </div>
              <FileText className="size-8 text-gray-400" />
            </div>
          </div>

          {/* Passed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Exitosos</p>
                <p className="text-2xl text-green-500 mt-1">{resultStats.passed}</p>
              </div>
              <CheckCircle2 className="size-8 text-green-500" />
            </div>
          </div>

          {/* Failed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Fallidos</p>
                <p className="text-2xl text-red-500 mt-1">{resultStats.failed}</p>
              </div>
              <XCircle className="size-8 text-red-500" />
            </div>
          </div>

          {/* Pass Rate */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Pass Rate</p>
                <p className="text-2xl text-emerald-500 mt-1">{passRate}%</p>
              </div>
              <TrendingUp className="size-8 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="size-5 text-gray-600 dark:text-gray-400" />
            <h3>Filtros</h3>
          </div>

          <div className="space-y-3">
            {/* Type Filter */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Por Tipo</p>
              <div className="flex flex-wrap gap-2">
                {types.map(type => {
                  const count = type === 'all'
                    ? stats.total
                    : stats.byType[type as keyof typeof stats.byType] || 0;

                  const Icon = type === 'all' ? Filter : getTypeIcon(type as IntegrationTestType);

                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${
                        selectedType === type
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="size-3.5" />
                      {type} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Por Prioridad</p>
              <div className="flex flex-wrap gap-2">
                {priorities.map(priority => {
                  const count = priority === 'all'
                    ? stats.total
                    : stats.byPriority[priority as keyof typeof stats.byPriority] || 0;

                  return (
                    <button
                      key={priority}
                      onClick={() => setSelectedPriority(priority)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedPriority === priority
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {priority} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="flex items-center gap-2">
              <PlugZap className="size-5" />
              Integration Test Cases ({filteredTests.length})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.totalAssertions} assertions totales en todos los tests
            </p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTests.map(testCase => {
              const result = testResults[testCase.id];
              const isExpanded = expandedTests.has(testCase.id);
              const isRunning = currentlyRunningTest === testCase.id;
              const TypeIcon = getTypeIcon(testCase.type);

              return (
                <div key={testCase.id} className="p-4">
                  {/* Test Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2 flex-wrap">
                        <button
                          onClick={() => toggleExpanded(testCase.id)}
                          className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0 mt-0.5"
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </button>

                        <span className={`px-2 py-0.5 rounded text-xs text-white flex items-center gap-1 flex-shrink-0 ${getTypeColor(testCase.type)}`}>
                          <TypeIcon className="size-3" />
                          {testCase.type}
                        </span>

                        {testCase.priority && (
                          <span className={`text-xs font-medium flex-shrink-0 ${getPriorityColor(testCase.priority)}`}>
                            {testCase.priority === 'high' && '🔴'}
                            {testCase.priority === 'medium' && '🟡'}
                            {testCase.priority === 'low' && '⚪'}
                            {' '}
                            {testCase.priority.toUpperCase()}
                          </span>
                        )}

                        <h4 className="flex-1">{testCase.title}</h4>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {testCase.description}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex-shrink-0">{testCase.assertions.length} assertions</span>
                        {testCase.timeout && <span className="flex-shrink-0">Timeout: {testCase.timeout}ms</span>}
                        {result?.duration && <span className="flex-shrink-0">Duración: {result.duration}ms</span>}
                        {testCase.dependencies && (
                          <span className="break-all">Deps: {testCase.dependencies.join(', ')}</span>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Status Icon */}
                      {result?.status === 'passed' && (
                        <CheckCircle2 className="size-6 text-green-500" />
                      )}
                      {result?.status === 'failed' && (
                        <XCircle className="size-6 text-red-500" />
                      )}
                      {(result?.status === 'running' || isRunning) && (
                        <Loader2 className="size-6 text-blue-500 animate-spin" />
                      )}
                      {!result && (
                        <Clock className="size-6 text-gray-400" />
                      )}

                      {/* Run Button */}
                      <button
                        onClick={() => runSingleTest(testCase.id)}
                        disabled={isRunning || runningTests}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-1.5 transition-colors text-sm"
                      >
                        <Play className="size-3.5" />
                        Run
                      </button>
                    </div>
                  </div>

                  {/* Expanded Assertions */}
                  {isExpanded && result && (
                    <div className="mt-4 ml-6 space-y-2">
                      {/* Progress Bar */}
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            result.status === 'passed' ? 'bg-green-500' :
                            result.status === 'failed' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}
                          style={{
                            width: `${(result.passedAssertions / result.totalAssertions) * 100}%`
                          }}
                        />
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Progreso: {result.passedAssertions}/{result.totalAssertions} assertions pasadas
                      </div>

                      {/* Assertions List */}
                      <div className="space-y-1">
                        {result.assertions.map((assertionResult, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded-lg border ${
                              assertionResult.status === 'passed' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                              assertionResult.status === 'failed' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                              assertionResult.status === 'running' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                              'bg-gray-50 dark:bg-gray-700/20 border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 flex-1">
                                {assertionResult.status === 'passed' && <CheckCircle2 className="size-4 text-green-600 mt-0.5 flex-shrink-0" />}
                                {assertionResult.status === 'failed' && <XCircle className="size-4 text-red-600 mt-0.5 flex-shrink-0" />}
                                {assertionResult.status === 'running' && <Loader2 className="size-4 text-blue-600 animate-spin mt-0.5 flex-shrink-0" />}
                                {assertionResult.status === 'pending' && <Clock className="size-4 text-gray-400 mt-0.5 flex-shrink-0" />}

                                <div className="flex-1">
                                  <p className="text-sm">
                                    {assertionResult.assertion.description}
                                  </p>
                                  {assertionResult.error && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                      ✗ Error: {assertionResult.error}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {assertionResult.duration && (
                                <span className="text-xs text-gray-500 flex-shrink-0">
                                  {assertionResult.duration}ms
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Error Summary */}
                      {result.error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-start gap-2">
                            <XCircle className="size-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-red-600 dark:text-red-400">
                                <strong>Error del Test:</strong>
                              </p>
                              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {result.error}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}