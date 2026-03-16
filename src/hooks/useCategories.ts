/**
 * Custom Hooks - Category Management
 * 
 * Hook for managing category operations with backend sync.
 */

import { useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { useApp } from '../contexts/AppContext';
import { Category } from '../types';
import { saveCategories } from '../utils/api/categories';
import { saveBudgets } from '../utils/api/budgets';

export function useCategories() {
  const { categories, transactions, budgets, setCategories, setBudgets } = useApp();

  /**
   * Add a new category
   */
  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory = {
      ...category,
      id: crypto.randomUUID(), // Generate UUID v4
    };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    
    // SAVE to Supabase immediately
    saveCategories(updatedCategories).catch(error => {
      console.error('Error saving categories:', error);
      toast.error('Error al guardar categoría');
    });
  }, [categories, setCategories]);

  /**
   * Update an existing category
   */
  const updateCategory = useCallback((categoryId: string, updates: Partial<Category>) => {
    const updatedCategories = categories.map(cat => 
      cat.id === categoryId ? { ...cat, ...updates } : cat
    );
    setCategories(updatedCategories);
    
    // SAVE to Supabase immediately
    saveCategories(updatedCategories).catch(error => {
      console.error('Error saving categories:', error);
      toast.error('Error al actualizar categoría');
    });
  }, [categories, setCategories]);

  /**
   * Delete a category
   * Returns false if category has transactions (cannot delete)
   * Also deletes associated budgets
   */
  const deleteCategory = useCallback((categoryId: string): boolean => {
    // Check if category has transactions
    const hasTransactions = transactions.some(t => t.category === categoryId);
    
    if (hasTransactions) {
      return false; // Cannot delete category with transactions
    }
    
    // Delete associated budgets
    const updatedBudgets = budgets.filter(b => b.categoryId !== categoryId);
    setBudgets(updatedBudgets);
    
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);
    
    // ❌ OLD: This doesn't actually delete from DB, only does UPSERT
    // saveCategories(updatedCategories).catch(error => {
    //   console.error('Error saving categories:', error);
    // });
    
    // ✅ NEW: Use the DELETE endpoint to actually remove the category from DB
    import('../utils/api/categories').then(({ deleteCategory: apiDeleteCategory }) => {
      apiDeleteCategory(categoryId).catch(error => {
        console.error('Error deleting category from API:', error);
        toast.error('Error al eliminar categoría de la base de datos');
        // Revert the local state if delete failed
        setCategories(categories);
        setBudgets(budgets);
      });
    });
    
    // Still save budgets since they were also affected
    saveBudgets(updatedBudgets).catch(error => {
      console.error('Error saving budgets:', error);
    });
    
    return true;
  }, [categories, transactions, budgets, setCategories, setBudgets]);

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}