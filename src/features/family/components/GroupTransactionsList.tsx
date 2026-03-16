/**
 * 👥 GROUP TRANSACTIONS LIST
 * 
 * Lista de transacciones compartidas en un grupo con filtros.
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GroupTransactionWithDetails } from '../types/family.types';
import { TransactionCard } from './TransactionCard';
import { TransactionFiltersComponent, type TransactionFilters } from './TransactionFilters';

const TRANSACTIONS_PER_PAGE = 10;

interface GroupTransactionsListProps {
  groupId: string;
  transactions: GroupTransactionWithDetails[];
  isLoading: boolean;
  members?: Array<{ id: string; userId: string; nickname: string; emoji: string }>;
  onUpdateTransaction?: (transactionId: string, updates: any) => Promise<void>;
  onDeleteTransaction?: (transactionId: string) => Promise<void>;
  onAddReaction?: (transactionId: string, emoji: string) => Promise<void>;
  onRemoveReaction?: (transactionId: string) => Promise<void>;
  onAddComment?: (transactionId: string, text: string) => Promise<void>;
  highlightTransactionId?: string | null;
}

export function GroupTransactionsList({ 
  groupId,
  transactions, 
  isLoading,
  members = [],
  onUpdateTransaction,
  onDeleteTransaction,
  onAddReaction,
  onRemoveReaction,
  onAddComment,
  highlightTransactionId
}: GroupTransactionsListProps) {
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Extraer categorías únicas
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach(t => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats).sort();
  }, [transactions]);

  // Aplicar filtros y ordenar por fecha (más reciente primero)
  const filteredTransactions = useMemo(() => {
    console.log('📊 Original transactions order:', transactions.map(t => ({ 
      date: t.transactionDate, 
      desc: t.description 
    })));
    
    const filtered = transactions.filter(transaction => {
      // Filtro por tipo
      if (filters.type && filters.type !== 'all' && transaction.transactionType !== filters.type) {
        return false;
      }

      // Filtro por categoría
      if (filters.category && transaction.category !== filters.category) {
        return false;
      }

      // Filtro por fecha desde
      if (filters.startDate) {
        const txDate = new Date(transaction.transactionDate);
        const startDate = new Date(filters.startDate);
        if (txDate < startDate) return false;
      }

      // Filtro por fecha hasta
      if (filters.endDate) {
        const txDate = new Date(transaction.transactionDate);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Incluir todo el día
        if (txDate > endDate) return false;
      }

      // Filtro por usuario
      if (filters.sharedByUserId && transaction.sharedByUserId !== filters.sharedByUserId) {
        return false;
      }

      // Filtro por búsqueda de texto
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const description = (transaction.description || '').toLowerCase();
        const category = (transaction.category || '').toLowerCase();
        const subcategory = (transaction.subcategory || '').toLowerCase();
        if (!description.includes(searchLower) && !category.includes(searchLower) && !subcategory.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });

    // Ordenar por fecha descendente (más reciente primero)
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.transactionDate).getTime();
      const dateB = new Date(b.transactionDate).getTime();
      return dateB - dateA; // Descendente
    });
    
    console.log('📊 After sorting (should be newest first):', sorted.map(t => ({ 
      date: t.transactionDate, 
      desc: t.description,
      timestamp: new Date(t.transactionDate).getTime()
    })));
    
    return sorted;
  }, [transactions, filters]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
  const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambian los filtros
  useMemo(() => {
    setCurrentPage(1);
  }, [filters]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <TransactionFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        categories={uniqueCategories}
        members={members}
      />

      {/* Lista de transacciones */}
      {filteredTransactions.length === 0 ? (
        filters.type !== 'all' || filters.category || filters.searchText || filters.startDate || filters.endDate || filters.sharedByUserId ? (
          <EmptyStateFiltered onClearFilters={() => setFilters({ type: 'all' })} />
        ) : (
          <EmptyState />
        )
      ) : (
        <>
          {/* Contador de resultados */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {filteredTransactions.length === transactions.length
                ? `${transactions.length} ${transactions.length === 1 ? 'transacción' : 'transacciones'}`
                : `${filteredTransactions.length} de ${transactions.length} transacciones`
              }
            </span>
            {totalPages > 1 && (
              <span>
                Página {currentPage} de {totalPages}
              </span>
            )}
          </div>

          {/* Transacciones */}
          <div className="space-y-3">
            {paginatedTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TransactionCard 
                  groupId={groupId}
                  transaction={transaction}
                  onUpdateTransaction={onUpdateTransaction}
                  onDeleteTransaction={onDeleteTransaction}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                  onAddComment={onAddComment}
                  isHighlighted={highlightTransactionId === transaction.id}
                />
              </motion.div>
            ))}
          </div>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // Mostrar solo páginas cercanas a la actual
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 || 
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-gray-500 dark:text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Página siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Estado vacío - sin transacciones
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        No hay transacciones
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
        Comparte la primera transacción con tu grupo
      </p>
    </div>
  );
}

/**
 * Estado vacío - filtros sin resultados
 */
function EmptyStateFiltered({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-orange-500 dark:text-orange-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        No se encontraron transacciones
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mb-4">
        No hay transacciones que coincidan con los filtros seleccionados
      </p>
      <button
        onClick={onClearFilters}
        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
