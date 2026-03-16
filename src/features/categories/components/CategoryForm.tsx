/**
 * CategoryForm Component
 * 
 * Inline form for creating/editing categories
 */

import { TrendingUp, TrendingDown } from 'lucide-react';
import type { CategoryFormProps } from '../types';

export function CategoryForm({
  show,
  editingCategory,
  categoryName,
  categoryEmoji,
  categoryType,
  categoryColor,
  onCategoryNameChange,
  onCategoryEmojiChange,
  onCategoryTypeChange,
  onCategoryColorChange,
  onSubmit,
  onClose,
  colorOptions,
}: CategoryFormProps) {
  if (!show) return null;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-800">
      <h3 className="text-gray-900 dark:text-white mb-4">
        {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
      </h3>

      {/* Type Selection */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
          Tipo
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onCategoryTypeChange('income')}
            disabled={editingCategory !== null}
            type="button"
            className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${
              categoryType === 'income'
                ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500 text-green-700 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            } ${editingCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Ingreso</span>
          </button>
          <button
            onClick={() => onCategoryTypeChange('expense')}
            disabled={editingCategory !== null}
            type="button"
            className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${
              categoryType === 'expense'
                ? 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-500 text-red-700 dark:text-red-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            } ${editingCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Gasto</span>
          </button>
        </div>
      </div>

      {/* Emoji Input */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
          Emoji (opcional)
        </label>
        <input
          type="text"
          value={categoryEmoji}
          onChange={(e) => onCategoryEmojiChange(e.target.value)}
          placeholder="😀 🍕 🚗 💼"
          maxLength={4}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-2xl text-center"
        />
      </div>

      {/* Name Input */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
          Nombre
        </label>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => onCategoryNameChange(e.target.value)}
          placeholder="Ej: Comida, Transporte, Salario..."
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
        />
      </div>

      {/* Color Selection */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
          Color
        </label>
        <div className="grid grid-cols-6 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onCategoryColorChange(color)}
              className={`w-full h-10 rounded-lg transition-all ${
                categoryColor === color
                  ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onClose}
          type="button"
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          type="button"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          {editingCategory ? 'Guardar' : 'Crear'}
        </button>
      </div>
    </div>
  );
}
