/**
 * 📊 MEMBER STATS MODAL
 * 
 * Modal para ver estadísticas detalladas de un miembro específico del grupo.
 */

import React, { useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, Hash, Award, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { GroupMemberSummary, GroupTransactionWithDetails } from '../types/family.types';
import { parseLocalDate } from '../../../utils/dateUtils'; // ✅ Import date utils

interface MemberStatsModalProps {
  member: GroupMemberSummary;
  transactions: GroupTransactionWithDetails[];
  currency: string;
  onClose: () => void;
}

export function MemberStatsModal({ member, transactions, currency, onClose }: MemberStatsModalProps) {
  // Filtrar transacciones del miembro
  const memberTransactions = useMemo(() => {
    return transactions.filter(tx => tx.sharedByUserId === member.userId);
  }, [transactions, member.userId]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    let totalExpenses = 0;
    let totalIncome = 0;
    let transactionCount = memberTransactions.length;
    
    const categoryExpenses = new Map<string, number>();
    const monthlyData = new Map<string, { month: string; gastos: number; ingresos: number }>();

    memberTransactions.forEach(tx => {
      if (tx.transactionType === 'expense') {
        totalExpenses += tx.amount;
        const cat = tx.category || 'Sin categoría';
        categoryExpenses.set(cat, (categoryExpenses.get(cat) || 0) + tx.amount);
      } else if (tx.transactionType === 'income') {
        totalIncome += tx.amount;
      }

      // Datos mensuales
      const date = parseLocalDate(tx.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es', { month: 'short', year: '2-digit' });
      
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

    const categoryDataArray = Array.from(categoryExpenses.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const monthlyDataArray = Array.from(monthlyData.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    return {
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
      transactionCount,
      categories: categoryDataArray,
      monthly: monthlyDataArray,
      avgExpensePerTransaction: transactionCount > 0 ? totalExpenses / transactionCount : 0,
    };
  }, [memberTransactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#10B981] px-6 py-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{member.emoji}</div>
              <div>
                <h2 className="text-2xl font-bold">{member.nickname}</h2>
                <p className="text-emerald-100 text-sm mt-1">
                  Estadísticas de actividad
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Hash className="w-5 h-5" />}
              label="Transacciones"
              value={stats.transactionCount.toString()}
              color="blue"
            />
            <StatCard
              icon={<TrendingDown className="w-5 h-5" />}
              label="Total Gastos"
              value={formatCurrency(stats.totalExpenses)}
              color="red"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Total Ingresos"
              value={formatCurrency(stats.totalIncome)}
              color="green"
            />
            <StatCard
              icon={<Target className="w-5 h-5" />}
              label="Promedio/Gasto"
              value={formatCurrency(stats.avgExpensePerTransaction)}
              color="purple"
            />
          </div>

          {/* Gráficos */}
          {memberTransactions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico mensual */}
              {stats.monthly.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    Actividad Mensual
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.monthly}>
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
                        <Bar 
                          dataKey="gastos" 
                          fill="#ef4444" 
                          radius={[8, 8, 0, 0]}
                          name="Gastos"
                        />
                        <Bar 
                          dataKey="ingresos" 
                          fill="#10b981" 
                          radius={[8, 8, 0, 0]}
                          name="Ingresos"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Gráfico de categorías */}
              {stats.categories.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    Top Categorías
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.categories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stats.categories.map((entry, index) => (
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

                  {/* Leyenda */}
                  <div className="space-y-2 mt-4">
                    {stats.categories.map((cat, index) => (
                      <div key={cat.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-gray-700">{cat.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(cat.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Este miembro aún no ha compartido transacciones</p>
            </div>
          )}

          {/* Resumen de balance */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Balance Total</p>
                <p className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.balance)}
                </p>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                stats.balance >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {stats.balance >= 0 ? (
                  <TrendingUp className={`w-8 h-8 text-green-600`} />
                ) : (
                  <TrendingDown className={`w-8 h-8 text-red-600`} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Tarjeta de estadística
 */
function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: 'blue' | 'red' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-4"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </motion.div>
  );
}