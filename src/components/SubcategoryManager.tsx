import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { Category, Subcategory } from '../types';
import { toast } from 'sonner@2.0.3';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface SubcategoryManagerProps {
  category: Category;
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => void;
  onNavigate: (screen: string) => void;
}

export default function SubcategoryManager({
  category,
  onUpdateCategory,
  onNavigate,
}: SubcategoryManagerProps) {
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subcategoryEmoji, setSubcategoryEmoji] = useState('');
  const [deleteSubcategoryId, setDeleteSubcategoryId] = useState<string | null>(null);
  const [subcategoriesEnabled, setSubcategoriesEnabled] = useState(
    (category.subcategories?.length || 0) > 0
  );

  const handleAddSubcategory = () => {
    if (!subcategoryName.trim()) {
      toast.error('Por favor ingresa un nombre');
      return;
    }

    const newSubcategory: Subcategory = {
      id: crypto.randomUUID(), // Generate UUID v4
      name: subcategoryName.trim(),
      categoryId: category.id,
    };

    const updatedSubcategories = [...(category.subcategories || []), newSubcategory];
    onUpdateCategory(category.id, { subcategories: updatedSubcategories });
    
    setSubcategoryName('');
    setSubcategoryEmoji('');
    setIsAddingSubcategory(false);
    toast.success('Subcategoría creada');
  };

  const handleUpdateSubcategory = () => {
    if (!editingSubcategoryId || !subcategoryName.trim()) {
      toast.error('El nombre de la subcategoría es requerido');
      return;
    }

    const updatedSubcategories = category.subcategories?.map((sub) =>
      sub.id === editingSubcategoryId
        ? { ...sub, name: subcategoryName.trim(), emoji: subcategoryEmoji.trim() || undefined }
        : sub
    );

    onUpdateCategory(category.id, { subcategories: updatedSubcategories });
    
    setSubcategoryName('');
    setSubcategoryEmoji('');
    setEditingSubcategoryId(null);
    toast.success('Subcategoría actualizada');
  };

  const handleDeleteSubcategory = () => {
    if (!deleteSubcategoryId) return;

    const updatedSubcategories = category.subcategories?.filter(
      (sub) => sub.id !== deleteSubcategoryId
    );

    onUpdateCategory(category.id, { subcategories: updatedSubcategories });
    setDeleteSubcategoryId(null);
    toast.success('Subcategoría eliminada');
  };

  const startEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategoryId(subcategory.id);
    setSubcategoryName(subcategory.name);
    setSubcategoryEmoji(subcategory.emoji || '');
  };

  const cancelEdit = () => {
    setIsAddingSubcategory(false);
    setEditingSubcategoryId(null);
    setSubcategoryName('');
    setSubcategoryEmoji('');
  };

  const toggleSubcategories = (enabled: boolean) => {
    setSubcategoriesEnabled(enabled);
    if (!enabled && category.subcategories && category.subcategories.length > 0) {
      // Optionally clear subcategories when disabled
      // onUpdateCategory(category.id, { subcategories: [] });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('categories')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg -ml-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-gray-900 dark:text-white">{category.name}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gestionar subcategorías</p>
          </div>
          <button
            onClick={() => setIsAddingSubcategory(true)}
            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Toggle Subcategories */}
        <div className="bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 dark:text-white">Subcategorías</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Organiza mejor tus transacciones
              </p>
            </div>
            <button
              onClick={() => toggleSubcategories(!subcategoriesEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                subcategoriesEnabled
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  subcategoriesEnabled ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(isAddingSubcategory || editingSubcategoryId) && (
          <div className="bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-900 dark:text-white mb-3">
              {editingSubcategoryId ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Emoji (opcional)
                </label>
                <input
                  type="text"
                  value={subcategoryEmoji}
                  onChange={(e) => setSubcategoryEmoji(e.target.value)}
                  placeholder="😀 🍕 🚗"
                  maxLength={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-2xl text-center"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  placeholder="Ej: Restaurantes, Uber, Netflix..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingSubcategoryId ? handleUpdateSubcategory : handleAddSubcategory}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {editingSubcategoryId ? 'Guardar' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subcategories List */}
        {subcategoriesEnabled && (
          <div className="p-6">
            {!category.subcategories || category.subcategories.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No hay subcategorías
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Presiona + para agregar una subcategoría
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {category.subcategories.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <button className="cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                      </button>

                      {subcategory.emoji && (
                        <span className="text-2xl">{subcategory.emoji}</span>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white">
                          {subcategory.name}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditSubcategory(subcategory)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => setDeleteSubcategoryId(subcategory.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteSubcategoryId !== null}
        onOpenChange={() => setDeleteSubcategoryId(null)}
      >
        <AlertDialogContent className="bg-white dark:bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">
              ¿Eliminar subcategoría?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              Esta acción no se puede deshacer. La subcategoría será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteSubcategory();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}