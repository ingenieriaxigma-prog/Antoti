/**
 * ✏️ EDIT TRANSACTION MODAL
 * 
 * Modal para editar una transacción grupal.
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GroupTransactionWithDetails, TransactionType } from '../types/family.types';
import { toast } from 'sonner@2.0.3';

interface EditTransactionModalProps {
  transaction: GroupTransactionWithDetails;
  onClose: () => void;
  onSave: (updates: {
    amount: number;
    description: string;
    category: string | null;
    subcategory: string | null;
    transactionType: TransactionType;
    transactionDate: string;
  }) => Promise<void>;
}

export function EditTransactionModal({ transaction, onClose, onSave }: EditTransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: transaction.amount,
    description: transaction.description || '',
    category: transaction.category || '',
    subcategory: transaction.subcategory || '',
    transactionType: transaction.transactionType,
    transactionDate: transaction.transactionDate.split('T')[0], // Solo la fecha
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.amount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    if (!formData.description.trim() && !formData.category.trim()) {
      toast.error('Debes proporcionar una descripción o categoría');
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        amount: formData.amount,
        description: formData.description.trim() || null,
        category: formData.category.trim() || null,
        subcategory: formData.subcategory.trim() || null,
        transactionType: formData.transactionType,
        transactionDate: formData.transactionDate,
      });

      toast.success('Transacción actualizada');
      onClose();
    } catch (error) {
      toast.error('Error al actualizar transacción');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Editar Transacción</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de transacción
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['expense', 'income', 'transfer'] as TransactionType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, transactionType: type }))}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${formData.transactionType === type
                        ? type === 'expense' ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                        : type === 'income' ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                        : 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {type === 'expense' ? 'Gasto' : type === 'income' ? 'Ingreso' : 'Transferencia'}
                  </button>
                ))}
              </div>
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Ej: Compra en supermercado"
                maxLength={200}
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Ej: Alimentación"
                maxLength={100}
              />
            </div>

            {/* Subcategoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategoría (opcional)
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Ej: Supermercado"
                maxLength={100}
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={formData.transactionDate}
                onChange={(e) => setFormData(prev => ({ ...prev, transactionDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
