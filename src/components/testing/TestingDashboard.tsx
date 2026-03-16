/**
 * Testing Dashboard - Panel Completo de Testing
 * 
 * Panel de administración para ejecutar y validar test cases
 * Accesible solo para usuarios administradores
 * 
 * Features:
 * - Schema Tests: Validación de schemas Zod (34 tests)
 * - E2E Tests: Tests de flujos completos de usuario (18 tests)
 * - Integration Tests: Tests de hooks, contexts, services y API (25 tests)
 * - Unit Tests: Tests de funciones puras (50 tests)
 * - Performance & Coverage: Métricas, analytics y reportes consolidados
 * - Resultados visuales
 * - Exportación de reportes
 * - Tracking de progreso
 */

import { useState } from 'react';
import { Activity, FlaskConical, Zap, PlugZap, BarChart3, X, Calculator } from 'lucide-react';
import { SchemaTestsTab } from './SchemaTestsTab';
import { E2ETestDashboard } from './E2ETestDashboard';
import { IntegrationTestDashboard } from './IntegrationTestDashboard';
import { UnitTestDashboard } from './UnitTestDashboard';
import { PerformanceDashboard } from './PerformanceDashboard';

type TestingTab = 'schema' | 'e2e' | 'integration' | 'unit' | 'performance';

interface TestingDashboardProps {
  onGoBack?: () => void;
}

export function TestingDashboard({ onGoBack }: TestingDashboardProps) {
  const [activeTab, setActiveTab] = useState<TestingTab>('schema');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-2">
              <Activity className="size-6 sm:size-8 text-emerald-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl truncate">
                  🧪 Oti Testing Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                  Sistema completo de testing: Schema + E2E + Integration + Performance
                </p>
              </div>
              
              {/* Close Button */}
              {onGoBack && (
                <button
                  onClick={onGoBack}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                  aria-label="Cerrar panel"
                >
                  <X className="size-6 text-gray-600 dark:text-gray-400" />
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('schema')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'schema'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FlaskConical className="size-4" />
                <span className="text-sm">Schema Tests</span>
                <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs">
                  34
                </span>
              </button>

              <button
                onClick={() => setActiveTab('e2e')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'e2e'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Zap className="size-4" />
                <span className="text-sm">E2E Tests</span>
                <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs">
                  18
                </span>
              </button>

              <button
                onClick={() => setActiveTab('integration')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'integration'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <PlugZap className="size-4" />
                <span className="text-sm">Integration Tests</span>
                <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs">
                  25
                </span>
              </button>

              <button
                onClick={() => setActiveTab('unit')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'unit'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Calculator className="size-4" />
                <span className="text-sm">Unit Tests</span>
                <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs">
                  50
                </span>
              </button>

              <button
                onClick={() => setActiveTab('performance')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'performance'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <BarChart3 className="size-4" />
                <span className="text-sm">Performance</span>
                <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs">
                  77
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'schema' && <SchemaTestsTab />}
      {activeTab === 'e2e' && <E2ETestDashboard />}
      {activeTab === 'integration' && <IntegrationTestDashboard />}
      {activeTab === 'unit' && <UnitTestDashboard />}
      {activeTab === 'performance' && <PerformanceDashboard />}
    </div>
  );
}