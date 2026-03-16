import { projectId, publicAnonKey } from '../supabase/info';
import { Budget } from '../../components/types';
import { handle401Response } from '../auth-helper';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3`;

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * Get all budgets for the authenticated user from Supabase
 */
export async function getBudgets(): Promise<Budget[]> {
  const token = getAccessToken();
  
  if (!token) {
    // Silently return empty array - this is normal when user is not authenticated
    console.log('⚠️ [getBudgets] No token - returning empty array');
    return [];
  }

  try {
    console.log('📥 [getBudgets] Fetching budgets from Supabase...');
    const response = await fetch(`${API_BASE}/budgets`, {
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
      
      throw new Error(error.error || 'Error al obtener presupuestos');
    }

    const data = await response.json();
    return data.budgets;
  } catch (error) {
    console.error('Error fetching budgets from API:', error);
    throw error;
  }
}

/**
 * Save budgets to Supabase
 */
export async function saveBudgets(budgets: Budget[]): Promise<void> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No estás autenticado');
  }

  console.log(`📤 [saveBudgets] Attempting to save ${budgets.length} budgets to Supabase...`);
  if (budgets.length > 0) {
    console.log(`   📊 First budget to save:`, budgets[0]);
  }

  // ✅ PURGA: No filtrar - el backend maneja la validación
  // IMPORTANTE: SIEMPRE enviar al servidor, incluso si el array está vacío
  // Esto permite borrar todos los presupuestos cuando se resetea data
  if (budgets.length === 0) {
    console.log('   📝 Sending empty array to delete all budgets');
  }

  try {
    console.log(`🚀 [saveBudgets] Making POST request to ${API_BASE}/budgets`);
    console.log(`   Token preview: ${token.substring(0, 20)}...`);
    console.log(`   Budgets payload:`, JSON.stringify({ budgets }, null, 2));
    
    const response = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ budgets }),
    });

    console.log(`📡 [saveBudgets] Response status: ${response.status} ${response.statusText}`);
    console.log(`   Response OK: ${response.ok}`);

    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ [saveBudgets] Server returned error:`, error);
      throw new Error(error.error || 'Error al guardar presupuestos');
    }

    const responseData = await response.json();
    console.log('✅ [saveBudgets] Budgets saved successfully to Supabase');
    console.log('   Server response:', responseData);
  } catch (error) {
    console.error('❌ [saveBudgets] Error saving budgets to API:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    throw error;
  }
}

/**
 * Delete a specific budget
 */
export async function deleteBudget(budgetId: string): Promise<Budget[]> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No estás autenticado');
  }

  try {
    const response = await fetch(`${API_BASE}/budgets/${budgetId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar presupuesto');
    }

    const data = await response.json();
    return data.budgets;
  } catch (error) {
    console.error('Error deleting budget from API:', error);
    throw error;
  }
}

/**
 * Migrate budgets from localStorage to Supabase
 * This is a one-time migration function
 */
export async function migrateBudgetsFromLocalStorage(): Promise<void> {
  try {
    // Check if already migrated
    const migrated = localStorage.getItem('budgets_migrated');
    if (migrated === 'true') {
      console.log('Budgets already migrated');
      return;
    }

    // Get budgets from localStorage
    const localBudgets = localStorage.getItem('budgets');
    
    if (localBudgets) {
      const budgets = JSON.parse(localBudgets);
      
      // ✅ PURGA: No filtrar - el backend maneja la validación
      if (budgets.length > 0) {
        console.log(`Migrating ${budgets.length} budgets from localStorage to Supabase...`);
        
        // Save to Supabase
        await saveBudgets(budgets);
        
        console.log('Budgets migration completed successfully');
      } else {
        console.log('No budgets to migrate from localStorage');
      }
      
      // Mark as migrated (even if no valid data)
      localStorage.setItem('budgets_migrated', 'true');
    } else {
      console.log('No budgets to migrate from localStorage');
      localStorage.setItem('budgets_migrated', 'true');
    }
  } catch (error) {
    console.error('Error during budgets migration:', error);
    // Mark as migrated to prevent retry loops
    localStorage.setItem('budgets_migrated', 'true');
    throw error;
  }
}