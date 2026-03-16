/**
 * MonthlyBarChart
 * 
 * Gráfico de barras para tendencia mensual.
 * Optimizado con React.memo para evitar re-renders innecesarios de Recharts.
 */

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyData {
  month: string;
  monthShort?: string;
  income: number;
  expense: number;
  net?: number;
}

interface MonthlyBarChartProps {
  data: MonthlyData[];
  formatCurrency: (amount: number) => string;
}

function MonthlyBarChart({ data, formatCurrency }: MonthlyBarChartProps) {
  // Memoizar los datos formateados
  const chartData = useMemo(() => {
    return data;
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {payload[0].payload.month}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm" data-tour="stats-trend-chart">
        <h3 className="text-gray-900 dark:text-white mb-4">
          Tendencia Mensual
        </h3>
        <div className="h-56 sm:h-64 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            No hay datos disponibles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm" data-tour="stats-trend-chart">
      <h3 className="text-gray-900 dark:text-white mb-4">
        Tendencia Mensual (últimos 6 meses)
      </h3>
      
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.2}
            />
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value.toString();
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '14px' }}
              iconType="circle"
            />
            <Bar
              dataKey="income"
              name="Ingresos"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
              animationDuration={300}
            />
            <Bar
              dataKey="expense"
              name="Gastos"
              fill="#ef4444"
              radius={[8, 8, 0, 0]}
              animationDuration={300}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Memoizar comparando la longitud del array
export default React.memo(MonthlyBarChart, (prevProps, nextProps) => {
  if (prevProps.data.length !== nextProps.data.length) return false;
  
  // Comparar primero y último elemento para detectar cambios
  const prevFirst = prevProps.data[0];
  const nextFirst = nextProps.data[0];
  const prevLast = prevProps.data[prevProps.data.length - 1];
  const nextLast = nextProps.data[nextProps.data.length - 1];
  
  return (
    prevFirst?.income === nextFirst?.income &&
    prevFirst?.expense === nextFirst?.expense &&
    prevLast?.income === nextLast?.income &&
    prevLast?.expense === nextLast?.expense
  );
});