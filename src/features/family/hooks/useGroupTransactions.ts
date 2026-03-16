/**
 * 👥 FAMILY GROUPS - HOOK: useGroupTransactions
 * 
 * Hook personalizado para gestionar transacciones compartidas.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import * as familyService from '../services/family.service';
import type {
  GroupTransactionWithDetails,
  ShareTransactionDTO,
  AddReactionDTO,
  AddCommentDTO,
} from '../types/family.types';

/**
 * Delay helper para dar tiempo a que la base de datos se actualice
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface UseGroupTransactionsOptions {
  groupId: string | null;
  autoLoad?: boolean;
}

interface UseGroupTransactionsReturn {
  transactions: GroupTransactionWithDetails[];
  isLoading: boolean;
  error: string | null;
  shareTransaction: (data: ShareTransactionDTO) => Promise<void>;
  updateTransaction: (transactionId: string, updates: Partial<ShareTransactionDTO>) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  addReaction: (transactionId: string, emoji: string) => Promise<void>;
  removeReaction: (transactionId: string) => Promise<void>;
  addComment: (transactionId: string, text: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

/**
 * Hook para gestionar transacciones de un grupo
 */
export function useGroupTransactions(
  options: UseGroupTransactionsOptions
): UseGroupTransactionsReturn {
  const { groupId, autoLoad = true } = options;
  const { accessToken, currentUser } = useAuth();
  
  const [transactions, setTransactions] = useState<GroupTransactionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar transacciones del grupo
   */
  const loadTransactions = useCallback(async (silent: boolean = false) => {
    console.log('📥 loadTransactions called:', { groupId, hasAccessToken: !!accessToken, silent });
    
    if (!groupId || !accessToken) {
      console.log('⚠️  No groupId or accessToken, clearing transactions');
      setTransactions([]);
      return;
    }

    if (!silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      console.log('🌐 Fetching transactions from server...');
      
      // Agregar timeout para evitar conexiones colgadas
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30s')), 30000);
      });
      
      const fetchPromise = familyService.listGroupTransactions(
        accessToken,
        groupId,
        { limit: 50 }
      );
      
      const fetchedTransactions = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log('✅ Transactions fetched:', fetchedTransactions.length);
      console.log('📋 Transaction IDs from server:');
      fetchedTransactions.slice(0, 5).forEach((t, idx) => {
        console.log(`   ${idx}: ${t.id.substring(0, 8)}... - ${t.description || 'No desc'} - $${t.amount} - receipt: ${t.receiptUrl ? 'YES' : 'NO'}`);
      });
      
      // DEBUG: Log detalles de comentarios y reacciones
      fetchedTransactions.forEach((t, idx) => {
        if (t.comments?.length > 0 || t.reactions?.length > 0) {
          console.log(`📊 Transaction ${idx}: ${t.id.substring(0, 8)}... has ${t.reactions?.length || 0} reactions and ${t.comments?.length || 0} comments`);
        }
      });
      
      // IMPORTANTE: Crear un nuevo array para forzar re-render
      setTransactions([...fetchedTransactions]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar transacciones';
      setError(errorMessage);
      console.error('❌ Error al cargar transacciones del grupo:', err);
      
      // Si el error es de timeout o de red, no mostrar error persistente
      if (err instanceof Error && (err.message.includes('timeout') || err.message.includes('Failed to fetch'))) {
        console.warn('⚠️  Network error or timeout, will retry on next load');
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [groupId, accessToken]);

  /**
   * Compartir una transacción en el grupo
   */
  const shareTransaction = useCallback(async (data: ShareTransactionDTO) => {
    if (!groupId || !accessToken) {
      throw new Error('Grupo no seleccionado o usuario no autenticado');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📤 Sharing transaction to server:', { groupId, data });
      
      const newTransaction = await familyService.shareTransaction(
        accessToken,
        groupId,
        data
      );

      console.log('✅ Server returned transaction:', newTransaction);
      console.log('   Transaction ID:', newTransaction.id);
      console.log('   Has receiptUrl?', !!newTransaction.receiptUrl);
      console.log('   Receipt URL value:', newTransaction.receiptUrl);

      // Agregar la transacción a la lista local
      const transactionWithDetails: GroupTransactionWithDetails = {
        ...newTransaction,
        reactions: [],
        comments: [],
      };

      console.log('📝 Adding to local state...');
      console.log('   Transaction with details has receiptUrl?', !!transactionWithDetails.receiptUrl);
      setTransactions(prev => {
        const newList = [transactionWithDetails, ...prev];
        console.log('   New transactions count:', newList.length);
        console.log('   First transaction has receiptUrl?', !!newList[0].receiptUrl);
        return newList;
      });
      
      console.log('✅ Transaction added to local state');
    } catch (err) {
      console.error('❌ Error sharing transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al compartir transacción';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [groupId, accessToken]);

  /**
   * Actualizar una transacción
   */
  const updateTransaction = useCallback(async (transactionId: string, updates: Partial<ShareTransactionDTO>) => {
    if (!groupId || !accessToken) {
      throw new Error('Grupo no seleccionado o usuario no autenticado');
    }

    try {
      console.log('✏️ Updating transaction:', { transactionId, updates });
      await familyService.updateGroupTransaction(
        accessToken,
        groupId,
        transactionId,
        updates
      );

      console.log('✅ Transaction updated');
      
      // Refrescar transacciones
      await loadTransactions(true);
    } catch (err) {
      console.error('❌ Error updating transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar transacción';
      setError(errorMessage);
      throw err;
    }
  }, [groupId, accessToken, loadTransactions]);

  /**
   * Eliminar una transacción
   */
  const deleteTransaction = useCallback(async (transactionId: string) => {
    if (!groupId || !accessToken) {
      throw new Error('Grupo no seleccionado o usuario no autenticado');
    }

    try {
      console.log('🗑️ Deleting transaction:', transactionId);
      await familyService.deleteGroupTransaction(
        accessToken,
        groupId,
        transactionId
      );

      console.log('✅ Transaction deleted');
      
      // Eliminar de la lista local
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    } catch (err) {
      console.error('❌ Error deleting transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar transacción';
      setError(errorMessage);
      throw err;
    }
  }, [groupId, accessToken]);

  /**
   * Agregar reacción a una transacción
   */
  const addReaction = useCallback(async (transactionId: string, emoji: string) => {
    if (!groupId || !accessToken) {
      throw new Error('Grupo no seleccionado o usuario no autenticado');
    }

    try {
      console.log('🎭 Adding reaction:', { transactionId, emoji });
      const result = await familyService.addReaction(
        accessToken,
        groupId,
        transactionId,
        { emoji }
      );

      console.log('✅ Reaction added, result:', result);
      
      // Esperar un momento para que la DB se actualice
      console.log('⏳ Waiting 400ms for DB consistency...');
      await delay(400);
      
      // Refrescar en background sin mostrar loader
      console.log('🔄 Refreshing transactions...');
      await loadTransactions(true);
      console.log('✅ Transactions refreshed');
    } catch (err) {
      console.error('❌ Error adding reaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar reacción';
      setError(errorMessage);
      throw err;
    }
  }, [groupId, accessToken, loadTransactions]);

  /**
   * Eliminar reacción de una transacción
   */
  const removeReaction = useCallback(async (transactionId: string) => {
    if (!groupId || !accessToken || !currentUser?.id) {
      throw new Error('Grupo no seleccionado o usuario no autenticado');
    }

    try {
      console.log('🗑️  Removing reaction:', { transactionId, userId: currentUser.id });
      await familyService.removeReaction(
        accessToken,
        groupId,
        transactionId
      );

      console.log('✅ Reaction removed');
      
      // Esperar un momento para que la DB se actualice
      console.log('⏳ Waiting 400ms for DB consistency...');
      await delay(400);
      
      // Refrescar en background sin mostrar loader
      console.log('🔄 Refreshing transactions...');
      await loadTransactions(true);
      console.log('✅ Transactions refreshed');
    } catch (err) {
      console.error('❌ Error removing reaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar reacción';
      setError(errorMessage);
      throw err;
    }
  }, [groupId, accessToken, currentUser?.id, loadTransactions]);

  /**
   * Agregar comentario a una transacción
   */
  const addComment = useCallback(async (transactionId: string, text: string) => {
    if (!groupId || !accessToken) {
      throw new Error('Grupo no seleccionado o usuario no autenticado');
    }

    try {
      console.log('💬 Adding comment:', { transactionId, text });
      const comment = await familyService.addComment(
        accessToken,
        groupId,
        transactionId,
        { text }
      );

      console.log('✅ Comment added:', comment);
      
      // Esperar un momento para que la DB se actualice
      console.log('⏳ Waiting 400ms for DB consistency...');
      await delay(400);
      
      // Refrescar en background sin mostrar loader
      console.log('🔄 Refreshing transactions...');
      await loadTransactions(true);
      console.log('✅ Transactions refreshed');
    } catch (err) {
      console.error('❌ Error adding comment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar comentario';
      setError(errorMessage);
      throw err;
    }
  }, [groupId, accessToken, loadTransactions]);

  /**
   * Refrescar transacciones
   */
  const refreshTransactions = useCallback(async () => {
    await loadTransactions();
  }, [loadTransactions]);

  /**
   * Cargar transacciones al montar o cuando cambie el grupo
   */
  useEffect(() => {
    if (autoLoad) {
      loadTransactions();
    }
  }, [autoLoad, loadTransactions]);

  return {
    transactions,
    isLoading,
    error,
    shareTransaction,
    updateTransaction,
    deleteTransaction,
    addReaction,
    removeReaction,
    addComment,
    refreshTransactions,
  };
}