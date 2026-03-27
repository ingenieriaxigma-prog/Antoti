import { projectId, publicAnonKey } from '../supabase/info';
import { Transaction } from '../../components/types';
import { handle401Response } from '../auth-helper';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3`;

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * Get all transactions for the authenticated user from Supabase
 * @param options - Optional pagination and filtering options
 * @param options.limit - Maximum number of transactions to return (default: all)
 * @param options.offset - Number of transactions to skip (default: 0)
 * @param options.orderBy - Field to order by (default: 'date')
 * @param options.orderDirection - Order direction 'asc' or 'desc' (default: 'desc')
 */
export async function getTransactions(options?: {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}): Promise<Transaction[]> {
  const token = getAccessToken();
  
  if (!token) {
    // Silently return empty array - this is normal when user is not authenticated
    return [];
  }

  try {
    // Build query parameters for pagination
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.orderBy) params.append('orderBy', options.orderBy);
    if (options?.orderDirection) params.append('orderDirection', options.orderDirection);

    const queryString = params.toString();
    const url = queryString ? `${API_BASE}/transactions?${queryString}` : `${API_BASE}/transactions`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      
      // If unauthorized, clear the invalid token
      if (response.status === 401) {
        handle401Response(error);
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      }
      
      throw new Error(error.error || 'Error al obtener transacciones');
    }

    const data = await response.json();
    
    // ✅ COMPATIBILITY FIX: Map both formats (account_id → account)
    // The server may return "account_id" but frontend expects "account"
    const mappedTransactions = (data.transactions || []).map((tx: any) => {
      // If server returns "account_id", convert to "account"
      if (tx.account_id && !tx.account) {
        return {
          ...tx,
          account: tx.account_id,
          toAccount: tx.to_account_id || tx.toAccount,
          category: tx.category_id || tx.category,
        };
      }
      // If already has "account", use as is
      return tx;
    });
    
    // ✅ FRONTEND LIMIT: Si el backend devuelve todos, limitamos aquí mientras arreglamos backend
    // El parámetro `limit` se sigue enviando por si el backend lo implementa después
    const effectiveLimit = options?.limit || mappedTransactions.length;
    const limitedTransactions = mappedTransactions.slice(0, effectiveLimit);
    
    console.log(`📥 [API] Transactions received: ${mappedTransactions.length}, returning: ${limitedTransactions.length} (limit: ${effectiveLimit})`);
    
    return limitedTransactions;
  } catch (error) {
    console.error('Error fetching transactions from API:', error);
    throw error;
  }
}

/**
 * Save transactions to Supabase
 */
export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  const token = getAccessToken();
  
  if (!token) {
    // Silently return - user is not authenticated, which is normal
    console.log('📝 No auth token - skipping save to Supabase (using local storage)');
    return;
  }

  // ✅ PURGA: No filtrar - el backend maneja la validación
  // IMPORTANTE: SIEMPRE enviar al servidor, incluso si el array está vacío
  // Esto permite borrar todas las transacciones cuando se resetea data
  if (transactions.length === 0) {
    console.log('📝 Enviando array vacío al servidor para borrar todas las transacciones');
  }

  console.log('🚀 [API] Sending transactions to server:', transactions.length);
  if (transactions.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 [STEP 4] API - Preparing to send to backend');
    console.log('🚀 First transaction being sent:', {
      id: transactions[0].id.substring(0, 8) + '...',
      account: transactions[0].account || 'MISSING ❌',
      toAccount: transactions[0].toAccount || null,
      category: transactions[0].category || null,
      amount: transactions[0].amount,
      type: transactions[0].type,
    });
    console.log('🚀 CRITICAL: Check if account field exists:', {
      hasAccountField: 'account' in transactions[0],
      accountValue: transactions[0].account,
      accountType: typeof transactions[0].account,
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  try {
    const response = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ transactions }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || 'Error al guardar transacciones';
      
      console.error('❌ [API] Server error:', error);
      
      // Check if error is about missing tables
      if (errorMessage.includes('no existe en Postgres') || errorMessage.includes('MIGRATION_SQL.sql')) {
        console.error('❌ TABLAS DE POSTGRES NO CREADAS');
        console.error('📝 Por favor ejecuta el script MIGRATION_SQL.sql en el SQL Editor de Supabase');
        console.error('🔗 Dashboard → SQL Editor → New Query → Pega el contenido de MIGRATION_SQL.sql');
      }
      
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('✅ [API] Transactions saved successfully to Supabase');
    console.log('✅ [API] Server response:', responseData);
  } catch (error) {
    console.error('Error saving transactions to API:', error);
    throw error;
  }
}

/**
 * Delete a specific transaction
 */
export async function deleteTransaction(transactionId: string): Promise<Transaction[]> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No estás autenticado');
  }

  try {
    const response = await fetch(`${API_BASE}/transactions/${transactionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar transacción');
    }

    const data = await response.json();
    return data.transactions;
  } catch (error) {
    console.error('Error deleting transaction from API:', error);
    throw error;
  }
}

/**
 * Migrate transactions from localStorage to Supabase
 * This is a one-time migration function
 */
export async function migrateTransactionsFromLocalStorage(): Promise<void> {
  try {
    // Check if already migrated
    const migrated = localStorage.getItem('transactions_migrated');
    if (migrated === 'true') {
      console.log('Transactions already migrated');
      return;
    }

    // Get transactions from localStorage
    const localTransactions = localStorage.getItem('transactions');
    
    if (localTransactions) {
      const transactions = JSON.parse(localTransactions);
      
      // ✅ PURGA: No filtrar - el backend maneja la validación
      if (transactions.length > 0) {
        console.log(`Migrating ${transactions.length} transactions from localStorage to Supabase...`);
        
        // Save to Supabase
        await saveTransactions(transactions);
        
        console.log('Transactions migration completed successfully');
      } else {
        console.log('No transactions to migrate from localStorage');
      }
      
      // Mark as migrated (even if no valid data)
      localStorage.setItem('transactions_migrated', 'true');
    } else {
      console.log('No transactions to migrate from localStorage');
      localStorage.setItem('transactions_migrated', 'true');
    }
  } catch (error) {
    console.error('Error during transactions migration:', error);
    // Mark as migrated to prevent retry loops
    localStorage.setItem('transactions_migrated', 'true');
    throw error;
  }
}