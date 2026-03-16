/**
 * Custom Hooks - Budget Management
 * 
 * Hook for managing budget operations with backend sync.
 */

import { toast } from 'sonner@2.0.3';
import { useApp } from '../contexts/AppContext';
import { Budget } from '../types';
import { saveBudgets } from '../utils/api/budgets';

export function useBudgets() {
  const { budgets, setBudgets, isInitialLoadComplete } = useApp();

  /**
   * Add a new budget (or update if already exists for this category+period)
   */
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    if (!isInitialLoadComplete) {
      console.warn('⚠️ Budget add blocked: Initial load not complete yet');
      return;
    }

    console.log('➕ Adding/updating budget:', budget);
    
    // 🔑 CRITICAL FIX: Check if a budget already exists for this category+period
    const existingBudget = budgets.find(
      b => b.categoryId === budget.categoryId && b.period === budget.period
    );
    
    let updatedBudgets: Budget[];
    
    if (existingBudget) {
      // ✅ Budget exists: UPDATE it
      console.log(`🔄 Budget already exists for category ${budget.categoryId} (${budget.period}), updating...`);
      console.log(`   Old amount: ${existingBudget.amount}, New amount: ${budget.amount}`);
      
      updatedBudgets = budgets.map(b => 
        b.id === existingBudget.id 
          ? { ...b, ...budget, id: existingBudget.id } // Keep the existing ID
          : b
      );
      toast.success('Presupuesto actualizado correctamente');
    } else {
      // ✅ Budget doesn't exist: CREATE new one
      console.log(`➕ Creating new budget for category ${budget.categoryId} (${budget.period})`);
      
      const newBudget = {
        ...budget,
        id: crypto.randomUUID(), // Generate UUID v4
      };
      updatedBudgets = [...budgets, newBudget];
      toast.success('Presupuesto creado correctamente');
    }
    
    setBudgets(updatedBudgets);
    
    console.log(`💾 Saving ${updatedBudgets.length} budgets to Supabase...`);
    // SAVE to Supabase immediately
    saveBudgets(updatedBudgets)
      .then(() => {
        console.log('✅ Budgets saved successfully to Supabase');
      })
      .catch(error => {
        console.error('❌ Error saving budgets:', error);
        toast.error('Error al guardar presupuesto');
      });
  };

  /**
   * Update an existing budget
   */
  const updateBudget = (budgetId: string, updates: Partial<Budget>) => {
    const updatedBudgets = budgets.map(b => 
      b.id === budgetId ? { ...b, ...updates } : b
    );
    setBudgets(updatedBudgets);
    
    // SAVE to Supabase immediately
    saveBudgets(updatedBudgets).catch(error => {
      console.error('Error saving budgets:', error);
      toast.error('Error al actualizar presupuesto');
    });
  };

  /**
   * Delete a budget
   */
  const deleteBudget = (budgetId: string) => {
    const updatedBudgets = budgets.filter(b => b.id !== budgetId);
    setBudgets(updatedBudgets);
    
    // ❌ OLD: This doesn't actually delete from DB, only does UPSERT
    // saveBudgets(updatedBudgets).catch(error => {
    //   console.error('Error saving budgets:', error);
    // });
    
    // ✅ NEW: Use the DELETE endpoint to actually remove the budget from DB
    import('../utils/api/budgets').then(({ deleteBudget: apiDeleteBudget }) => {
      apiDeleteBudget(budgetId).catch(error => {
        console.error('Error deleting budget from API:', error);
        toast.error('Error al eliminar presupuesto de la base de datos');
        // Revert the local state if delete failed
        setBudgets(budgets);
      });
    });
  };

  return {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
  };
}