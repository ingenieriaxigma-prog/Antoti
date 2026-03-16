/**
 * Custom Hooks - Transaction Management
 * 
 * Hook for managing transaction operations with backend sync.
 */

import { useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { useApp } from '../contexts/AppContext';
import { Transaction } from '../types';
import { TransactionService } from '../features/transactions/services';
import { saveTransactions } from '../utils/api/transactions';
import { parseLocalDate } from '../utils/dateUtils'; // ✅ NEW: Import date parser
// ✅ REMOVED: saveAccounts import - no longer needed after balance calculation fix

export function useTransactions() {
  const { transactions, accounts, setTransactions, setAccounts, setSelectedMonth, setSelectedYear } = useApp(); // ✅ NEW: Get month/year setters

  /**
   * Add a new transaction
   */
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    // ✅ REGLA: Si no hay cuenta, usar "Efectivo" por defecto
    const EFECTIVO_ID = 'ac111111-0000-4000-a000-000000000001';
    
    if (!transaction.account || transaction.account === '') {
      console.log('⚠️  No account specified - using "Efectivo" by default');
      transaction = {
        ...transaction,
        account: EFECTIVO_ID
      };
    }
    
    // ✅ LOG: Ver qué campos tiene la transacción antes de procesarla
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔵 [STEP 1] useTransactions.addTransaction called');
    console.log('🔵 Transaction data received:', {
      type: transaction.type,
      amount: transaction.amount,
      account: transaction.account,
      toAccount: transaction.toAccount || null,
      category: transaction.category || null,
      subcategory: transaction.subcategory || null,
      date: transaction.date,
      note: transaction.note || null,
    });
    
    // Generate ID using service
    const newTransaction: Transaction = {
      ...transaction,
      id: TransactionService.generateTransactionId(),
    };
    
    console.log('🔵 [STEP 2] New transaction created with ID:', newTransaction.id);
    console.log('🔵 CRITICAL CHECK - Does it have account field?', {
      hasAccount: !!newTransaction.account,
      accountValue: newTransaction.account,
    });
    
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);

    // ✅ Use TransactionService to calculate balance changes
    const balanceChanges = TransactionService.calculateBalanceChanges(newTransaction);
    const updatedAccounts = TransactionService.applyBalanceChanges(accounts, balanceChanges);
    setAccounts(updatedAccounts);
    
    // ✅ NEW: Auto-navigate to the month of the new transaction
    const transactionDate = parseLocalDate(newTransaction.date);
    const transactionMonth = transactionDate.getMonth();
    const transactionYear = transactionDate.getFullYear();
    console.log('📅 [STEP 2.5] Auto-navigating to transaction month:', {
      month: transactionMonth,
      year: transactionYear,
      date: newTransaction.date
    });
    setSelectedMonth(transactionMonth);
    setSelectedYear(transactionYear);
    
    // Show success message
    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    toast.success(`Transacción registrada en ${monthNames[transactionMonth]} ${transactionYear}`, {
      description: `$${newTransaction.amount.toLocaleString('es-CO')} - ${newTransaction.type === 'expense' ? 'Gasto' : newTransaction.type === 'income' ? 'Ingreso' : 'Transferencia'}`
    });
    
    // SAVE to Supabase immediately
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`💾 [STEP 3] Saving to Supabase...`);
    console.log(`💾 Total transactions to save: ${updatedTransactions.length}`);
    console.log(`💾 First transaction (the new one):`, {
      id: newTransaction.id.substring(0, 8) + '...',
      account: newTransaction.account,
      amount: newTransaction.amount,
      type: newTransaction.type,
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    saveTransactions(updatedTransactions).catch(error => {
      console.error('Error saving transactions:', error);
      toast.error('Error al guardar transacción');
    });
    // ✅ FIX: NO guardar accounts aquí - el backend recalcula balances automáticamente
    // cuando se hace GET /accounts. Guardar accounts aquí causa race condition
    // porque las transacciones pueden no estar guardadas aún cuando el backend
    // recalcula los balances, resultando en balances incorrectos de $0
    // saveAccounts(updatedAccounts).catch(error => {
    //   console.error('Error saving accounts:', error);
    // });
  }, [transactions, accounts, setTransactions, setAccounts, setSelectedMonth, setSelectedYear]);

  /**
   * Add multiple transactions at once (for bulk imports)
   */
  const addMultipleTransactions = useCallback((newTransactions: Omit<Transaction, 'id'>[]) => {
    // Generate IDs for all transactions
    const transactionsWithIds: Transaction[] = newTransactions.map(txn => ({
      ...txn,
      id: TransactionService.generateTransactionId(),
    }));
    
    // Add all transactions to the list
    const updatedTransactions = [...transactionsWithIds, ...transactions];
    setTransactions(updatedTransactions);

    // Calculate balance changes for all transactions
    let updatedAccounts = [...accounts];
    transactionsWithIds.forEach(txn => {
      const balanceChanges = TransactionService.calculateBalanceChanges(txn);
      updatedAccounts = TransactionService.applyBalanceChanges(updatedAccounts, balanceChanges);
    });
    setAccounts(updatedAccounts);
    
    // SAVE to Supabase immediately
    console.log(`💾 Saving ${transactionsWithIds.length} transactions to Supabase...`);
    saveTransactions(updatedTransactions).catch(error => {
      console.error('Error saving transactions:', error);
      toast.error('Error al guardar transacciones');
    });
    // ✅ FIX: NO guardar accounts aquí - el backend recalcula balances automáticamente
    // cuando se hace GET /accounts. Guardar accounts aquí causa race condition
    // porque las transacciones pueden no estar guardadas aún cuando el backend
    // recalcula los balances, resultando en balances incorrectos de $0
    // saveAccounts(updatedAccounts).catch(error => {
    //   console.error('Error saving accounts:', error);
    // });
  }, [transactions, accounts, setTransactions, setAccounts]);

  /**
   * Update an existing transaction
   */
  const updateTransaction = useCallback((transactionId: string, updates: Partial<Transaction>) => {
    console.log('🟡 useTransactions.updateTransaction called with:', { transactionId, updates });
    
    const oldTransaction = transactions.find(t => t.id === transactionId);
    if (!oldTransaction) return;

    const newTransaction = { ...oldTransaction, ...updates };
    console.log('🟡 Old transaction:', oldTransaction);
    console.log('🟡 New transaction:', newTransaction);

    // ✅ Use TransactionService.replaceTransaction to handle both revert and apply in one step
    const updatedAccounts = TransactionService.replaceTransaction(
      oldTransaction,
      newTransaction,
      accounts
    );
    setAccounts(updatedAccounts);

    // Update transaction list
    const updatedTransactions = transactions.map(t => 
      t.id === transactionId ? newTransaction : t
    );
    setTransactions(updatedTransactions);
    
    // SAVE to Supabase immediately
    console.log(`💾 Saving updated transaction to Supabase...`);
    saveTransactions(updatedTransactions).catch(error => {
      console.error('Error saving transactions:', error);
      toast.error('Error al actualizar transacción');
    });
    // ✅ FIX: NO guardar accounts aquí - el backend recalcula balances automáticamente
    // cuando se hace GET /accounts. Guardar accounts aquí causa race condition
    // porque las transacciones pueden no estar guardadas aún cuando el backend
    // recalcula los balances, resultando en balances incorrectos de $0
    // saveAccounts(updatedAccounts).catch(error => {
    //   console.error('Error saving accounts:', error);
    // });
  }, [transactions, accounts, setTransactions, setAccounts]);

  /**
   * Delete a transaction
   */
  const deleteTransaction = useCallback((transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // ✅ Use TransactionService.revertTransaction to undo balance changes
    const updatedAccounts = TransactionService.revertTransaction(transaction, accounts);
    setAccounts(updatedAccounts);

    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    setTransactions(updatedTransactions);
    
    // ✅ NEW: Use the DELETE endpoint to actually remove the transaction from DB
    import('../utils/api/transactions').then(({ deleteTransaction: apiDeleteTransaction }) => {
      apiDeleteTransaction(transactionId).catch(error => {
        console.error('Error deleting transaction from API:', error);
        toast.error('Error al eliminar transacción de la base de datos');
        // Revert the local state if delete failed
        setTransactions(transactions);
        setAccounts(accounts);
      });
    });
    
    // ✅ FIX: NO guardar accounts aquí - el backend recalcula balances automáticamente
    // cuando se hace GET /accounts. Los balances se recalcularán la próxima vez
    // que se carguen las cuentas desde el backend.
    // saveAccounts(updatedAccounts).catch(error => {
    //   console.error('Error saving accounts:', error);
    // });
  }, [transactions, accounts, setTransactions, setAccounts]);

  return {
    transactions,
    addTransaction,
    addMultipleTransactions,
    updateTransaction,
    deleteTransaction,
  };
}