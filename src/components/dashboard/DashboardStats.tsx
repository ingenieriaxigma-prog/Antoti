/**
 * DashboardStats
 * 
 * Componente optimizado para mostrar las estadísticas del dashboard.
 * Usa React.memo para evitar re-renders innecesarios.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';

interface DashboardStatsProps {
  income: number;
  expenses: number;
  balance: number;
  formatCurrency: (amount: number) => string;
}

function DashboardStats({ income, expenses, balance, formatCurrency }: DashboardStatsProps) {
  // Calcular porcentaje de cambio (simulado por ahora)
  const incomeChange = useMemo(() => {
    return income > 0 ? '+12%' : '0%';
  }, [income]);

  const expensesChange = useMemo(() => {
    return expenses > 0 ? '+8%' : '0%';
  }, [expenses]);

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Income Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl shadow-lg text-white"
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm opacity-90">Ingresos</span>
        </div>
        <p className="text-2xl font-bold mb-1">{formatCurrency(income)}</p>
        <p className="text-xs opacity-75">{incomeChange} vs mes anterior</p>
      </motion.div>

      {/* Expenses Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-xl shadow-lg text-white"
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm opacity-90">Gastos</span>
        </div>
        <p className="text-2xl font-bold mb-1">{formatCurrency(expenses)}</p>
        <p className="text-xs opacity-75">{expensesChange} vs mes anterior</p>
      </motion.div>
    </div>
  );
}

// Memoizar para evitar re-renders si las props no cambian
export default React.memo(DashboardStats, (prevProps, nextProps) => {
  return (
    prevProps.income === nextProps.income &&
    prevProps.expenses === nextProps.expenses &&
    prevProps.balance === nextProps.balance
  );
});
