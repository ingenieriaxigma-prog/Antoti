import { projectId, publicAnonKey } from '../supabase/info';
import { Account } from '../../components/types';
import { handle401Response } from '../auth-helper';
import { logger } from '../logger';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3`;

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * Get all accounts for the authenticated user from Supabase
 * @param providedToken - Optional token to use instead of reading from localStorage (prevents race conditions)
 */
export async function getAccounts(providedToken?: string): Promise<Account[]> {
  const token = providedToken || getAccessToken();
  
  if (!token) {
    // Silently return empty array - this is normal when user is not authenticated
    logger.debug('[getAccounts] No token - returning empty array');
    return [];
  }

  try {
    logger.debug('[getAccounts] Fetching accounts from Supabase...');
    const response = await fetch(`${API_BASE}/accounts`, {
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
      
      throw new Error(error.error || 'Error al obtener cuentas');
    }

    const data = await response.json();
    logger.debug(`[getAccounts] Received ${data.accounts?.length || 0} accounts from server`);
    if (data.accounts && data.accounts.length > 0) {
      logger.debug(`   📊 First account:`, data.accounts[0]);
    }
    return data.accounts;
  } catch (error) {
    console.error('Error fetching accounts from API:', error);
    throw error;
  }
}

/**
 * Get all accounts - accepts optional token parameter
 * Useful when localStorage is not synced but token exists in memory
 */
export async function getAccountsWithToken(token: string): Promise<Account[]> {
  if (!token) {
    console.log('⚠️ [getAccountsWithToken] No token provided - returning empty array');
    return [];
  }

  try {
    console.log('📥 [getAccountsWithToken] Fetching accounts from Supabase with provided token...');
    const response = await fetch(`${API_BASE}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      
      if (response.status === 401) {
        handle401Response(error);
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      }
      
      throw new Error(error.error || 'Error al obtener cuentas');
    }

    const data = await response.json();
    console.log(`✅ [getAccountsWithToken] Received ${data.accounts?.length || 0} accounts from server`);
    if (data.accounts && data.accounts.length > 0) {
      console.log(`   📊 First account:`, data.accounts[0]);
      console.log(`   💰 Balance:`, data.accounts[0].balance);
    }
    return data.accounts;
  } catch (error) {
    console.error('Error fetching accounts from API:', error);
    throw error;
  }
}

/**
 * Save accounts to Supabase
 */
export async function saveAccounts(accounts: Account[]): Promise<void> {
  const token = getAccessToken();
  
  if (!token) {
    // Silently return - user is not authenticated, which is normal
    console.log('📝 [saveAccounts] No auth token - skipping save to Supabase');
    return;
  }

  console.log(`📤 [saveAccounts] Attempting to save ${accounts.length} accounts to Supabase...`);
  if (accounts.length > 0) {
    console.log(`   📊 First account to save:`, accounts[0]);
    console.log(`   💰 Balances being saved:`, accounts.map(a => ({ name: a.name, balance: a.balance })));
  }

  // ✅ PURGA: No filtrar - el backend maneja la validación
  // IMPORTANTE: SIEMPRE enviar al servidor, incluso si el array está vacío
  // Esto permite borrar todas las cuentas cuando se resetea data
  if (accounts.length === 0) {
    console.log('   📝 Sending empty array to delete all accounts');
  }

  try {
    const response = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ accounts }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || 'Error al guardar cuentas';
      
      // Check if error is about missing tables
      if (errorMessage.includes('no existe en Postgres') || errorMessage.includes('MIGRATION_SQL.sql')) {
        console.error('❌ TABLAS DE POSTGRES NO CREADAS');
        console.error('📝 Por favor ejecuta el script MIGRATION_SQL.sql en el SQL Editor de Supabase');
        console.error('🔗 Dashboard → SQL Editor → New Query → Pega el contenido de MIGRATION_SQL.sql');
      }
      
      throw new Error(errorMessage);
    }

    console.log('✅ [saveAccounts] Accounts saved successfully to Supabase');
  } catch (error) {
    console.error('❌ [saveAccounts] Error saving accounts to API:', error);
    throw error;
  }
}

/**
 * Delete a specific account
 */
export async function deleteAccount(accountId: string): Promise<Account[]> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No estás autenticado');
  }

  try {
    const response = await fetch(`${API_BASE}/accounts/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar cuenta');
    }

    const data = await response.json();
    return data.accounts;
  } catch (error) {
    console.error('Error deleting account from API:', error);
    throw error;
  }
}

/**
 * Migrate accounts from localStorage to Supabase
 * This is a one-time migration function
 */
export async function migrateAccountsFromLocalStorage(): Promise<void> {
  try {
    // Check if already migrated
    const migrated = localStorage.getItem('accounts_migrated');
    if (migrated === 'true') {
      console.log('Accounts already migrated');
      return;
    }

    // Get accounts from localStorage
    const localAccounts = localStorage.getItem('accounts');
    
    if (localAccounts) {
      const accounts = JSON.parse(localAccounts);
      
      // ✅ PURGA: No filtrar - el backend maneja la validación
      if (accounts.length > 0) {
        console.log(`Migrating ${accounts.length} accounts from localStorage to Supabase...`);
        
        // Save to Supabase
        await saveAccounts(accounts);
        
        console.log('Accounts migration completed successfully');
      } else {
        console.log('No accounts to migrate from localStorage');
      }
      
      // Mark as migrated (even if no valid data)
      localStorage.setItem('accounts_migrated', 'true');
    } else {
      console.log('No accounts to migrate from localStorage');
      localStorage.setItem('accounts_migrated', 'true');
    }
  } catch (error) {
    console.error('Error during accounts migration:', error);
    // Mark as migrated to prevent retry loops
    localStorage.setItem('accounts_migrated', 'true');
    throw error;
  }
}