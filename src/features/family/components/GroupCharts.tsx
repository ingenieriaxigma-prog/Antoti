/**
 * 📊 GROUP CHARTS
 * 
 * Gráficos visuales para estadísticas del grupo.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import type { GroupTransactionWithDetails } from '../types/family.types';
import { parseLocalDate } from '../../../utils/dateUtils'; // ✅ Import date utils

interface GroupChartsProps {
  transactions: GroupTransactionWithDetails[];
  currency: string;
  members: Array<{ id: string; userId: string; nickname: string; emoji: string }>;
}

export function GroupCharts({ transactions, currency, members }: GroupChartsProps) {
  // Calcular datos para gráficos
  const chartData = useMemo(() => {
    // 1. Gastos vs Ingresos (por mes)
    const monthlyData = new Map<string, { month: string; gastos: number; ingresos: number }>();
    
    transactions.forEach(tx => {
      const date = parseLocalDate(tx.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { month: monthName, gastos: 0, ingresos: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      if (tx.transactionType === 'expense') {
        data.gastos += tx.amount;
      } else if (tx.transactionType === 'income') {
        data.ingresos += tx.amount;
      }
    });

    const monthlyDataArray = Array.from(monthlyData.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Últimos 6 meses

    // 2. Distribución por categoría
    const categoryData = new Map<string, number>();
    transactions
      .filter(tx => tx.transactionType === 'expense')
      .forEach(tx => {
        const cat = tx.category || 'Sin categoría';
        categoryData.set(cat, (categoryData.get(cat) || 0) + tx.amount);
      });

    const categoryDataArray = Array.from(categoryData.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categorías

    // 3. Actividad por miembro
    const memberData = new Map<string, { name: string; emoji: string; total: number; count: number }>();
    
    transactions.forEach(tx => {
      const member = members.find(m => m.userId === tx.sharedByUserId);
      if (member) {
        if (!memberData.has(member.userId)) {
          memberData.set(member.userId, {
            name: member.nickname,
            emoji: member.emoji,
            total: 0,
            count: 0
          });
        }
        const data = memberData.get(member.userId)!;
        data.total += tx.amount;
        data.count += 1;
      }
    });

    const memberDataArray = Array.from(memberData.values())
      .sort((a, b) => b.count - a.count);

    return {
      monthly: monthlyDataArray,
      categories: categoryDataArray,
      members: memberDataArray
    };
  }, [transactions, members]);

  // Colores para los gráficos
  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Formato de moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-gray-400 dark:text-gray-300" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Los gráficos aparecerán cuando haya transacciones compartidas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Gastos vs Ingresos */}
      {chartData.monthly.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Gastos vs Ingresos (Últimos 6 meses)
            </h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '14px' }}
                  formatter={(value) => value === 'gastos' ? 'Gastos' : 'Ingresos'}
                />
                <Bar 
                  dataKey="gastos" 
                  fill="#ef4444" 
                  radius={[8, 8, 0, 0]}
                  name="gastos"
                />
                <Bar 
                  dataKey="ingresos" 
                  fill="#10b981" 
                  radius={[8, 8, 0, 0]}
                  name="ingresos"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Categorías */}
        {chartData.categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Top Categorías de Gasto
              </h3>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda personalizada */}
            <div className="space-y-2 mt-4">
              {chartData.categories.map((cat, index) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(cat.value)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actividad por Miembro */}
        {chartData.members.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Actividad por Miembro
              </h3>
            </div>

            <div className="space-y-3">
              {chartData.members.map((member, index) => {
                const maxCount = Math.max(...chartData.members.map(m => m.count));
                const percentage = (member.count / maxCount) * 100;

                return (
                  <div key={member.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{member.emoji}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {member.count} {member.count === 1 ? 'transacción' : 'transacciones'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Total compartido</span>
                      <span className="font-medium">{formatCurrency(member.total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}