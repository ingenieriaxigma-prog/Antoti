import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Category, Subcategory } from '../types';
import { toast } from 'sonner@2.0.3';

interface CategoryManagementModalProps {
  categories: Category[];
  transactionType: 'income' | 'expense' | 'transfer';
  onClose: () => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => void;
  onDeleteCategory: (categoryId: string) => boolean;
}

const colorOptions = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
  '#06b6d4', '#f43f5e', '#84cc16', '#f97316', '#14b8a6', '#a855f7',
];

export default function CategoryManagementModal({
  categories,
  transactionType,
  onClose,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagementModalProps) {
  const [view, setView] = useState<'list' | 'edit-category' | 'subcategories'>('list');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [subcategoriesEnabled, setSubcategoriesEnabled] = useState(true);
  
  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [categoryEmoji, setCategoryEmoji] = useState('');
  const [categoryColor, setCategoryColor] = useState(colorOptions[0]);
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subcategoryEmoji, setSubcategoryEmoji] = useState('');
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);

  const filteredCategories = categories.filter(c => c.type === transactionType);

  const handleAddCategory = () => {
    if (!categoryName.trim()) {
      toast.error('Por favor ingresa un nombre');
      return;
    }
    onAddCategory({
      name: categoryName.trim(),
      emoji: categoryEmoji.trim() || undefined,
      color: categoryColor,
      type: transactionType,
      subcategories: [],
    });
    toast.success('Categoría creada');
    setCategoryName('');
    setCategoryEmoji('');
    setCategoryColor(colorOptions[0]);
    setView('list');
  };

  const handleUpdateCategory = () => {
    if (!selectedCategory || !categoryName.trim()) {
      toast.error('Por favor ingresa un nombre');
      return;
    }
    onUpdateCategory(selectedCategory.id, {
      name: categoryName.trim(),
      emoji: categoryEmoji.trim() || undefined,
      color: categoryColor,
    });
    toast.success('Categoría actualizada');
    setView('list');
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (onDeleteCategory(categoryId)) {
      toast.success('Categoría eliminada');
    } else {
      toast.error('No se puede eliminar', {
        description: 'La categoría tiene transacciones asociadas',
      });
    }
  };

  const handleAddSubcategory = () => {
    if (!selectedCategory || !subcategoryName.trim()) {
      toast.error('Por favor ingresa un nombre');
      return;
    }
    const newSubcategory: Subcategory = {
      id: crypto.randomUUID(),
      name: subcategoryName.trim(),
      categoryId: selectedCategory.id,
      emoji: subcategoryEmoji.trim() || undefined,
    };
    onUpdateCategory(selectedCategory.id, {
      subcategories: [...(selectedCategory.subcategories || []), newSubcategory],
    });
    toast.success('Subcategoría creada');
    setSubcategoryName('');
    setSubcategoryEmoji('');
    // Update local state
    setSelectedCategory({
      ...selectedCategory,
      subcategories: [...(selectedCategory.subcategories || []), newSubcategory],
    });
  };

  const handleUpdateSubcategory = () => {
    if (!selectedCategory || !editingSubcategoryId || !subcategoryName.trim()) {
      toast.error('Por favor ingresa un nombre');
      return;
    }
    const updatedSubcategories = selectedCategory.subcategories?.map(sub =>
      sub.id === editingSubcategoryId
        ? { ...sub, name: subcategoryName.trim(), emoji: subcategoryEmoji.trim() || undefined }
        : sub
    );
    onUpdateCategory(selectedCategory.id, {
      subcategories: updatedSubcategories,
    });
    toast.success('Subcategoría actualizada');
    setSubcategoryName('');
    setSubcategoryEmoji('');
    setEditingSubcategoryId(null);
    // Update local state
    setSelectedCategory({
      ...selectedCategory,
      subcategories: updatedSubcategories,
    });
  };

  const handleDeleteSubcategory = (subcategoryId: string) => {
    if (!selectedCategory) return;
    const updatedSubcategories = selectedCategory.subcategories?.filter(sub => sub.id !== subcategoryId);
    onUpdateCategory(selectedCategory.id, {
      subcategories: updatedSubcategories,
    });
    toast.success('Subcategoría eliminada');
    // Update local state
    setSelectedCategory({
      ...selectedCategory,
      subcategories: updatedSubcategories,
    });
  };

  const startEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryEmoji(category.emoji || '');
    setCategoryColor(category.color);
    setView('edit-category');
  };

  const startEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategoryId(subcategory.id);
    setSubcategoryName(subcategory.name);
    setSubcategoryEmoji(subcategory.emoji || '');
  };

  // ✅ NUEVO: Helper para convertir color hex a pastel (opacity 12%)
  const getPastelBackground = (color: string) => {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.12)`;
    }
    return color;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white dark:bg-gray-900 w-full max-h-[85vh] rounded-t-3xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {view !== 'list' ? (
              <button
                onClick={() => {
                  setView('list');
                  setSelectedCategory(null);
                  setCategoryName('');
                  setCategoryEmoji('');
                  setSubcategoryName('');
                  setSubcategoryEmoji('');
                  setEditingSubcategoryId(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg -ml-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg -ml-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <h2 className="text-gray-900 dark:text-white">
              {view === 'list' && `${transactionType === 'income' ? 'Ingresos' : 'Gastos'}`}
              {view === 'edit-category' && (selectedCategory ? 'Editar Categoría' : 'Nueva Categoría')}
              {view === 'subcategories' && selectedCategory?.name}
            </h2>
            {view === 'list' ? (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCategoryName('');
                  setCategoryEmoji('');
                  setCategoryColor(colorOptions[0]);
                  setView('edit-category');
                }}
                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </button>
            ) : view === 'edit-category' ? (
              <div className="w-9" />
            ) : (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCategoryName('');
                  setCategoryEmoji('');
                  setCategoryColor(colorOptions[0]);
                  setView('edit-category');
                }}
                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Category List */}
          {view === 'list' && (
            <div className="p-6">
              {/* Subcategories Toggle */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-gray-900 dark:text-white">Subcategorías</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Organiza mejor tus transacciones
                  </p>
                </div>
                <button
                  onClick={() => setSubcategoriesEnabled(!subcategoriesEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    subcategoriesEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      subcategoriesEnabled ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Categories List */}
              <div className="space-y-2">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-4">
                      <button className="cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setView('subcategories');
                        }}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: getPastelBackground(category.color) }}
                        >
                          {category.emoji ? (
                            <span className="text-xl">{category.emoji}</span>
                          ) : (
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 dark:text-white">
                              {category.name}
                              {(category.subcategories?.length || 0) > 0 && (
                                <span className="text-gray-500 dark:text-gray-400">
                                  ({category.subcategories?.length})
                                </span>
                              )}
                            </span>
                          </div>
                          {(category.subcategories?.length || 0) > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {category.subcategories?.slice(0, 3).map(s => s.name).join(', ')}
                              {(category.subcategories?.length || 0) > 3 && '...'}
                            </p>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditCategory(category)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredCategories.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No hay categorías. Presiona + para agregar una.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit Category Form */}
          {view === 'edit-category' && (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Emoji (opcional)
                </label>
                <input
                  type="text"
                  value={categoryEmoji}
                  onChange={(e) => setCategoryEmoji(e.target.value)}
                  placeholder="😀 🍕 🚗"
                  maxLength={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-2xl text-center"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Nombre</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ej: Comida, Transporte..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCategoryColor(color)}
                      className={`w-full h-10 rounded-lg transition-all ${
                        categoryColor === color
                          ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={selectedCategory ? handleUpdateCategory : handleAddCategory}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                {selectedCategory ? 'Guardar' : 'Crear Categoría'}
              </button>
            </div>
          )}

          {/* Edit Subcategories */}
          {view === 'subcategories' && selectedCategory && (
            <div className="p-6 space-y-4">
              {/* Add/Edit Subcategory Form */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                <h3 className="text-gray-900 dark:text-white">
                  {editingSubcategoryId ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
                </h3>
                <input
                  type="text"
                  value={subcategoryEmoji}
                  onChange={(e) => setSubcategoryEmoji(e.target.value)}
                  placeholder="Emoji (opcional)"
                  maxLength={4}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-2xl text-center"
                />
                <input
                  type="text"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  placeholder="Nombre de subcategoría"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
                <div className="flex gap-2">
                  {editingSubcategoryId && (
                    <button
                      onClick={() => {
                        setEditingSubcategoryId(null);
                        setSubcategoryName('');
                        setSubcategoryEmoji('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={editingSubcategoryId ? handleUpdateSubcategory : handleAddSubcategory}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    {editingSubcategoryId ? 'Guardar' : 'Agregar'}
                  </button>
                </div>
              </div>

              {/* Subcategories List */}
              <div className="space-y-2">
                <h3 className="text-gray-900 dark:text-white">Subcategorías</h3>
                {(!selectedCategory.subcategories || selectedCategory.subcategories.length === 0) ? (
                  <p className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    No hay subcategorías
                  </p>
                ) : (
                  selectedCategory.subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-3"
                    >
                      <button className="cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                      </button>
                      {subcategory.emoji && (
                        <span className="text-xl">{subcategory.emoji}</span>
                      )}
                      <span className="flex-1 text-gray-900 dark:text-white">
                        {subcategory.name}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditSubcategory(subcategory)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubcategory(subcategory.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}