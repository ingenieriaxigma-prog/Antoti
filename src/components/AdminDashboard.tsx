import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Award, BarChart3, TrendingUp, Users, Loader2, Activity, Search } from 'lucide-react';
import { toast } from 'sonner';
import AdminFilters, { FilterValues } from './AdminFilters';
import { OtiLoader } from './OtiLoader';

interface GrowthData {
  date: string;
  newUsers: number;
  activeUsers: number;
  totalUsers: number;
}

interface FinancialStats {
  totals: {
    income: number;
    expense: number;
    balance: number;
    transactions: number;
    accounts: number;
    categories: number;
    budgets: number;
  };
  averages: {
    transactionsPerUser: number;
    incomePerUser: number;
    expensePerUser: number;
  };
  extremes: {
    maxBalance: number;
    maxBalanceUser: string;
    minBalance: number;
    minBalanceUser: string;
    largestTransaction: number;
  };
  engagement: {
    usersWithTransactions: number;
    usersWithoutTransactions: number;
  };
}

interface TopUser {
  id: string;
  name: string;
  email: string;
  transactionCount: number;
  balance: number;
  lastActivity: string;
  createdAt: string;
}

interface TopUsersData {
  topByTransactions: TopUser[];
  topByBalance: TopUser[];
  topByActivity: TopUser[];
  oldest: TopUser[];
  filtered?: TopUser[]; // All users matching current filters
}

interface AdminDashboardProps {
  accessToken: string | null;
  darkMode?: boolean;
}

