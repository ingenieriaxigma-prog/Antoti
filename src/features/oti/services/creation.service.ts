/**
 * 🆕 SPRINT 2: Servicio de Creación de Elementos desde Oti
 * 
 * Maneja la creación de transacciones, presupuestos y cuentas
 * desde las respuestas estructuradas de Oti.
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { TransactionData, BudgetData, AccountData } from '../types/structured-response.types';

export class OtiCreationService {
  /**
   * Crea una transacción desde datos estructurados de Oti
   */
  static async createTransaction(data: TransactionData): Promise<{ success: boolean; error?: string; transaction?: any }> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        return { success: false, error: 'No estás autenticado' };
      }

      // Si se proporciona categoryName pero no categoryId, buscar la categoría
      let categoryId = data.categoryId;
      
      if (!categoryId && data.categoryName) {
        const category = await this.findCategoryByName(data.categoryName);
        if (category) {
          categoryId = category.id;
        } else {
          return { success: false, error: `No se encontró la categoría "${data.categoryName}"` };
        }
      }

      // Si se proporciona accountName pero no accountId, buscar la cuenta
      let accountId = data.accountId;
      
      if (!accountId && data.accountName) {
        const account = await this.findAccountByName(data.accountName);
        if (account) {
          accountId = account.id;
        } else {
          return { success: false, error: `No se encontró la cuenta "${data.accountName}"` };
        }
      }

      // Si no hay cuenta, usar la cuenta por defecto
      if (!accountId) {
        const defaultAccount = await this.getDefaultAccount();
        if (defaultAccount) {
          accountId = defaultAccount.id;
        } else {
          return { success: false, error: 'No hay cuentas disponibles. Crea una cuenta primero.' };
        }
      }

      // ✅ FIX: Obtener la fecha actual en zona horaria de Colombia (UTC-5)
      let currentDate = data.date;
      if (!currentDate) {
        const today = new Date();
        const colombiaOffset = -5 * 60; // -5 horas en minutos
        const localOffset = today.getTimezoneOffset();
        const colombiaTime = new Date(today.getTime() + (localOffset + colombiaOffset) * 60 * 1000);
        
        const year = colombiaTime.getUTCFullYear();
        const month = String(colombiaTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(colombiaTime.getUTCDate()).padStart(2, '0');
        
        currentDate = `${year}-${month}-${day}`; // YYYY-MM-DD
      }
      
      // Crear la transacción con ID único
      const transaction = {
        id: crypto.randomUUID(), // ✅ Generar ID único
        type: data.type,
        amount: data.amount,
        note: data.description, // ✅ IMPORTANTE: El frontend usa "note" no "description"
        category: categoryId,
        account: accountId,
        date: currentDate,
        tags: data.tags || []
      };

      // ✅ FIX: Obtener todas las transacciones existentes primero
      console.log('📥 [OtiCreation] Fetching existing transactions...');
      const getTransactionsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/transactions`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      let existingTransactions = [];
      if (getTransactionsResponse.ok) {
        const responseData = await getTransactionsResponse.json();
        existingTransactions = responseData.transactions || [];
        console.log(`✅ [OtiCreation] Found ${existingTransactions.length} existing transactions`);
      } else {
        console.warn('⚠️ [OtiCreation] Could not fetch existing transactions, starting fresh');
      }

      // ✅ FIX: Agregar la nueva transacción al array existente
      const allTransactions = [...existingTransactions, transaction];
      console.log(`💾 [OtiCreation] Saving ${allTransactions.length} total transactions (${existingTransactions.length} existing + 1 new)`);

      // ✅ FIX: El endpoint POST /transactions espera un array de transacciones
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/transactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ transactions: allTransactions }), // ✅ Enviar array completo
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [OtiCreation] Transaction save failed:', errorData);
        return { success: false, error: errorData.error || 'Error al crear la transacción' };
      }

      const result = await response.json();
      console.log('✅ [OtiCreation] Transaction saved successfully!');
      return { success: true, transaction: transaction };

    } catch (error) {
      console.error('❌ [OtiCreation] Error creating transaction:', error);
      return { success: false, error: 'Error inesperado al crear la transacción' };
    }
  }

  /**
   * Crea un presupuesto desde datos estructurados de Oti
   */
  static async createBudget(data: BudgetData): Promise<{ success: boolean; error?: string; budget?: any }> {
    try {
      console.log('🆕 [OtiCreation] Creating budget with data:', data);
      
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        return { success: false, error: 'No estás autenticado' };
      }

      // Si se proporciona categoryName pero no categoryId, buscar la categoría
      let categoryId = data.categoryId;
      
      if (!categoryId && data.categoryName) {
        console.log(`🔍 [OtiCreation] Searching for category: "${data.categoryName}"`);
        const category = await this.findCategoryByName(data.categoryName);
        if (category) {
          categoryId = category.id;
          console.log(`✅ [OtiCreation] Found category: ${category.name} (${categoryId})`);
        } else {
          console.error(`❌ [OtiCreation] Category not found: "${data.categoryName}"`);
          return { success: false, error: `No se encontró la categoría "${data.categoryName}"` };
        }
      }

      if (!categoryId) {
        return { success: false, error: 'Debe especificar una categoría' };
      }

      // Parsear el mes (formato: YYYY-MM)
      const [year, month] = data.month.split('-').map(Number);
      console.log(`📅 [OtiCreation] Parsed date: Year=${year}, Month=${month}`);

      // ✅ FIX: El backend espera 'period' como tipo (monthly/yearly), no como fecha
      // Los presupuestos son "mensuales" por defecto y se filtran por mes/año en el frontend
      const budget = {
        id: crypto.randomUUID(), // Generar ID único
        categoryId: categoryId,
        amount: data.amount,
        period: 'monthly' as const, // ✅ Siempre monthly por ahora (el filtrado por mes se hace en frontend)
        alertThreshold: 80 // Por defecto
      };

      console.log('📦 [OtiCreation] Budget object to save:', JSON.stringify(budget, null, 2));

      // Obtener presupuestos existentes
      console.log('📥 [OtiCreation] Fetching existing budgets...');
      const getBudgetsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/budgets`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      let budgets = [];
      if (getBudgetsResponse.ok) {
        const responseData = await getBudgetsResponse.json();
        budgets = responseData.budgets || [];
        console.log(`✅ [OtiCreation] Found ${budgets.length} existing budgets`);
      } else {
        console.warn('⚠️ [OtiCreation] Could not fetch existing budgets, starting fresh');
      }

      // Agregar o actualizar el presupuesto
      // ✅ Buscar por categoryId y period (formato nuevo del backend)
      const existingIndex = budgets.findIndex(
        (b: any) => b.categoryId === categoryId && b.period === budget.period
      );

      if (existingIndex >= 0) {
        console.log(`🔄 [OtiCreation] Updating existing budget at index ${existingIndex}`);
        budgets[existingIndex] = budget;
      } else {
        console.log('➕ [OtiCreation] Adding new budget to list');
        budgets.push(budget);
      }

      console.log(`💾 [OtiCreation] Saving ${budgets.length} total budgets...`);
      
      // ✅ DEBUG: Log FULL array antes de enviar
      console.log('🔍 [OtiCreation] Full budgets array to send:', JSON.stringify(budgets, null, 2));

      // Guardar presupuestos
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/budgets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ budgets }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [OtiCreation] Budget save failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        return { 
          success: false, 
          error: errorData.error || `Error al guardar presupuestos (${response.status}: ${response.statusText})` 
        };
      }

      console.log('✅ [OtiCreation] Budget saved successfully!');
      return { success: true, budget };

    } catch (error) {
      console.error('❌ [OtiCreation] Unexpected error creating budget:', error);
      return { success: false, error: `Error inesperado: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Crea una cuenta desde datos estructurados de Oti
   */
  static async createAccount(data: AccountData): Promise<{ success: boolean; error?: string; account?: any }> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        return { success: false, error: 'No estás autenticado' };
      }

      // Crear la cuenta
      const account = {
        name: data.name,
        type: data.type,
        balance: data.balance,
        currency: data.currency || 'COP',
        color: data.color || '#10b981', // Verde por defecto
        icon: data.icon || '💰',
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/accounts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(account),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Error al crear la cuenta' };
      }

      const result = await response.json();
      return { success: true, account: result.account };

    } catch (error) {
      console.error('Error creating account from Oti:', error);
      return { success: false, error: 'Error inesperado al crear la cuenta' };
    }
  }

  /**
   * Helper: Busca una categoría por nombre
   */
  private static async findCategoryByName(name: string): Promise<any | null> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return null;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/categories`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const categories = data.categories || [];

      // Buscar por nombre (case-insensitive)
      return categories.find((cat: any) => 
        cat.name.toLowerCase() === name.toLowerCase()
      ) || null;

    } catch (error) {
      console.error('Error finding category:', error);
      return null;
    }
  }

  /**
   * Helper: Busca una cuenta por nombre
   */
  private static async findAccountByName(name: string): Promise<any | null> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return null;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/accounts`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const accounts = data.accounts || [];

      // Buscar por nombre (case-insensitive)
      return accounts.find((acc: any) => 
        acc.name.toLowerCase() === name.toLowerCase()
      ) || null;

    } catch (error) {
      console.error('Error finding account:', error);
      return null;
    }
  }

  /**
   * Helper: Obtiene la cuenta por defecto
   */
  private static async getDefaultAccount(): Promise<any | null> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return null;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/accounts`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const accounts = data.accounts || [];

      // Retornar la primera cuenta disponible
      return accounts.length > 0 ? accounts[0] : null;

    } catch (error) {
      console.error('Error getting default account:', error);
      return null;
    }
  }
}