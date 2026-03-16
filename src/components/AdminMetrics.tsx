import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Clock, Tag, Percent, DollarSign, Activity, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { OtiLoader } from './OtiLoader';

interface CategoryMetric {
  category: string;
  count: number;
  total: number;
  percentage: number;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  balance: number;
  transactionCount: number;
}

interface BehaviorPattern {
  dayOfWeek: string;
  transactionCount: number;
  avgAmount: number;
}

interface HealthIndicators {
  savingsRate: number; // (income - expense) / income
  expenseRatio: number; // expense / income
  avgTransactionSize: number;
  transactionFrequency: number; // transactions per user per month
  activeUserRate: number; // users with transactions / total users
}

interface TransactionDistribution {
  range: string;
  count: number;
  percentage: number;
}

interface DetailedMetrics {
  topExpenseCategories: CategoryMetric[];
  topIncomeCategories: CategoryMetric[];
  monthlyTrends: MonthlyTrend[];
  behaviorPatterns: BehaviorPattern[];
  healthIndicators: HealthIndicators;
  transactionDistribution: TransactionDistribution[];
}

interface AdminMetricsProps {
  accessToken: string | null;
  darkMode?: boolean;
}

export default function AdminMetrics({ accessToken, darkMode }: AdminMetricsProps) {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<DetailedMetrics | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(num);
  };

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const { projectId } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/admin/detailed-metrics`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar métricas detalladas');
      }

      setMetrics(data.metrics);
    } catch (error: any) {
      console.error('Error loading detailed metrics:', error);
      toast.error('Error al cargar métricas detalladas', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <OtiLoader 
          message="Cargando métricas..." 
          size="md"
        />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
        <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
        <p className="text-gray-900 dark:text-white font-medium mb-2">No hay métricas disponibles</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Las métricas detalladas aparecerán cuando haya suficiente actividad
        </p>
      </div>
    );
  }

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className="space-y-6">
      {/* 🏥 INDICADORES DE SALUD FINANCIERA */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Indicadores de Salud Financiera</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Tasa de Ahorro */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-xs text-green-700 dark:text-green-300 font-medium">Tasa de Ahorro</p>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatPercent(metrics.healthIndicators.savingsRate)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {metrics.healthIndicators.savingsRate >= 20 ? '✓ Excelente' : 
               metrics.healthIndicators.savingsRate >= 10 ? '○ Bueno' : '△ Mejorable'}
            </p>
          </div>

          {/* Ratio de Gastos */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">Ratio de Gastos</p>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatPercent(metrics.healthIndicators.expenseRatio)}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {metrics.healthIndicators.expenseRatio <= 70 ? '✓ Controlado' : 
               metrics.healthIndicators.expenseRatio <= 85 ? '○ Moderado' : '△ Alto'}
            </p>
          </div>

          {/* Transacción Promedio */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Trans. Promedio</p>
            </div>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(metrics.healthIndicators.avgTransactionSize)}
            </p>
          </div>

          {/* Frecuencia */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">Frecuencia</p>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatNumber(metrics.healthIndicators.transactionFrequency)}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">trans/usuario/mes</p>
          </div>

          {/* Tasa de Usuarios Activos */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl p-4 border border-pink-200 dark:border-pink-800">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <p className="text-xs text-pink-700 dark:text-pink-300 font-medium">Usuarios Activos</p>
            </div>
            <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {formatPercent(metrics.healthIndicators.activeUserRate)}
            </p>
          </div>
        </div>
      </div>

      {/* 📈 TENDENCIAS MENSUALES */}
      {metrics.monthlyTrends.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tendencias Mensuales</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="month" 
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Ingresos"
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Gastos"
                dot={{ fill: '#ef4444', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Balance"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 🏷️ ANÁLISIS POR CATEGORÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Categorías de Gastos */}
        {metrics.topExpenseCategories.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Categorías de Gastos</h3>
            </div>
            
            <div className="space-y-3">
              {metrics.topExpenseCategories.slice(0, 8).map((cat, index) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{cat.count} trans.</span>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(cat.total)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right">{formatPercent(cat.percentage)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Categorías de Ingresos */}
        {metrics.topIncomeCategories.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Categorías de Ingresos</h3>
            </div>
            
            <div className="space-y-3">
              {metrics.topIncomeCategories.slice(0, 8).map((cat, index) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{cat.count} trans.</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(cat.total)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right">{formatPercent(cat.percentage)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 📊 PATRONES DE COMPORTAMIENTO */}
      {metrics.behaviorPatterns.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Actividad por Día de la Semana</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.behaviorPatterns}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="dayOfWeek" 
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="transactionCount" fill="#8b5cf6" name="Transacciones" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 💰 DISTRIBUCIÓN DE TRANSACCIONES */}
      {metrics.transactionDistribution.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Distribución de Transacciones por Monto</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart */}
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={metrics.transactionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percentage }) => `${range}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.transactionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend Table */}
            <div className="space-y-2">
              {metrics.transactionDistribution.map((item, index) => (
                <div key={item.range} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.range}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.count}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatPercent(item.percentage)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