export default function AdminDashboard({ accessToken, darkMode }: AdminDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
  const [topUsers, setTopUsers] = useState<TopUsersData | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    dateRange: '30d',
    startDate: '',
    endDate: '',
    userStatus: 'all',
    transactionType: 'all',
    sortBy: 'activity',
    sortOrder: 'desc',
    searchQuery: '',
  });
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

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

  const loadGrowthData = async () => {
    try {
      const { projectId } = await import('../utils/supabase/info');
      
      console.log('🔑 Access Token for growth data:', accessToken ? 'Present' : 'Missing');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/admin/growth-data`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Growth data error:', data);
        
        // If JWT is invalid, show a specific message
        if (data.code === 401 || data.message?.includes('JWT') || data.message?.includes('Invalid')) {
          toast.error('Sesión expirada', {
            description: 'Por favor cierra sesión y vuelve a entrar para continuar'
          });
        }
        
        throw new Error(data.error || 'Error al cargar datos de crecimiento');
      }

      setGrowthData(data.growthData || []);
    } catch (error: any) {
      console.error('Error loading growth data:', error);
      toast.error('Error al cargar gráficas', {
        description: error.message
      });
    }
  };

  const loadFinancialStats = async () => {
    try {
      const { projectId } = await import('../utils/supabase/info');
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.dateRange !== 'all') {
        if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
          params.append('startDate', filters.startDate);
          params.append('endDate', filters.endDate);
        } else {
          params.append('dateRange', filters.dateRange);
        }
      }
      if (filters.userStatus !== 'all') params.append('userStatus', filters.userStatus);
      if (filters.transactionType !== 'all') params.append('transactionType', filters.transactionType);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/admin/financial-stats?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Financial stats error:', data);
        throw new Error(data.error || 'Error al cargar estadísticas financieras');
      }

      setFinancialStats(data.stats);
    } catch (error: any) {
      console.error('Error loading financial stats:', error);
      // Don't show error toast - just log it
      // The component will handle the empty state
    }
  };

  const loadTopUsers = async () => {
    try {
      const { projectId } = await import('../utils/supabase/info');
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.dateRange !== 'all') {
        if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
          params.append('startDate', filters.startDate);
          params.append('endDate', filters.endDate);
        } else {
          params.append('dateRange', filters.dateRange);
        }
      }
      if (filters.userStatus !== 'all') params.append('userStatus', filters.userStatus);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.searchQuery) params.append('search', filters.searchQuery);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/admin/top-users?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Top users error:', data);
        throw new Error(data.error || 'Error al cargar usuarios destacados');
      }

      setTopUsers(data);
    } catch (error: any) {
      console.error('Error loading top users:', error);
      // Don't show error toast - just log it
      // The component will handle the empty state
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadGrowthData(),
        loadFinancialStats(),
        loadTopUsers(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    setIsApplyingFilters(true);
    await loadAllData();
    setIsApplyingFilters(false);
    toast.success('Filtros aplicados correctamente');
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: '30d',
      startDate: '',
      endDate: '',
      userStatus: 'all',
      transactionType: 'all',
      sortBy: 'activity',
      sortOrder: 'desc',
      searchQuery: '',
    });
    // Auto-apply after reset
    setTimeout(() => {
      loadAllData();
    }, 100);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <OtiLoader 
          message="Cargando datos de administración..." 
          size="md"
        />
      </div>
    );
  }

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* 🔍 FILTROS AVANZADOS */}
      <AdminFilters
        filters={filters}
        onChange={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        isApplying={isApplyingFilters}
        darkMode={darkMode}
      />

      {/* 📋 RESULTADOS DE BÚSQUEDA/FILTROS */}
      {topUsers?.filtered && topUsers.filtered.length > 0 && (filters.searchQuery || filters.userStatus !== 'all' || filters.sortBy !== 'activity' || filters.sortOrder !== 'desc') && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resultados Filtrados</h2>
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm rounded-full">
                {topUsers.filtered.length} {topUsers.filtered.length === 1 ? 'usuario' : 'usuarios'}
              </span>
            </div>
          </div>

          {topUsers.filtered.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No se encontraron usuarios que coincidan con los filtros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 py-3 px-4">Usuario</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 py-3 px-4">Email</th>
                    <th className="text-right text-xs font-semibold text-gray-600 dark:text-gray-400 py-3 px-4">Transacciones</th>
                    <th className="text-right text-xs font-semibold text-gray-600 dark:text-gray-400 py-3 px-4">Balance</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 py-3 px-4">Última Actividad</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.filtered.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center text-xs font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{user.transactionCount}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`text-sm font-medium ${
                          user.balance >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(user.balance)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(user.lastActivity).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Empty state when no data available */}
      {!loading && !growthData.length && !financialStats && !topUsers && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-900 dark:text-white font-medium mb-2">No hay suficientes datos aún</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Las estadísticas avanzadas aparecerán cuando los usuarios comiencen a usar la aplicación
          </p>
        </div>
      )}

      {/* 🥇 GRÁFICAS DE CRECIMIENTO */}
      {growthData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Crecimiento de Usuarios (Últimos 30 Días)</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="date" 
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#f3f4f6' : '#111827'
                }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="newUsers" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Nuevos Usuarios"
                dot={{ fill: '#8b5cf6', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Usuarios Activos"
                dot={{ fill: '#3b82f6', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="totalUsers" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Total Acumulado"
                dot={{ fill: '#10b981', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 🥈 ESTADÍSTICAS FINANCIERAS GLOBALES */}
      {financialStats && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas Financieras Globales</h2>
          </div>

          {/* Totales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Balance Total del Sistema</p>
              <p className={`text-2xl font-bold ${
                financialStats.totals.balance >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(financialStats.totals.balance)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(financialStats.totals.income)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Gastos Totales</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(financialStats.totals.expense)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Transacciones</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatNumber(financialStats.totals.transactions)}
              </p>
            </div>
          </div>

          {/* Promedios y Extremos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Promedios por Usuario</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transacciones:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatNumber(financialStats.averages.transactionsPerUser)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ingresos:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(financialStats.averages.incomePerUser)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Gastos:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(financialStats.averages.expensePerUser)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Récords</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Mayor Balance:</span>
                  <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(financialStats.extremes.maxBalance)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{financialStats.extremes.maxBalanceUser}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Transacción más Grande:</span>
                  <p className="font-medium text-purple-600 dark:text-purple-400">{formatCurrency(financialStats.extremes.largestTransaction)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Engagement de Usuarios</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Con Transacciones', value: financialStats.engagement.usersWithTransactions },
                    { name: 'Sin Transacciones', value: financialStats.engagement.usersWithoutTransactions },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Con Transacciones', value: financialStats.engagement.usersWithTransactions },
                    { name: 'Sin Transacciones', value: financialStats.engagement.usersWithoutTransactions },
                  ].map((entry, index) => (
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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 🥉 RANKING DE USUARIOS MÁS ACTIVOS */}
      {topUsers && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rankings de Usuarios</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top por Transacciones */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Top 5 - Más Transacciones
              </h3>
              <div className="space-y-2">
                {topUsers.topByTransactions.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' :
                      index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.transactionCount} transacciones</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top por Balance */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                Top 5 - Mayor Balance
              </h3>
              <div className="space-y-2">
                {topUsers.topByBalance.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' :
                      index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{formatCurrency(user.balance)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Usuarios Veteranos */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Top 5 - Usuarios Veteranos
              </h3>
              <div className="space-y-2">
                {topUsers.oldest.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Desde {new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top por Actividad Reciente */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                Top 5 - Actividad Reciente
              </h3>
              <div className="space-y-2">
                {topUsers.topByActivity.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(user.lastActivity).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}