/**
 * TransactionItem
 * 
 * Componente individual de transacción optimizado con React.memo.
 * Solo se re-renderiza si sus props cambian.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Share2, Trash2, TrendingUp, TrendingDown, ArrowLeftRight, FileImage, ExternalLink } from 'lucide-react';
import { Transaction } from '../../types';
import { QuickShareButton } from '../../features/family/components/QuickShareButton';

interface TransactionItemProps {
  transaction: Transaction;
  categoryName: string;
  subcategoryName?: string; // ✅ NUEVO: Nombre de subcategoría
  categoryColor?: string; // ✅ AGREGADO
  categoryEmoji?: string; // ✅ AGREGADO
  accountName: string;
  toAccountName?: string; // ✅ AGREGADO
  formatCurrency: (amount: number) => string;
  formatDate?: (date: string) => string; // ✅ OPCIONAL
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  index?: number; // ✅ OPCIONAL
}

function TransactionItem({
  transaction,
  categoryName,
  subcategoryName,
  categoryColor,
  categoryEmoji,
  accountName,
  toAccountName,
  formatCurrency,
  formatDate = (date) => date, // ✅ DEFAULT: Return date as-is if no formatter provided
  onEdit,
  onDelete,
  index = 0, // ✅ DEFAULT VALUE
}: TransactionItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // ✅ NUEVO: Helper para convertir color hex a pastel (opacity 12%)
  const getPastelBackground = (color: string | undefined) => {
    if (!color) return 'rgba(107, 114, 128, 0.12)'; // gray-500 default
    
    // Si es un color hex, convertir a rgba con opacity
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.12)`;
    }
    
    // Si ya tiene alpha, retornar
    return color;
  };

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'income':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'expense':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'transfer':
        return <ArrowLeftRight className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getAmountColor = () => {
    switch (transaction.type) {
      case 'income':
        return 'text-green-600 dark:text-green-400';
      case 'expense':
        return 'text-red-600 dark:text-red-400';
      case 'transfer':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowShareDialog(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(transaction.id);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          delay: index * 0.08, // 🎨 Stagger animation: 80ms delay entre items
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1] // Cubic bezier para suavidad
        }}
        onClick={() => onEdit(transaction.id)}
        className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer relative"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Icon - Mostrar emoji de la categoría */}
            <div 
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: getPastelBackground(categoryColor) }}
            >
              <span className="text-2xl">{categoryEmoji || '💸'}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Título: Siempre la categoría - permite 2 líneas */}
              <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                {categoryName}
              </p>
              {/* Subtítulo: Subcategoría > Nota > Categoría (fallback) */}
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {subcategoryName || transaction.note || categoryName}
              </p>
              {/* Cuenta y fecha */}
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {accountName} • {formatDate(transaction.date)}
              </p>
              {/* Comprobante adjunto */}
              {transaction.receiptUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(transaction.receiptUrl!, '_blank');
                  }}
                  className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FileImage className="w-3 h-3" />
                  Ver comprobante
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>

          {/* Amount & Menu Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <p className={`font-bold ${getAmountColor()}`}>
                {transaction.type === 'income' && '+'}
                {transaction.type === 'expense' && '-'}
                {formatCurrency(Math.abs(transaction.amount))}
              </p>
            </div>

            {/* Menu de tres puntos */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Más opciones"
              >
                <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Dropdown menu */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                  >
                    <button
                      onClick={handleShare}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-gray-700 dark:text-gray-300">Compartir</span>
                    </button>

                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-gray-700 dark:text-gray-300">Eliminar</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de compartir - usando QuickShareButton en modo modal */}
      {showShareDialog && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowShareDialog(false);
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Compartir Transacción
            </h3>
            <QuickShareButton 
              transaction={transaction} 
              compact={false}
              onShared={() => setShowShareDialog(false)}
            />
            <button
              onClick={() => setShowShareDialog(false)}
              className="mt-4 w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Memoizar para evitar re-renders innecesarios
export default React.memo(TransactionItem, (prevProps, nextProps) => {
  return (
    prevProps.transaction.id === nextProps.transaction.id &&
    prevProps.transaction.amount === nextProps.transaction.amount &&
    prevProps.transaction.note === nextProps.transaction.note &&
    prevProps.transaction.date === nextProps.transaction.date &&
    prevProps.transaction.type === nextProps.transaction.type &&
    prevProps.categoryName === nextProps.categoryName &&
    prevProps.subcategoryName === nextProps.subcategoryName &&
    prevProps.accountName === nextProps.accountName
  );
});
