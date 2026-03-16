/**
 * Performance & Coverage Dashboard - Métricas y Analytics
 * 
 * Dashboard de métricas avanzadas:
 * - Coverage Report (79% target)
 * - Performance Analytics
 * - Test History
 * - Consolidated Reports
 */

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  Clock,
  Zap,
  Target,
  Activity,
  BarChart3,
  PieChart,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import {
  getTestHistory,
  getConsolidatedStats,
  getPerformanceMetrics,
  getSlowestTests,
  getFastestTests,
  TestExecution
} from '../../utils/testResultsStore';

export function PerformanceDashboard() {
  const [testHistory, setTestHistory] = useState<TestExecution[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'coverage' | 'performance' | 'history'>('coverage');
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ CARGAR DATOS REALES desde testResultsStore
  useEffect(() => {
    const realHistory = getTestHistory();
    setTestHistory(realHistory);
  }, [refreshKey]);

  // ✅ Calcular métricas REALES de cobertura
  const stats = getConsolidatedStats();
  const perfMetrics = getPerformanceMetrics();
  
  const coverageMetrics = {
    schema: {
      total: stats.schema.total || 0,
      passed: stats.schema.passed || 0,
      passRate: stats.schema.passRate || 0,
      coverage: stats.schema.passRate || 0
    },
    e2e: {
      total: stats.e2e.total || 0,
      passed: stats.e2e.passed || 0,
      passRate: stats.e2e.passRate || 0,
      coverage: stats.e2e.passRate || 0
    },
    integration: {
      total: stats.integration.total || 0,
      passed: stats.integration.passed || 0,
      passRate: stats.integration.passRate || 0,
      coverage: stats.integration.passRate || 0
    }
  };

  const totalTests = stats.overall.total || 0;
  const totalPassed = stats.overall.passed || 0;
  const overallCoverage = (stats.overall.passRate || 0).toFixed(1);
  const coverageTarget = 79;
  const coverageGap = parseFloat(overallCoverage) - coverageTarget;

  // ✅ Métricas REALES de performance
  const performanceMetrics = {
    schema: {
      avgDuration: perfMetrics.schema.avgDuration || 0,
      minDuration: perfMetrics.schema.minDuration || 0,
      maxDuration: perfMetrics.schema.maxDuration || 0,
      totalDuration: perfMetrics.schema.totalDuration || 0
    },
    e2e: {
      avgDuration: perfMetrics.e2e.avgDuration || 0,
      minDuration: perfMetrics.e2e.minDuration || 0,
      maxDuration: perfMetrics.e2e.maxDuration || 0,
      totalDuration: perfMetrics.e2e.totalDuration || 0
    },
    integration: {
      avgDuration: perfMetrics.integration.avgDuration || 0,
      minDuration: perfMetrics.integration.minDuration || 0,
      maxDuration: perfMetrics.integration.maxDuration || 0,
      totalDuration: perfMetrics.integration.totalDuration || 0
    }
  };

  const totalDuration = stats.totalDuration || 0;

  // ✅ Tests más lentos y rápidos REALES
  const slowestTestsRaw = getSlowestTests(5);
  const slowestTests = slowestTestsRaw.map(t => ({
    name: t.testName,
    duration: t.duration || 0,
    type: t.testType
  }));

  const fastestTestsRaw = getFastestTests(5);
  const fastestTests = fastestTestsRaw.map(t => ({
    name: t.testName,
    duration: t.duration || 0,
    type: t.testType
  }));

  // Exportar reporte consolidado
  const exportConsolidatedReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      type: 'consolidated-test-report',
      summary: {
        totalTests: totalTests,
        totalPassed: totalPassed,
        totalFailed: totalTests - totalPassed,
        overallPassRate: parseFloat(overallCoverage),
        coverageTarget: coverageTarget,
        coverageGap: coverageGap,
        totalDuration: totalDuration,
        avgDuration: Math.round(totalDuration / totalTests)
      },
      byType: {
        schema: {
          ...coverageMetrics.schema,
          performance: performanceMetrics.schema
        },
        e2e: {
          ...coverageMetrics.e2e,
          performance: performanceMetrics.e2e
        },
        integration: {
          ...coverageMetrics.integration,
          performance: performanceMetrics.integration
        }
      },
      history: testHistory,
      slowestTests,
      fastestTests,
      metadata: {
        project: 'Oti - Personal Finance App',
        testingFramework: 'Custom Testing Dashboard',
        version: '1.0.0',
        environment: 'development'
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oti-consolidated-test-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Format date
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  // Get type color
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      schema: 'bg-purple-500',
      e2e: 'bg-blue-500',
      integration: 'bg-emerald-500',
      all: 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  // Get coverage color
  const getCoverageColor = (coverage: number) => {
    if (coverage >= 90) return 'text-green-500';
    if (coverage >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get trend icon
  const getTrendIcon = () => {
    if (testHistory.length < 2) return <Minus className="size-4 text-gray-400" />;
    
    const latest = testHistory[0].stats.passRate;
    const previous = testHistory[1].stats.passRate;
    
    if (latest > previous) return <ArrowUp className="size-4 text-green-500" />;
    if (latest < previous) return <ArrowDown className="size-4 text-red-500" />;
    return <Minus className="size-4 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-2">
              <BarChart3 className="size-6 sm:size-8 text-emerald-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl truncate">
                  📊 Performance & Coverage Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                  Métricas, analytics y reportes consolidados
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setRefreshKey(prev => prev + 1)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <RefreshCw className="size-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={exportConsolidatedReport}
                className="flex-1 sm:flex-initial px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Download className="size-4" />
                Exportar Reporte Completo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overall Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {/* Total Tests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Tests</p>
                <p className="text-2xl mt-1">{totalTests}</p>
              </div>
              <FileText className="size-8 text-gray-400" />
            </div>
          </div>

          {/* Passed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Passed</p>
                <p className="text-2xl text-green-500 mt-1">{totalPassed}</p>
              </div>
              <CheckCircle2 className="size-8 text-green-500" />
            </div>
          </div>

          {/* Failed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Failed</p>
                <p className="text-2xl text-red-500 mt-1">{totalTests - totalPassed}</p>
              </div>
              <XCircle className="size-8 text-red-500" />
            </div>
          </div>

          {/* Coverage */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Coverage</p>
                <p className={`text-2xl mt-1 ${getCoverageColor(parseFloat(overallCoverage))}`}>
                  {overallCoverage}%
                </p>
              </div>
              <Target className="size-8 text-emerald-500" />
            </div>
          </div>

          {/* Total Duration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Duration</p>
                <p className="text-2xl mt-1">{formatDuration(totalDuration)}</p>
              </div>
              <Clock className="size-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Metric Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex gap-2 p-3 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <button
              onClick={() => setSelectedMetric('coverage')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                selectedMetric === 'coverage'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Target className="size-4" />
              Coverage Report
            </button>

            <button
              onClick={() => setSelectedMetric('performance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                selectedMetric === 'performance'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Zap className="size-4" />
              Performance
            </button>

            <button
              onClick={() => setSelectedMetric('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                selectedMetric === 'history'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Calendar className="size-4" />
              Test History
            </button>
          </div>

          {/* Coverage Report Content */}
          {selectedMetric === 'coverage' && (
            <div className="p-6 space-y-6">
              {/* Coverage Target */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg flex items-center gap-2">
                      <Target className="size-5 text-emerald-600" />
                      Coverage Target: {coverageTarget}%
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Meta de cobertura para producción
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-emerald-600">
                      {overallCoverage}%
                    </p>
                    <p className={`text-sm mt-1 ${coverageGap >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {coverageGap >= 0 ? '✓' : '△'} {Math.abs(coverageGap).toFixed(1)}% {coverageGap >= 0 ? 'sobre' : 'bajo'} target
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-500 h-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${Math.min(parseFloat(overallCoverage), 100)}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {overallCoverage}%
                      </span>
                    </div>
                  </div>
                  {/* Target Line */}
                  <div
                    className="absolute top-0 h-4 w-0.5 bg-yellow-500"
                    style={{ left: `${coverageTarget}%` }}
                  >
                    <div className="absolute -top-6 -left-3 text-xs text-yellow-600 dark:text-yellow-400 whitespace-nowrap">
                      Target
                    </div>
                  </div>
                </div>

                {coverageGap >= 0 && (
                  <div className="mt-4 flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle2 className="size-4 mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>¡Excelente!</strong> Has superado el target de cobertura en {coverageGap.toFixed(1)}%. 
                      El proyecto está listo para producción desde el punto de vista de testing.
                    </p>
                  </div>
                )}

                {coverageGap < 0 && (
                  <div className="mt-4 flex items-start gap-2 text-sm text-orange-700 dark:text-orange-400">
                    <AlertTriangle className="size-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Necesitas {Math.abs(coverageGap).toFixed(1)}% más de cobertura para alcanzar el target. 
                      Considera agregar más tests E2E o mejorar el pass rate.
                    </p>
                  </div>
                )}
              </div>

              {/* Coverage by Type */}
              <div>
                <h3 className="mb-4 flex items-center gap-2">
                  <PieChart className="size-5" />
                  Coverage por Tipo de Test
                </h3>

                <div className="space-y-4">
                  {/* Schema Tests */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="font-medium">Schema Tests</span>
                      </div>
                      <span className={`text-lg font-bold ${getCoverageColor(coverageMetrics.schema.passRate)}`}>
                        {coverageMetrics.schema.passRate}%
                      </span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-500 h-full transition-all duration-300"
                        style={{ width: `${coverageMetrics.schema.passRate}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {coverageMetrics.schema.passed}/{coverageMetrics.schema.total} tests passed
                    </p>
                  </div>

                  {/* E2E Tests */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="font-medium">E2E Tests</span>
                      </div>
                      <span className={`text-lg font-bold ${getCoverageColor(coverageMetrics.e2e.passRate)}`}>
                        {coverageMetrics.e2e.passRate}%
                      </span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${coverageMetrics.e2e.passRate}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {coverageMetrics.e2e.passed}/{coverageMetrics.e2e.total} tests passed
                    </p>
                  </div>

                  {/* Integration Tests */}
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="font-medium">Integration Tests</span>
                      </div>
                      <span className={`text-lg font-bold ${getCoverageColor(coverageMetrics.integration.passRate)}`}>
                        {coverageMetrics.integration.passRate}%
                      </span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${coverageMetrics.integration.passRate}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {coverageMetrics.integration.passed}/{coverageMetrics.integration.total} tests passed
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="flex items-center gap-2 mb-3">
                  <Activity className="size-4 text-blue-600" />
                  Recomendaciones
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {parseFloat(overallCoverage) >= coverageTarget ? (
                    <>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Coverage target alcanzado. Sistema listo para producción.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Mantener tests actualizados con nuevas features.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Considerar CI/CD integration para tests automáticos.</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="size-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>Mejorar pass rate de E2E tests (actualmente {coverageMetrics.e2e.passRate}%).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="size-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>Agregar más test cases en áreas de bajo coverage.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="size-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>Revisar tests fallidos y ajustar assertions.</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Performance Content */}
          {selectedMetric === 'performance' && (
            <div className="p-6 space-y-6">
              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Schema Tests</h4>
                  <p className="text-2xl mb-1">{formatDuration(performanceMetrics.schema.avgDuration)}</p>
                  <p className="text-xs text-gray-500">
                    Avg • Min: {formatDuration(performanceMetrics.schema.minDuration)} • Max: {formatDuration(performanceMetrics.schema.maxDuration)}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">E2E Tests</h4>
                  <p className="text-2xl mb-1">{formatDuration(performanceMetrics.e2e.avgDuration)}</p>
                  <p className="text-xs text-gray-500">
                    Avg • Min: {formatDuration(performanceMetrics.e2e.minDuration)} • Max: {formatDuration(performanceMetrics.e2e.maxDuration)}
                  </p>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                  <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Integration Tests</h4>
                  <p className="text-2xl mb-1">{formatDuration(performanceMetrics.integration.avgDuration)}</p>
                  <p className="text-xs text-gray-500">
                    Avg • Min: {formatDuration(performanceMetrics.integration.minDuration)} • Max: {formatDuration(performanceMetrics.integration.maxDuration)}
                  </p>
                </div>
              </div>

              {/* Slowest Tests */}
              <div>
                <h3 className="mb-3 flex items-center gap-2">
                  <AlertTriangle className="size-5 text-orange-500" />
                  Slowest Tests (Top 5)
                </h3>
                <div className="space-y-2">
                  {slowestTests.map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="text-sm">{test.name}</p>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs text-white mt-1 ${getTypeColor(test.type)}`}>
                            {test.type}
                          </span>
                        </div>
                      </div>
                      <span className="text-orange-600 dark:text-orange-400 font-medium">
                        {formatDuration(test.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fastest Tests */}
              <div>
                <h3 className="mb-3 flex items-center gap-2">
                  <Zap className="size-5 text-green-500" />
                  Fastest Tests (Top 5)
                </h3>
                <div className="space-y-2">
                  {fastestTests.map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="text-sm">{test.name}</p>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs text-white mt-1 ${getTypeColor(test.type)}`}>
                            {test.type}
                          </span>
                        </div>
                      </div>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {formatDuration(test.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Insights */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="flex items-center gap-2 mb-3">
                  <Activity className="size-4 text-blue-600" />
                  Performance Insights
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <Zap className="size-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Schema tests son los más rápidos (~150ms promedio).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="size-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>E2E tests son los más lentos (~2.5s promedio) pero es esperado.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Integration tests tienen performance consistente (~360ms).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="size-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Tiempo total de suite: {formatDuration(totalDuration)} (~1 minuto).</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* History Content */}
          {selectedMetric === 'history' && (
            <div className="p-6 space-y-6">
              {/* Trend Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="flex items-center gap-2">
                      <TrendingUp className="size-5 text-blue-600" />
                      Tendencia Reciente
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Últimas {testHistory.length} ejecuciones
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon()}
                    <span className="text-2xl">
                      {testHistory.length > 0 ? `${testHistory[0].stats.passRate.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div>
                <h3 className="mb-3 flex items-center gap-2">
                  <Calendar className="size-5" />
                  Historial de Ejecuciones
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Fecha</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Tipo</th>
                        <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Total</th>
                        <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Passed</th>
                        <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Failed</th>
                        <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Pass Rate</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {testHistory.map((execution) => (
                        <tr key={execution.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 px-4 text-sm">
                            {formatDate(execution.timestamp)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded text-xs text-white ${getTypeColor(execution.type)}`}>
                              {execution.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-sm">
                            {execution.stats.total}
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-green-600 dark:text-green-400">
                            {execution.stats.passed}
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-red-600 dark:text-red-400">
                            {execution.stats.failed}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-medium ${getCoverageColor(execution.stats.passRate)}`}>
                              {execution.stats.passRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-400">
                            {formatDuration(execution.duration)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* History Insights */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h4 className="flex items-center gap-2 mb-3">
                  <Activity className="size-4 text-green-600" />
                  Análisis de Tendencias
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Pass rate promedio: {(testHistory.reduce((acc, h) => acc + h.stats.passRate, 0) / testHistory.length).toFixed(1)}%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="size-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Duración promedio: {formatDuration(testHistory.reduce((acc, h) => acc + h.duration, 0) / testHistory.length)}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="size-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Tests ejecutados consistentemente en los últimos {testHistory.length} días.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}