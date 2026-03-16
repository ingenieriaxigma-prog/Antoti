import { useState } from 'react';
import { Calendar, Filter, RefreshCw, Search, Users, TrendingUp, X } from 'lucide-react';
import { Button } from './ui/button';

export interface FilterValues {
  dateRange: 'all' | '7d' | '30d' | '3m' | '6m' | '1y' | 'custom';
  startDate: string;
  endDate: string;
  userStatus: 'all' | 'enabled' | 'disabled';
  transactionType: 'all' | 'income' | 'expense';
  sortBy: 'activity' | 'createdAt' | 'balance' | 'transactions';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
}

interface AdminFiltersProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  onApply: () => void;
  onReset: () => void;
  isApplying?: boolean;
  darkMode?: boolean;
}

export default function AdminFilters({ 
  filters, 
  onChange, 
  onApply, 
  onReset,
  isApplying = false,
  darkMode = false 
}: AdminFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FilterValues, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Últimos 7 días';
      case '30d': return 'Últimos 30 días';
      case '3m': return 'Últimos 3 meses';
      case '6m': return 'Últimos 6 meses';
      case '1y': return 'Último año';
      case 'custom': return 'Personalizado';
      case 'all':
      default: return 'Todo el tiempo';
    }
  };

  const hasActiveFilters = 
    filters.dateRange !== 'all' ||
    filters.userStatus !== 'all' ||
    filters.transactionType !== 'all' ||
    filters.searchQuery !== '' ||
    filters.sortBy !== 'activity';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filtros Avanzados</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
              Activos
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          {showAdvanced ? 'Ocultar' : 'Mostrar todo'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
        />
        {filters.searchQuery && (
          <button
            onClick={() => updateFilter('searchQuery', '')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Date Range */}
        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            <Calendar className="w-3 h-3" />
            Período
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilter('dateRange', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
          >
            <option value="all">Todo el tiempo</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="3m">Últimos 3 meses</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="1y">Último año</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        {/* User Status */}
        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            <Users className="w-3 h-3" />
            Estado de Usuario
          </label>
          <select
            value={filters.userStatus}
            onChange={(e) => updateFilter('userStatus', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
          >
            <option value="all">Todos</option>
            <option value="enabled">Activos</option>
            <option value="disabled">Deshabilitados</option>
          </select>
        </div>

        {/* Transaction Type */}
        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            <TrendingUp className="w-3 h-3" />
            Tipo de Transacción
          </label>
          <select
            value={filters.transactionType}
            onChange={(e) => updateFilter('transactionType', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
          >
            <option value="all">Todos</option>
            <option value="income">Solo Ingresos</option>
            <option value="expense">Solo Gastos</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range (shown when custom is selected) */}
      {filters.dateRange === 'custom' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
              Desde
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
              max={filters.endDate || undefined}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
              Hasta
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
              min={filters.startDate || undefined}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
            />
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Ordenamiento</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Sort By */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                Ordenar por
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
              >
                <option value="activity">Última actividad</option>
                <option value="createdAt">Fecha de registro</option>
                <option value="balance">Balance total</option>
                <option value="transactions">Cantidad de transacciones</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                Orden
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => updateFilter('sortOrder', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={onApply}
          disabled={isApplying}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isApplying ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Aplicando...
            </>
          ) : (
            <>
              <Filter className="w-4 h-4 mr-2" />
              Aplicar Filtros
            </>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            onClick={onReset}
            variant="outline"
            className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Filtros activos:</p>
          <div className="flex flex-wrap gap-2">
            {filters.dateRange !== 'all' && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-md flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {getDateRangeLabel(filters.dateRange)}
              </span>
            )}
            {filters.userStatus !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-md flex items-center gap-1">
                <Users className="w-3 h-3" />
                {filters.userStatus === 'enabled' ? 'Activos' : 'Deshabilitados'}
              </span>
            )}
            {filters.transactionType !== 'all' && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-md flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {filters.transactionType === 'income' ? 'Ingresos' : 'Gastos'}
              </span>
            )}
            {filters.searchQuery && (
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-md flex items-center gap-1">
                <Search className="w-3 h-3" />
                "{filters.searchQuery}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
