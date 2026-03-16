/**
 * Custom Hooks - Account Management
 * 
 * Hook for managing account operations with backend sync.
 */

import { useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { useApp } from '../contexts/AppContext';
import { Account } from '../types';
import { AccountService } from '../features/accounts/services';
import { saveAccounts } from '../utils/api/accounts';

export function useAccounts() {
  const { accounts, transactions, setAccounts } = useApp();

  /**
   * Add a new account
   */
  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    const newAccount = {
      ...account,
      id: AccountService.generateAccountId(),
    };
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    
    // SAVE to Supabase immediately
    saveAccounts(updatedAccounts).catch(error => {
      console.error('Error saving accounts:', error);
      toast.error('Error al guardar cuenta');
    });
  }, [accounts, setAccounts]);

  /**
   * Update an existing account
   */
  const updateAccount = useCallback((accountId: string, updates: Partial<Account>) => {
    const updatedAccounts = accounts.map(acc => 
      acc.id === accountId ? { ...acc, ...updates } : acc
    );
    setAccounts(updatedAccounts);
    
    // SAVE to Supabase immediately
    saveAccounts(updatedAccounts).catch(error => {
      console.error('Error saving accounts:', error);
      toast.error('Error al actualizar cuenta');
    });
  }, [accounts, setAccounts]);

  /**
   * Delete an account
   * Returns false if account has transactions (cannot delete)
   */
  const deleteAccount = useCallback((accountId: string): boolean => {
    // Check if account has transactions
    const hasTransactions = transactions.some(
      t => t.account === accountId || t.toAccount === accountId
    );
    
    if (hasTransactions) {
      return false; // Cannot delete account with transactions
    }
    
    const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
    setAccounts(updatedAccounts);
    
    // ❌ OLD: This doesn't actually delete from DB, only does UPSERT
    // saveAccounts(updatedAccounts).catch(error => {
    //   console.error('Error saving accounts:', error);\
    // });
    
    // ✅ NEW: Use the DELETE endpoint to actually remove the account from DB
    import('../utils/api/accounts').then(({ deleteAccount: apiDeleteAccount }) => {
      apiDeleteAccount(accountId).catch(error => {
        console.error('Error deleting account from API:', error);
        toast.error('Error al eliminar cuenta de la base de datos');
        // Revert the local state if delete failed
        setAccounts(accounts);
      });
    });
    
    return true;
  }, [accounts, transactions, setAccounts]);

  return {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
  };
}