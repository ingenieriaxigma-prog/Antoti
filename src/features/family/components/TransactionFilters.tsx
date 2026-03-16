/**
 * 🔍 TRANSACTION FILTERS
 * 
 * Componente de filtros para transacciones compartidas.
 */

import React, { useState } from 'react';
import { Filter, X, Calendar, DollarSign, Tag, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TransactionType } from '../types/family.types';

export interface TransactionFilters {
  type?: TransactionType | 'all';
  category?: string;
  startDate?: string;
  endDate?: string;
  sharedByUserId?: string;
  searchText?: string;
}

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  categories?: string[];
  members?: Array<{ id: string; userId: string; nickname: string; emoji: string }>;
}

export function TransactionFiltersComponent({ 
  filters, 
  onFiltersChange,
  categories = [],
  members = []
}: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);

  // Contar filtros activos
  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== undefined && v !== 'all' && v !== ''
  ).length;

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const emptyFilters: TransactionFilters = {
      type: 'all',
      category: undefined,
      startDate: undefined,
      endDate: undefined,
      sharedByUserId: undefined,
      searchText: undefined,
    };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    setIsOpen(false);
  };

  const handleQuickFilter = (type: TransactionType | 'all') => {
    const newFilters = { ...filters, type };
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-3">
      {/* Filtros rápidos */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => handleQuickFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            (!filters.type || filters.type === 'all')
              ? 'bg-emerald-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => handleQuickFilter('expense')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filters.type === 'expense'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          💸 Gastos
        </button>
        <button
          onClick={() => handleQuickFilter('income')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filters.type === 'income'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          💰 Ingresos
        </button>

        {/* Botón filtros avanzados */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all relative"
        >
          <Filter className="w-4 h-4" />
          <span>Más filtros</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Panel de filtros avanzados */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
              {/* Búsqueda por texto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar por descripción
                </label>
                <input
                  type="text"
                  value={localFilters.searchText || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, searchText: e.target.value })}
                  placeholder="Ej: Supermercado, gasolina..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Rango de fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4" />
                    Fecha desde
                  </label>
                  <input
                    type="date"
                    value={localFilters.startDate || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4" />
                    Fecha hasta
                  </label>
                  <input
                    type="date"
                    value={localFilters.endDate || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categoría */}
              {categories.length > 0 && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4" />
                    Categoría
                  </label>
                  <select
                    value={localFilters.category || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Miembro */}
              {members.length > 1 && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Compartido por
                  </label>
                  <select
                    value={localFilters.sharedByUserId || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, sharedByUserId: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Todos los miembros</option>
                    {members.map(member => (
                      <option key={member.userId} value={member.userId}>
                        {member.emoji} {member.nickname}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                >
                  Aplicar Filtros
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Cerrar"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chips de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          
          {filters.type && filters.type !== 'all' && (
            <FilterChip
              label={filters.type === 'expense' ? 'Gastos' : 'Ingresos'}
              onRemove={() => onFiltersChange({ ...filters, type: 'all' })}
            />
          )}
          
          {filters.category && (
            <FilterChip
              label={`Categoría: ${filters.category}`}
              onRemove={() => onFiltersChange({ ...filters, category: undefined })}
            />
          )}
          
          {filters.startDate && (
            <FilterChip
              label={`Desde: ${new Date(filters.startDate).toLocaleDateString()}`}
              onRemove={() => onFiltersChange({ ...filters, startDate: undefined })}
            />
          )}
          
          {filters.endDate && (
            <FilterChip
              label={`Hasta: ${new Date(filters.endDate).toLocaleDateString()}`}
              onRemove={() => onFiltersChange({ ...filters, endDate: undefined })}
            />
          )}
          
          {filters.sharedByUserId && (
            <FilterChip
              label={`Por: ${members.find(m => m.userId === filters.sharedByUserId)?.nickname || 'Usuario'}`}
              onRemove={() => onFiltersChange({ ...filters, sharedByUserId: undefined })}
            />
          )}

          {filters.searchText && (
            <FilterChip
              label={`"${filters.searchText}"`}
              onRemove={() => onFiltersChange({ ...filters, searchText: undefined })}
            />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Chip de filtro activo
 */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="p-0.5 hover:bg-emerald-200 rounded-full transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}
