/**
 * 💸 SHARE TRANSACTION MODAL
 * 
 * Modal para compartir una transacción en el grupo.
 */

import React, { useState, useMemo } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FamilyGroupWithMembers, TransactionType } from '../types/family.types';
import { useGroupTransactions } from '../hooks/useGroupTransactions';
import { validateAmount } from '../services/family.service';
import { toast } from 'sonner@2.0.3';
import { useApp } from '../../../contexts/AppContext';
import { getTodayLocalDate } from '../../../utils/dateUtils'; // ✅ Import getTodayLocalDate

interface ShareTransactionModalProps {
  group: FamilyGroupWithMembers;
  onClose: () => void;
  onSuccess: () => void;
}

export function ShareTransactionModal({ 
  group, 
  onClose, 
  onSuccess 
}: ShareTransactionModalProps) {
  const { shareTransaction } = useGroupTransactions({ 
    groupId: group.id,
    autoLoad: false 
  });
  const { categories } = useApp();

  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    amount: '',
    categoryId: '',
    subcategoryId: '',
    description: '',
    date: getTodayLocalDate(), // ✅ Use local date
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener categorías filtradas por tipo
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => cat.type === formData.type);
  }, [categories, formData.type]);

  // Obtener subcategorías de la categoría seleccionada
  const availableSubcategories = useMemo(() => {
    if (!formData.categoryId) return [];
    const category = categories.find(cat => cat.id === formData.categoryId);
    return category?.subcategories || [];
  }, [categories, formData.categoryId]);

  // Limpiar subcategoría si cambia la categoría
  const handleCategoryChange = (categoryId: string) => {
    setFormData({ 
      ...formData, 
      categoryId,
      subcategoryId: '' // Limpiar subcategoría
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar monto
    const amount = parseFloat(formData.amount);
    const validation = validateAmount(amount);
    if (!validation.valid) {
      setError(validation.error || 'Monto inválido');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Obtener nombres de categoría y subcategoría
      let categoryName: string | null = null;
      let subcategoryName: string | null = null;

      if (formData.categoryId) {
        const category = categories.find(cat => cat.id === formData.categoryId);
        if (category) {
          categoryName = category.name;
          
          if (formData.subcategoryId && category.subcategories) {
            const subcategory = category.subcategories.find(
              sub => sub.id === formData.subcategoryId
            );
            if (subcategory) {
              subcategoryName = subcategory.name;
            }
          }
        }
      }

      await shareTransaction({
        type: formData.type,
        amount,
        category: categoryName,
        subcategory: subcategoryName,
        description: formData.description || null,
        date: formData.date,
        visibility: 'all',
      });

      toast.success('✅ ¡Transacción grupal creada!', {
        description: 'Todos los miembros del grupo pueden verla ahora',
      });

      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear transacción';
      setError(errorMessage);
      toast.error('❌ Error al crear transacción grupal', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Nueva Transacción Grupal
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {group.emoji} {group.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-5" id="share-transaction-form">
            
            {/* 💡 Mensaje informativo */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 text-lg">💡</span>
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  <strong>Transacción exclusiva del grupo:</strong> Esta transacción solo será visible en el grupo y no afectará tus cuentas personales.
                </p>
              </div>
            </div>
            
            {/* Tipo de transacción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`
                    px-4 py-3 rounded-lg font-medium transition-all
                    ${formData.type === 'expense'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-2 ring-red-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  💸 Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`
                    px-4 py-3 rounded-lg font-medium transition-all
                    ${formData.type === 'income'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-2 ring-green-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  💰 Ingreso
                </button>
              </div>
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monto
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    setError(null);
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  step="0.01"
                  min="0"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría <span className="text-gray-400 dark:text-gray-500">(opcional)</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
                >
                  <option value="">Sin categoría</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subcategoría */}
            {formData.categoryId && availableSubcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subcategoría <span className="text-gray-400 dark:text-gray-500">(opcional)</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                  <select
                    value={formData.subcategoryId}
                    onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Sin subcategoría</option>
                    {availableSubcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Escribe una descripción..."
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={200}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.description.length}/200
              </p>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-emerald-50 dark:from-emerald-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Vista Previa:</p>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {formData.description || (() => {
                      const category = categories.find(c => c.id === formData.categoryId);
                      const subcategory = category?.subcategories?.find(s => s.id === formData.subcategoryId);
                      if (category || subcategory) {
                        return `${category?.name || ''}${category && subcategory ? ' · ' : ''}${subcategory?.name || ''}`;
                      }
                      return 'Sin descripción';
                    })()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {(() => {
                      const category = categories.find(c => c.id === formData.categoryId);
                      const subcategory = category?.subcategories?.find(s => s.id === formData.subcategoryId);
                      if (category || subcategory) {
                        return `${category?.icon || ''} ${category?.name || ''}${category && subcategory ? ' · ' : ''}${subcategory?.name || ''}`;
                      }
                      return 'Sin categoría';
                    })()}
                  </p>
                </div>
                <p className={`text-xl font-bold flex-shrink-0 ${
                  formData.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                }`}>
                  {formData.type === 'expense' && '-'}
                  {formData.type === 'income' && '+'}
                  ${parseFloat(formData.amount || '0').toLocaleString()}
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}
            </form>
          </div>

          {/* Botones fijos en la parte inferior */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-2xl">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="share-transaction-form"
                disabled={isSubmitting || !formData.amount}
                className="flex-1 px-4 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? 'Compartiendo...' : 'Compartir'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}