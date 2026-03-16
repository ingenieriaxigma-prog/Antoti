/**
 * Schema Testing Page - Sistema Automático
 * 
 * ⚡ ACTUALIZACIÓN AUTOMÁTICA:
 * - Lee casos de prueba desde /schemas/test-cases.ts
 * - Lee unit tests desde /schemas/unit-tests.ts
 * - Se actualiza solo al agregar tests ahí
 * - Mantenimiento centralizado
 * 
 * 📝 PARA AGREGAR NUEVOS TESTS:
 * 1. Schemas: Ve a /schemas/test-cases.ts
 * 2. Unit Tests: Ve a /schemas/unit-tests.ts
 * 3. ¡Listo! Se muestra automáticamente aquí
 */

import React, { useState } from 'react';
import { TEST_CASES, getTestCasesByCategory, getTestCaseStats, type TestCase as TestCaseType } from '../schemas/test-cases';
import { UNIT_TESTS, runUnitTest, runAllUnitTests, getUnitTestStats, type UnitTest } from '../schemas/unit-tests';
import { z } from 'zod';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, Play, Trash2, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  errors?: Record<string, string>;
}

interface UnitTestResult {
  name: string;
  success: boolean;
  message: string;
  description: string;
  details?: string;
  error?: string;
}

interface SchemaTestingPageProps {
  onGoBack: () => void;
}

