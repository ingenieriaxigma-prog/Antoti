/**
 * CategoriesScreen Component
 * 
 * Main screen for managing categories
 * 
 * Features:
 * - View income and expense categories
 * - Add/Edit/Delete categories
 * - Manage subcategories
 * - Color and emoji customization
 */

import { useState } from 'react';
import { ArrowLeft, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import BottomNav from '../../../components/BottomNav';
import SpeedDial from '../../../components/dashboard/SpeedDial'; // ✅ NEW: Import SpeedDial
import { ThemeHeaderEffects } from '../../../components/ThemeHeaderEffects'; // 🎨 Import theme effects
import { OtiSpacerMessage } from '../../../components/OtiSpacerMessage'; // 📱 WhatsApp-style spacer
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { CategoryForm } from './CategoryForm';
import { CategoryList } from './CategoryList';
import { CategoryService } from '../services';
import type { Category, CategoriesScreenProps, CategoryType } from '../types';

export function CategoriesScreen({ 
  categories, 
  onAddCategory, 
  onUpdateCategory, 
  onDeleteCategory, 
  onNavigate,
  onSelectCategory 
}: CategoriesScreenProps) {
  // State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<CategoryType>('expense');
  const [newCategoryColor, setNewCategoryColor] = useState(CategoryService.getDefaultColor());

  const colorOptions = CategoryService.getColorOptions();

  // Handlers
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Por favor ingresa un nombre para la categoría');
      return;
    }

    // Check for duplicate name
    if (CategoryService.isDuplicateName(newCategoryName, newCategoryType, categories)) {
      toast.error('Ya existe una categoría con ese nombre');
      return;
    }

    onAddCategory({
      name: newCategoryName.trim(),
      type: newCategoryType,
      icon: 'circle',
      color: newCategoryColor,
      emoji: newCategoryEmoji.trim() || undefined,
      subcategories: [],
    });

    toast.success('Categoría creada');
    handleCloseForm();
  };

  const handleEditCategory = (category: Category) => {
    // ✅ Protección contra edición de categorías del sistema
    if (category.isSystem) {
      toast.error('No se puede editar', {
        description: '💰 "Saldo Inicial" es una categoría del sistema y no puede ser modificada.',
        duration: 5000,
      });
      return;
    }
    
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryEmoji(category.emoji || '');
    setNewCategoryType(category.type);
    setNewCategoryColor(category.color);
    setShowAddForm(true);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) {
      toast.error('Por favor ingresa un nombre para la categoría');
      return;
    }

    onUpdateCategory(editingCategory.id, {
      name: newCategoryName.trim(),
      type: newCategoryType,
      color: newCategoryColor,
      emoji: newCategoryEmoji.trim() || undefined,
    });

    toast.success('Categoría actualizada');
    handleCloseForm();
  };

  const handleDeleteCategory = () => {
    if (!deleteCategoryId) return;

    // ✅ Protección contra borrado de categorías del sistema
    const categoryToDelete = categories.find(c => c.id === deleteCategoryId);
    if (categoryToDelete?.isSystem) {
      toast.error('No se puede eliminar', {
        description: '💰 "Saldo Inicial" es una categoría del sistema necesaria para la trazabilidad.',
        duration: 5000,
      });
      setDeleteCategoryId(null);
      return;
    }

    const success = onDeleteCategory(deleteCategoryId);
    if (success) {
      // Clear any states that might reference the deleted category
      if (editingCategory?.id === deleteCategoryId) {
        setEditingCategory(null);
        setShowAddForm(false);
      }
      toast.success('Categoría eliminada');
    } else {
      toast.error('No se puede eliminar', {
        description: 'La categoría tiene transacciones asociadas',
      });
    }
    setDeleteCategoryId(null);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryEmoji('');
    setNewCategoryColor(CategoryService.getDefaultColor());
  };

  // Filter categories by type
  const incomeCategories = CategoryService.getIncomeCategories(categories);
  const expenseCategories = CategoryService.getExpenseCategories(categories);
  
  // Get current theme from localStorage
  const theme = localStorage.getItem('colorTheme') || 'blue';

  return (
    <div className="flex flex-col mobile-screen-height bg-gray-50 dark:bg-gray-950 prevent-overscroll relative">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg -ml-2 transition-colors"
            aria-label="Back to settings"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-gray-900 dark:text-white">Categorías</h1>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingCategory(null);
            }}
            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            aria-label="Add category"
          >
            <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Add/Edit Form */}
        <CategoryForm
          show={showAddForm}
          editingCategory={editingCategory}
          categoryName={newCategoryName}
          categoryEmoji={newCategoryEmoji}
          categoryType={newCategoryType}
          categoryColor={newCategoryColor}
          onCategoryNameChange={setNewCategoryName}
          onCategoryEmojiChange={setNewCategoryEmoji}
          onCategoryTypeChange={setNewCategoryType}
          onCategoryColorChange={setNewCategoryColor}
          onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
          onClose={handleCloseForm}
          colorOptions={colorOptions}
        />

        {/* Categories Lists */}
        <div className="p-6 space-y-6">
          {/* Expense Categories */}
          <CategoryList
            title="Gastos"
            categories={expenseCategories}
            icon={TrendingDown}
            onEdit={handleEditCategory}
            onDelete={(id) => setDeleteCategoryId(id)}
            onSelect={onSelectCategory}
          />

          {/* Income Categories */}
          <CategoryList
            title="Ingresos"
            categories={incomeCategories}
            icon={TrendingUp}
            onEdit={handleEditCategory}
            onDelete={(id) => setDeleteCategoryId(id)}
            onSelect={onSelectCategory}
          />
          
          {/* WhatsApp-style Spacer */}
          <OtiSpacerMessage
            message="Has visto todas tus categorías. Pregúntale a Oti sobre cómo organizarlas"
            show={categories.length > 0}
          />
        </div>
      </div>

      {/* Oti FAB - Chat + Crear Manual */}
      <div className="absolute bottom-20 right-6 z-40">
        <SpeedDial
          context="categories"
          onChatClick={() => onNavigate('oti-chat')}
          onManualClick={() => {
            setShowAddForm(true);
            setEditingCategory(null);
          }}
          theme={theme}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="categories" onNavigate={onNavigate} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteCategoryId !== null} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent className="bg-white dark:bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">
              ¿Eliminar categoría?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              Esta acción no se puede deshacer. La categoría y sus subcategorías serán eliminadas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-0" 
              onClick={() => setDeleteCategoryId(null)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteCategory();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}