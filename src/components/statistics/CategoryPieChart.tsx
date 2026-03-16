/**
 * CategoryPieChart
 * 
 * Gráfico de pastel para distribución de categorías.
 * Optimizado con React.memo y useMemo para evitar re-renders de Recharts.
 * Incluye interactividad: hover y click para destacar segmentos.
 * Muestra el total por defecto en el centro, cambia a categoría específica al interactuar.
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';

interface CategoryData {
  id: string;
  name: string;
  amount: number; // ✅ CAMBIADO: de 'value' a 'amount'
  color: string;
  emoji?: string; // ✅ CAMBIADO: opcional
  percentage: number;
  count?: number; // ✅ AGREGADO: opcional
}

interface CategoryPieChartProps {
  data: CategoryData[];
  viewType: 'income' | 'expense';
  formatCurrency: (amount: number) => string;
}

// Custom shape for active (clicked/hovered) segment - SOLO EXPANSIÓN, sin texto
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props;

  return (
    <g>
      {/* Segmento expandido */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      {/* Anillo exterior para mejor efecto visual */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 15}
        fill={fill}
      />
    </g>
  );
};

function CategoryPieChart({ data, viewType, formatCurrency }: CategoryPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isLockedRef = useRef(false);

  // Memoizar los datos para Recharts
  const chartData = useMemo(() => {
    return data.map(item => ({
      name: item.name,
      amount: item.amount, // ✅ CORREGIDO: usar 'amount' en lugar de 'value'
      color: item.color,
    }));
  }, [data]);

  // Calcular el total
  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.amount, 0); // ✅ CAMBIADO: de 'value' a 'amount'
  }, [data]);

  // Handler para click en segmento de gráfica
  const onPieClick = useCallback((data: any, index: number) => {
    if (isLockedRef.current && activeIndex === index) {
      // Si está bloqueado y hacemos click en el mismo, desbloqueamos
      isLockedRef.current = false;
      setActiveIndex(null);
    } else {
      // Bloqueamos en este índice
      isLockedRef.current = true;
      setActiveIndex(index);
    }
  }, [activeIndex]);

  // Handler para mouse enter en gráfica
  const onPieEnter = useCallback((_: any, index: number) => {
    if (!isLockedRef.current) {
      setActiveIndex(index);
    }
  }, []);

  // Handler para mouse leave en gráfica
  const onPieLeave = useCallback(() => {
    if (!isLockedRef.current) {
      setActiveIndex(null);
    }
  }, []);

  // Handler para click en lista de categorías
  const handleCategoryClick = useCallback((index: number) => {
    if (isLockedRef.current && activeIndex === index) {
      // Si está bloqueado y hacemos click en el mismo, desbloqueamos
      isLockedRef.current = false;
      setActiveIndex(null);
    } else {
      // Bloqueamos en este índice
      isLockedRef.current = true;
      setActiveIndex(index);
    }
  }, [activeIndex]);

  // Handler para hover en lista de categorías (SIN useCallback para evitar closure stale)
  const handleCategoryEnter = (index: number) => {
    if (!isLockedRef.current) {
      setActiveIndex(index);
    }
  };

  // Handler para leave en lista de categorías (SIN useCallback para evitar closure stale)
  const handleCategoryLeave = () => {
    if (!isLockedRef.current) {
      setActiveIndex(null);
    }
  };

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm" data-tour="stats-category-chart">
        <h3 className="text-gray-900 dark:text-white mb-4">
          Distribución por Categoría
        </h3>
        <div className="h-56 sm:h-64 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No hay {viewType === 'income' ? 'ingresos' : 'gastos'} en este periodo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm" data-tour="stats-category-chart">
      <h3 className="text-gray-900 dark:text-white mb-4">
        Distribución por Categoría
      </h3>
      
      <div className="h-56 sm:h-64 relative">
        {/* Center label - SIEMPRE visible, cambia contenido según activeIndex */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center">
            {activeIndex === null ? (
              // Mostrar total
              <>
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                  Total {viewType === 'income' ? 'Ingresos' : 'Gastos'}
                </div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1">
                  {formatCurrency(total)}
                </div>
                <div className="text-base font-bold text-gray-500 dark:text-gray-500 mt-1">
                  100%
                </div>
              </>
            ) : (
              // Mostrar categoría activa
              <>
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                  {data[activeIndex]?.name}
                </div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1">
                  {formatCurrency(data[activeIndex]?.amount || 0)}
                </div>
                <div className="text-base font-bold text-gray-500 dark:text-gray-500 mt-1">
                  {data[activeIndex]?.percentage.toFixed(1)}%
                </div>
              </>
            )}
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              outerRadius="70%"
              innerRadius="45%"
              fill="#8884d8"
              dataKey="amount"
              animationDuration={300}
              activeIndex={activeIndex ?? undefined}
              activeShape={renderActiveShape}
              onClick={onPieClick}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{ 
                    cursor: 'pointer',
                    opacity: activeIndex === null || activeIndex === index ? 1 : 0.6,
                    transition: 'opacity 0.3s ease'
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend con emojis */}
      <div className="mt-4 grid grid-cols-1 gap-2">
        {data.slice(0, 5).map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center justify-between text-sm transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg ${
              activeIndex === index ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
            onClick={() => handleCategoryClick(index)}
            onMouseEnter={() => handleCategoryEnter(index)}
            onMouseLeave={handleCategoryLeave}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-lg flex-shrink-0">{item.emoji}</span>
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {item.name}
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
              {item.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
        {data.length > 5 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
            +{data.length - 5} categorías más
          </p>
        )}
      </div>
    </div>
  );
}

// Exportar sin memo para permitir re-renders por estado interno
export default CategoryPieChart;