export function SchemaTestingPage({ onGoBack }: SchemaTestingPageProps) {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [unitTestResults, setUnitTestResults] = useState<UnitTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const stats = getTestCaseStats();
  const unitTestStats = getUnitTestStats();

  const runTest = (name: string, schema: z.ZodTypeAny, testData: any) => {
    try {
      const validated = schema.parse(testData);
      console.log(`✅ Test "${name}" PASÓ:`, validated);
      setResults(prev => ({
        ...prev,
        [name]: {
          success: true,
          data: validated,
        }
      }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Validar que errors existe y es un array
        const errors = Array.isArray(error.errors) ? error.errors : [];
        
        // Log informativo (no es un error real, es validación esperada)
        if (name.includes('-invalid')) {
          console.log(`🔍 Test "${name}" FALLÓ (esperado):`, errors);
        } else {
          console.error(`❌ Test "${name}" FALLÓ (inesperado):`, errors);
        }
        
        const errorMessages = errors.length > 0 
          ? errors.reduce((acc, err) => ({
              ...acc,
              [err.path.join('.') || 'general']: err.message,
            }), {} as Record<string, string>)
          : { general: 'Error de validación' };
        
        setResults(prev => ({
          ...prev,
          [name]: {
            success: false,
            error: errors.length > 0 ? errors[0].message : 'Error de validación',
            errors: errorMessages,
          }
        }));
      } else {
        // Manejar errores no relacionados con Zod
        console.error(`💥 Error inesperado en test "${name}":`, error);
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : typeof error === 'string' 
          ? error 
          : 'Error desconocido';
          
        setResults(prev => ({
          ...prev,
          [name]: {
            success: false,
            error: errorMessage,
            errors: { general: errorMessage },
          }
        }));
      }
    }
  };

  const TestCase = ({ 
    name, 
    testCase,
  }: { 
    name: string;
    testCase: TestCaseType;
  }) => {
    const resultKey = name;
    const result = results[resultKey];
    const { schema, validData, invalidData, description, validDescription, invalidDescription } = testCase;

    return (
      <div className="space-y-4 mb-8">
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Valid Data Test */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-sm text-emerald-600">✅ Datos Válidos</h4>
                {validDescription && (
                  <p className="text-xs text-gray-500 mt-1">{validDescription}</p>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => runTest(resultKey, schema, validData)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="w-3 h-3 mr-1" />
                Probar
              </Button>
            </div>
            <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">
              {JSON.stringify(validData, null, 2)}
            </pre>
          </Card>

          {/* Invalid Data Test */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-sm text-red-600">❌ Datos Inválidos</h4>
                {invalidDescription && (
                  <p className="text-xs text-gray-500 mt-1">{invalidDescription}</p>
                )}
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => runTest(resultKey + '-invalid', schema, invalidData)}
              >
                <Play className="w-3 h-3 mr-1" />
                Probar
              </Button>
            </div>
            <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">
              {JSON.stringify(invalidData, null, 2)}
            </pre>
          </Card>
        </div>

        {/* Results */}
        {result && (
          <Card className={`p-4 ${result.success ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-red-50 dark:bg-red-950'}`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className="font-medium mb-2">
                  {result.success ? 'Validación Exitosa' : 'Validación Fallida'}
                </h4>
                {result.success ? (
                  <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded overflow-auto max-h-60">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600">{result.error}</p>
                    {result.errors && (
                      <div className="space-y-1">
                        {Object.entries(result.errors).map(([field, error]) => (
                          <div key={field} className="text-xs">
                            <Badge variant="destructive" className="mr-2">{field}</Badge>
                            <span>{error}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {results[resultKey + '-invalid'] && (
          <Card className="p-4 bg-orange-50 dark:bg-orange-950">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium mb-2">Resultado con Datos Inválidos</h4>
                <div className="space-y-2">
                  <p className="text-sm text-orange-600">{results[resultKey + '-invalid'].error}</p>
                  {results[resultKey + '-invalid'].errors && (
                    <div className="space-y-1">
                      {Object.entries(results[resultKey + '-invalid'].errors!).map(([field, error]) => (
                        <div key={field} className="text-xs">
                          <Badge variant="outline" className="mr-2 border-orange-600 text-orange-600">{field}</Badge>
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };

  // Generar tabs dinámicamente desde los casos de prueba
  const categories = [
    { value: 'unit-tests', label: 'Unit Tests', emoji: '🧪' },
    { value: 'transactions', label: 'Transacciones', emoji: '💰' },
    { value: 'budgets', label: 'Presupuestos', emoji: '📊' },
    { value: 'accounts', label: 'Cuentas', emoji: '💳' },
    { value: 'categories', label: 'Categorías', emoji: '🏷️' },
    { value: 'filters', label: 'Filtros', emoji: '🔍' },
    { value: 'otros', label: 'Otros', emoji: '📦' },
  ] as const;

  const runAllValidTests = () => {
    // Toast de inicio
    toast.info('✅ Ejecutando casos válidos...', {
      description: `Ejecutando ${stats.total} casos de prueba`,
      duration: 2000,
    });

    // Limpiar resultados anteriores de casos válidos
    setResults(prev => {
      const newResults = { ...prev };
      Object.keys(newResults).forEach(key => {
        if (!key.includes('-invalid')) {
          delete newResults[key];
        }
      });
      return newResults;
    });

    // Ejecutar todos los casos
    let successCount = 0;
    Object.entries(TEST_CASES).forEach(([name, testCase]) => {
      try {
        testCase.schema.parse(testCase.validData);
        successCount++;
      } catch (error) {
        // Ignorar errores, solo contar
      }
      runTest(name, testCase.schema, testCase.validData);
    });

    // Toast de resultado con delay
    setTimeout(() => {
      if (successCount === stats.total) {
        toast.success('¡Todos los casos válidos pasaron! 🎉', {
          description: `${successCount}/${stats.total} validaciones exitosas`,
          duration: 5000,
        });
      } else {
        toast.warning('Algunos casos fallaron', {
          description: `${successCount}/${stats.total} casos pasaron`,
          duration: 5000,
        });
      }
    }, 500);
  };

  const runAllInvalidTests = () => {
    // Toast de inicio
    toast.info('❌ Ejecutando casos inválidos...', {
      description: `Ejecutando ${stats.total} casos de prueba`,
      duration: 2000,
    });

    // Limpiar resultados anteriores de casos inválidos
    setResults(prev => {
      const newResults = { ...prev };
      Object.keys(newResults).forEach(key => {
        if (key.includes('-invalid')) {
          delete newResults[key];
        }
      });
      return newResults;
    });

    // Ejecutar todos los casos y detectar cuáles NO fallaron (problema)
    let failedAsExpected = 0;
    const problematicCases: string[] = [];
    
    Object.entries(TEST_CASES).forEach(([name, testCase]) => {
      try {
        testCase.schema.parse(testCase.invalidData);
        // Si pasa, es un problema - el caso INVÁLIDO no fue rechazado
        problematicCases.push(name);
        console.error(`⚠️ PROBLEMA: El caso "${name}" con datos inválidos NO falló (debería haber fallado)`);
      } catch (error) {
        // Si falla, es correcto (esperado)
        failedAsExpected++;
      }
      runTest(name + '-invalid', testCase.schema, testCase.invalidData);
    });

    // Toast de resultado con delay
    setTimeout(() => {
      if (failedAsExpected === stats.total) {
        toast.success('¡Validación correcta! Todos los casos inválidos fallaron como esperado 🎉', {
          description: `${failedAsExpected}/${stats.total} casos detectaron errores correctamente`,
          duration: 5000,
        });
      } else {
        // Mostrar cuáles casos son problemáticos
        const problematicList = problematicCases.join(', ');
        toast.error(`⚠️ ${problematicCases.length} caso(s) problemático(s)`, {
          description: `Casos que NO rechazaron datos inválidos: ${problematicList}`,
          duration: 10000,
        });
        console.error('🔴 CASOS PROBLEMÁTICOS:', problematicCases);
      }
    }, 500);
  };

  const clearResults = () => {
    setResults({});
    setUnitTestResults([]);
    console.clear();
    toast.success('Resultados limpiados', {
      description: 'Todos los resultados han sido eliminados',
      duration: 2000,
    });
  };

  const runAllUnitTestsHandler = async () => {
    setIsRunningTests(true);
    setUnitTestResults([]); // Limpiar resultados anteriores
    
    // Toast de inicio
    toast.info('🧪 Ejecutando tests...', {
      description: `Ejecutando ${unitTestStats.total} unit tests`,
      duration: 2000,
    });
    
    try {
      const allResults = await runAllUnitTests();
      setUnitTestResults(allResults.results);
      
      // Toast de resultado
      if (allResults.failed === 0) {
        toast.success('¡Todos los tests pasaron! 🎉', {
          description: `${allResults.passed}/${allResults.total} tests exitosos`,
          duration: 5000,
        });
      } else {
        toast.warning(`${allResults.failed} test(s) fallaron`,{
          description: `${allResults.passed} pasaron, ${allResults.failed} fallaron`,
          duration: 5000,
        });
      }
    } catch (error) {
      toast.error('Error al ejecutar tests', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const runSingleUnitTest = async (name: string, test: UnitTest) => {
    toast.info('🧪 Ejecutando test...', {
      description: name,
      duration: 1000,
    });
    
    const result = await runUnitTest(name, test);
    setUnitTestResults(prev => {
      const filtered = prev.filter(r => r.name !== name);
      return [...filtered, result];
    });
    
    // Toast de resultado
    if (result.success) {
      toast.success('Test pasó ✅', {
        description: result.message,
        duration: 3000,
      });
    } else {
      toast.error('Test falló ❌', {
        description: result.error || result.message,
        duration: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onGoBack}
            className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <h1 className="text-3xl mb-2">🧪 Testing Centralizado</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema automático de pruebas - Schemas Zod y Unit Tests de lógica de negocio
          </p>
        </div>

        {/* Stats Card */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-600 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                📊 Estadísticas de Cobertura
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.total}</p>
                </div>
                {categories.map(cat => (
                  <div key={cat.value}>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{cat.emoji} {cat.label}</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {stats.byCategory[cat.value] || 0}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                ℹ️ Para agregar más pruebas, edita <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">/schemas/test-cases.ts</code>
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 mb-8">
          <h3 className="font-semibold mb-4">🚀 Acciones Rápidas</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={runAllValidTests}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Ejecutar Todos los Casos Válidos ({stats.total})
            </Button>
            <Button
              onClick={runAllInvalidTests}
              variant="destructive"
            >
              <Play className="w-4 h-4 mr-2" />
              Ejecutar Todos los Casos Inválidos ({stats.total})
            </Button>
            <Button
              onClick={clearResults}
              variant="outline"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar Resultados
            </Button>
            <Button
              onClick={runAllUnitTestsHandler}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Ejecutar Todos los Unit Tests ({unitTestStats.total})
            </Button>
          </div>
        </Card>

        {/* Tabs dinámicos */}
        <Tabs defaultValue="transactions" className="w-full">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="inline-flex w-auto min-w-full">
              {categories.map(cat => {
                const count = cat.value === 'unit-tests' 
                  ? unitTestStats.total 
                  : (stats.byCategory[cat.value] || 0);
                return (
                  <TabsTrigger 
                    key={cat.value} 
                    value={cat.value} 
                    disabled={count === 0}
                    className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
                  >
                    {cat.emoji} {cat.label} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Unit Tests Tab Content */}
          <TabsContent value="unit-tests" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl mb-2">🧪 Unit Tests - Lógica de Negocio</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pruebas unitarias para cálculos, formateo, filtros y utilidades
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-3xl font-bold text-blue-600">{unitTestStats.total}</p>
                </div>
              </div>

              {/* Unit Test Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 bg-purple-50 dark:bg-purple-950">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cálculos</p>
                  <p className="text-2xl font-bold text-purple-600">{unitTestStats.categories.calculations}</p>
                </Card>
                <Card className="p-4 bg-blue-50 dark:bg-blue-950">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Formateo</p>
                  <p className="text-2xl font-bold text-blue-600">{unitTestStats.categories.formatting}</p>
                </Card>
                <Card className="p-4 bg-teal-50 dark:bg-teal-950">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Filtros</p>
                  <p className="text-2xl font-bold text-teal-600">{unitTestStats.categories.filtering}</p>
                </Card>
                <Card className="p-4 bg-orange-50 dark:bg-orange-950">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Edge Cases</p>
                  <p className="text-2xl font-bold text-orange-600">{unitTestStats.categories.edgeCases}</p>
                </Card>
              </div>

              {/* Unit Test Results Summary */}
              {unitTestResults.length > 0 && (
                <Card className="p-6 mb-8 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 border-2 border-emerald-300 dark:border-emerald-700">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                    📊 Resumen de Resultados
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Ejecutados</p>
                      <p className="text-4xl font-bold">{unitTestResults.length}</p>
                    </div>
                    <div className="text-center p-4 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">✅ Pasaron</p>
                      <p className="text-4xl font-bold text-emerald-600">
                        {unitTestResults.filter(r => r.success).length}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-red-100 dark:bg-red-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">❌ Fallaron</p>
                      <p className="text-4xl font-bold text-red-600">
                        {unitTestResults.filter(r => !r.success).length}
                      </p>
                    </div>
                  </div>
                  {unitTestResults.filter(r => r.success).length === unitTestResults.length ? (
                    <div className="mt-6 p-4 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                      <p className="text-center text-lg text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-6 h-6" />
                        ¡Todos los tests pasaron! 🎉
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <p className="text-center text-lg text-orange-700 dark:text-orange-300 font-bold flex items-center justify-center gap-2">
                        <AlertCircle className="w-6 h-6" />
                        {unitTestResults.filter(r => !r.success).length} test(s) fallaron - Revisa abajo los detalles ⬇️
                      </p>
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
                      ⬇️ Haz scroll hacia abajo para ver los resultados detallados de cada test ⬇️
                    </p>
                  </div>
                </Card>
              )}

              {/* Unit Tests List */}
              <div className="space-y-4">
                {Object.entries(UNIT_TESTS).map(([name, test]) => {
                  const result = unitTestResults.find(r => r.name === name);
                  
                  return (
                    <Card key={name} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {test.description}
                          </p>
                          {test.details && (
                            <p className="text-xs text-gray-500 mb-2">
                              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {test.details}
                              </code>
                            </p>
                          )}
                          
                          {/* Result */}
                          {result && (
                            <div className={`mt-3 p-3 rounded-lg ${
                              result.success 
                                ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800' 
                                : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                            }`}>
                              <div className="flex items-start gap-2">
                                {result.success ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <p className={`text-sm font-medium ${
                                    result.success ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
                                  }`}>
                                    {result.message}
                                  </p>
                                  {result.error && (
                                    <p className="text-xs text-red-600 mt-1">
                                      Error: {result.error}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => runSingleUnitTest(name, test)}
                          className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Ejecutar
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {categories.filter(cat => cat.value !== 'unit-tests').map(cat => {
            const testCases = getTestCasesByCategory(cat.value as any);
            const hasTests = Object.keys(testCases).length > 0;

            return (
              <TabsContent key={cat.value} value={cat.value} className="space-y-6">
                {hasTests ? (
                  <Card className="p-6">
                    <h2 className="text-2xl mb-6">{cat.emoji} Schemas de {cat.label}</h2>
                    {Object.entries(testCases).map(([name, testCase]) => (
                      <TestCase
                        key={name}
                        name={name}
                        testCase={testCase}
                      />
                    ))}
                  </Card>
                ) : (
                  <Card className="p-12 text-center">
                    <div className="text-gray-400 dark:text-gray-600">
                      <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-xl mb-2">No hay casos de prueba en esta categoría</h3>
                      <p className="text-sm">
                        Agrega casos en <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">/schemas/test-cases.ts</code>
                      </p>
                    </div>
                  </Card>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Info */}
        <Card className="p-6 mt-8 bg-blue-50 dark:bg-blue-950">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Cómo Funciona el Sistema Automático
          </h3>
          <ul className="space-y-2 text-sm">
            <li>✅ <strong>Auto-detección:</strong> Los casos se cargan desde <code>/schemas/test-cases.ts</code></li>
            <li>📝 <strong>Mantenimiento fácil:</strong> Agrega schemas nuevos en un solo archivo</li>
            <li>🔄 <strong>Actualización automática:</strong> La UI se actualiza sin tocar este componente</li>
            <li>📊 <strong>Estadísticas en tiempo real:</strong> Contador automático por categoría</li>
            <li>🎯 <strong>Cero duplicación:</strong> Define una vez, prueba en todas partes</li>
            <li>💡 <strong>IntelliSense:</strong> TypeScript valida la estructura de tus casos de prueba</li>
          </ul>
        </Card>

        {/* Documentation */}
        <Card className="p-6 mt-8 bg-green-50 dark:bg-green-950">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            📚 Guía de Uso Rápida
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🆕 Para agregar un nuevo schema:</h4>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Abre <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">/schemas/test-cases.ts</code></li>
                <li>Agrega tu caso en el objeto <code>TEST_CASES</code></li>
                <li>Define <code>validData</code> e <code>invalidData</code></li>
                <li>¡Listo! Aparecerá aquí automáticamente</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">✏️ Para modificar un schema existente:</h4>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Encuentra el caso en <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">/schemas/test-cases.ts</code></li>
                <li>Actualiza <code>validData</code> o <code>invalidData</code></li>
                <li>¡Listo! Los cambios se reflejan automáticamente</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">⏱️ Tiempo estimado:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Nuevo schema: ~5 minutos</li>
                <li>Modificar existente: ~2 minutos</li>
                <li>Beneficio: Ahorra horas de debugging 🎉</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SchemaTestingPage;