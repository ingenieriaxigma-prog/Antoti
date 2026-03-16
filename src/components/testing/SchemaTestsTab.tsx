/**
 * Schema Tests Tab - Tests de Validación de Schemas
 * 
 * Tab dedicado a tests de schemas Zod con almacenamiento REAL
 */

import { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download,
  RefreshCw,
  FileText,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Filter
} from 'lucide-react';
import { TEST_CASES, type TestCase } from '../../schemas/test-cases';
import { saveTestResult, saveTestExecution, getTestResultsByType } from '../../utils/testResultsStore';

interface TestStatus {
  testId: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  result?: any;
  error?: string;
  executedAt?: string;
  duration?: number;
}

export function SchemaTestsTab() {
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [runningTests, setRunningTests] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  // Inicializar estados de tests
  useEffect(() => {
    const initialStatuses: Record<string, TestStatus> = {};
    Object.keys(TEST_CASES).forEach(testId => {
      initialStatuses[testId] = {
        testId,
        status: 'pending'
      };
    });
    setTestStatuses(initialStatuses);
  }, []);

  // Obtener categorías únicas
  const categories = ['all', ...Array.from(new Set(Object.values(TEST_CASES).map(t => t.category)))];

  // Filtrar tests por categoría
  const filteredTests = Object.entries(TEST_CASES).filter(([_, test]) => 
    selectedCategory === 'all' || test.category === selectedCategory
  );

  // Calcular estadísticas
  const stats = {
    total: Object.keys(TEST_CASES).length,
    passed: Object.values(testStatuses).filter(s => s.status === 'passed').length,
    failed: Object.values(testStatuses).filter(s => s.status === 'failed').length,
    pending: Object.values(testStatuses).filter(s => s.status === 'pending').length,
    running: Object.values(testStatuses).filter(s => s.status === 'running').length,
  };

  const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0';

  // Ejecutar un test individual
  const runTest = async (testId: string) => {
    setTestStatuses(prev => ({
      ...prev,
      [testId]: { ...prev[testId], status: 'running' }
    }));

    const startTime = Date.now();

    try {
      const testCase = TEST_CASES[testId];
      
      // Validar datos válidos
      const validResult = testCase.schema.safeParse(testCase.validData);
      
      // Validar datos inválidos
      const invalidResult = testCase.schema.safeParse(testCase.invalidData);

      // Test pasa si:
      // 1. Datos válidos son aceptados
      // 2. Datos inválidos son rechazados
      const passed = validResult.success && !invalidResult.success;

      const duration = Date.now() - startTime;

      setTestStatuses(prev => ({
        ...prev,
        [testId]: {
          ...prev[testId],
          status: passed ? 'passed' : 'failed',
          result: {
            validResult,
            invalidResult
          },
          executedAt: new Date().toISOString(),
          duration
        }
      }));

      // ✅ Guardar resultado REAL en testResultsStore
      saveTestResult({
        testId,
        testName: testCase.description,
        testType: 'schema',
        category: testCase.category,
        status: passed ? 'passed' : 'failed',
        startTime: startTime,
        endTime: Date.now(),
        duration,
        error: passed ? undefined : 'Validation failed'
      });
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const testCase = TEST_CASES[testId];
      
      setTestStatuses(prev => ({
        ...prev,
        [testId]: {
          ...prev[testId],
          status: 'failed',
          error: error.message,
          executedAt: new Date().toISOString(),
          duration
        }
      }));

      // ✅ Guardar resultado REAL en testResultsStore
      saveTestResult({
        testId,
        testName: testCase.description,
        testType: 'schema',
        category: testCase.category,
        status: 'failed',
        startTime: startTime,
        endTime: endTime,
        duration: duration,
        error: error.message
      });
    }
  };

  // Ejecutar todos los tests
  const runAllTests = async () => {
    setRunningTests(true);
    
    for (const testId of Object.keys(TEST_CASES)) {
      await runTest(testId);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setRunningTests(false);
  };

  // Ejecutar tests de categoría
  const runCategoryTests = async () => {
    setRunningTests(true);
    
    for (const [testId, _] of filteredTests) {
      await runTest(testId);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setRunningTests(false);
  };

  // Resetear tests
  const resetTests = () => {
    const initialStatuses: Record<string, TestStatus> = {};
    Object.keys(TEST_CASES).forEach(testId => {
      initialStatuses[testId] = {
        testId,
        status: 'pending'
      };
    });
    setTestStatuses(initialStatuses);
  };

  // Exportar resultados
  const exportResults = () => {
    const report = {
      timestamp: new Date().toISOString(),
      type: 'schema-tests',
      stats,
      passRate: parseFloat(passRate),
      tests: Object.entries(testStatuses).map(([testId, status]) => ({
        testId,
        category: TEST_CASES[testId].category,
        description: TEST_CASES[testId].description,
        ...status
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oti-schema-tests-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Obtener color por categoría
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      transactions: 'bg-blue-500',
      budgets: 'bg-green-500',
      accounts: 'bg-purple-500',
      categories: 'bg-orange-500',
      filters: 'bg-pink-500',
      ui: 'bg-indigo-500',
      navigation: 'bg-cyan-500',
      auth: 'bg-red-500',
      sync: 'bg-yellow-500',
      otros: 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 mb-6">
        <button
          onClick={resetTests}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
        >
          <RefreshCw className="size-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
        
        <button
          onClick={exportResults}
          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
        >
          <Download className="size-4" />
          <span className="hidden sm:inline">Exportar</span>
        </button>
        
        <button
          onClick={selectedCategory === 'all' ? runAllTests : runCategoryTests}
          disabled={runningTests}
          className="col-span-2 sm:col-span-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
        >
          <Play className="size-4" />
          {runningTests ? 'Ejecutando...' : selectedCategory === 'all' ? 'Ejecutar Todos' : 'Ejecutar Categoría'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Tests</p>
              <p className="text-2xl mt-1">{stats.total}</p>
            </div>
            <FileText className="size-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pasados</p>
              <p className="text-2xl text-green-500 mt-1">{stats.passed}</p>
            </div>
            <CheckCircle2 className="size-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Fallidos</p>
              <p className="text-2xl text-red-500 mt-1">{stats.failed}</p>
            </div>
            <XCircle className="size-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pendientes</p>
              <p className="text-2xl text-gray-500 mt-1">{stats.pending}</p>
            </div>
            <Clock className="size-8 text-gray-400" />
          </div>
        </div>

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

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="size-5 text-gray-600 dark:text-gray-400" />
          <h3>Filtrar por Categoría</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const count = category === 'all' 
              ? Object.keys(TEST_CASES).length
              : Object.values(TEST_CASES).filter(t => t.category === category).length;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category === 'all' ? '📋 Todos' : category} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Tests List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            Test Cases {selectedCategory !== 'all' && `- ${selectedCategory}`}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredTests.length} tests en esta categoría
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTests.map(([testId, testCase]) => {
            const status = testStatuses[testId];
            
            return (
              <div
                key={testId}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs text-white flex-shrink-0 ${getCategoryColor(testCase.category)}`}>
                        {testCase.category}
                      </span>
                      <h4 className="flex-1">{testId}</h4>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testCase.description}
                    </p>

                    {status?.executedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Ejecutado: {new Date(status.executedAt).toLocaleString()}
                        {status.duration && ` - ${status.duration}ms`}
                      </p>
                    )}

                    {status?.error && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                          <span>{status.error}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                    {/* Status Icon */}
                    {status?.status === 'passed' && (
                      <CheckCircle2 className="size-6 text-green-500 flex-shrink-0" />
                    )}
                    {status?.status === 'failed' && (
                      <XCircle className="size-6 text-red-500 flex-shrink-0" />
                    )}
                    {status?.status === 'running' && (
                      <RefreshCw className="size-6 text-blue-500 animate-spin flex-shrink-0" />
                    )}
                    {status?.status === 'pending' && (
                      <Clock className="size-6 text-gray-400 flex-shrink-0" />
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => runTest(testId)}
                        disabled={status?.status === 'running'}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-1.5 transition-colors text-sm whitespace-nowrap"
                      >
                        <Play className="size-3.5" />
                        Run
                      </button>

                      {status?.result && (
                        <button
                          onClick={() => setSelectedTest(selectedTest === testId ? null : testId)}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors whitespace-nowrap"
                        >
                          {selectedTest === testId ? 'Ocultar' : 'Detalles'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {selectedTest === testId && status?.result && (
                  <div className="mt-4 space-y-3">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {status.result.validResult.success ? (
                          <CheckCircle2 className="size-4 text-green-600" />
                        ) : (
                          <XCircle className="size-4 text-red-600" />
                        )}
                        <p className="text-sm">
                          <strong>Datos Válidos:</strong> {testCase.validDescription || 'Test de validación positiva'}
                        </p>
                      </div>
                      <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto">
                        {JSON.stringify(testCase.validData, null, 2)}
                      </pre>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {!status.result.invalidResult.success ? (
                          <CheckCircle2 className="size-4 text-green-600" />
                        ) : (
                          <XCircle className="size-4 text-red-600" />
                        )}
                        <p className="text-sm">
                          <strong>Datos Inválidos:</strong> {testCase.invalidDescription || 'Test de validación negativa'}
                        </p>
                      </div>
                      <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto">
                        {JSON.stringify(testCase.invalidData, null, 2)}
                      </pre>
                      {!status.result.invalidResult.success && status.result.invalidResult.error && (
                        <div className="mt-2">
                          <p className="text-xs mb-1"><strong>Errores detectados:</strong></p>
                          <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto text-red-600">
                            {JSON.stringify(status.result.invalidResult.error.format(), null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}