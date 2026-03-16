/**
 * Custom Hooks - Reset Data
 * 
 * Hook for resetting application data to defaults.
 */

import { useApp } from '../contexts/AppContext';
import { Transaction } from '../types';
import { saveAccounts } from '../utils/api/accounts';
import { saveTransactions } from '../utils/api/transactions';
import { saveBudgets } from '../utils/api/budgets';
import { saveCategories } from '../utils/api/categories';
import { toast } from 'sonner@2.0.3';

export function useResetData() {
  const { accounts, budgets, setAccounts, setTransactions, setBudgets, setCategories } = useApp();

  const resetData = async () => {
    try {
      // Reset all account balances to 0 (keep the accounts, just reset balances)
      const resetAccounts = accounts.map(acc => ({ ...acc, balance: 0 }));
      setAccounts(resetAccounts);
      
      // Clear all transactions
      const emptyTransactions: Transaction[] = [];
      setTransactions(emptyTransactions);
      
      // Reset all budget amounts to 0 (keep the budgets, just reset amounts)
      const resetBudgets = budgets.map(budget => ({ ...budget, amount: 0 }));
      setBudgets(resetBudgets);
      
      // ✅ IMPORTANTE: Borrar todas las categorías para que se recreen con subcategorías
      // Esto permite que useDataLoader cree las nuevas categorías con subcategorías
      setCategories([]);
      
      // SAVE to Supabase immediately - usar await para asegurar que se guarden
      await Promise.all([
        saveAccounts(resetAccounts),
        saveTransactions(emptyTransactions), // ✅ Ahora SÍ borra las transacciones del servidor
        saveBudgets(resetBudgets),
        saveCategories([]), // ✅ Borrar categorías del servidor
      ]);
      
      toast.success('Datos reiniciados correctamente. Por favor recarga la página.');
    } catch (error) {
      console.error('Error al reiniciar datos:', error);
      toast.error('Error al reiniciar datos');
    }
  };

  return { resetData };
}