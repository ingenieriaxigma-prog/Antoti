/**
 * DATABASE SERVICE
 * 
 * Abstracción para operaciones de base de datos SQL
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';

/**
 * Timeout helper for database queries to prevent hanging
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000, // 30 seconds default
  operationName: string = 'Database operation'
): Promise<T> {
  let timeoutId: number;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${operationName} timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Crea un cliente de Supabase con Service Role (para operaciones en el servidor)
 */
export function getSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

/**
 * Validate if a string is a valid UUID
 */
function isValidUUID(id: string | undefined | null): boolean {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Clean empty strings and convert to null
 * This prevents "invalid input syntax for type uuid" errors
 */
function cleanEmptyToNull(value: string | undefined | null): string | null {
  if (!value || value === '' || value === 'NONE') {
    return null;
  }
  return value;
}

/**
 * Validate if an amount is within DECIMAL(15,2) range
 */
function isValidAmount(amount: number): boolean {
  // DECIMAL(15,2) max: 9,999,999,999,999.99
  return amount >= -9999999999999.99 && amount <= 9999999999999.99;
}

/**
 * Validate transaction data before insert/update
 */
function validateTransaction(transaction: Transaction): { valid: boolean; error?: string } {
  if (!isValidUUID(transaction.id)) {
    return { valid: false, error: `Invalid transaction ID format: "${transaction.id}". Expected UUID format (e.g., "a1b2c3d4-1234-5678-9abc-def012345678")` };
  }
  
  if (!isValidUUID(transaction.user_id)) {
    return { valid: false, error: `Invalid user_id format: "${transaction.user_id}". Expected UUID format` };
  }
  
  if (transaction.account_id && !isValidUUID(transaction.account_id)) {
    return { valid: false, error: `Invalid account_id format: "${transaction.account_id}". Expected UUID format` };
  }
  
  if (transaction.category_id && !isValidUUID(transaction.category_id)) {
    return { valid: false, error: `Invalid category_id format: "${transaction.category_id}". Expected UUID format` };
  }
  
  if (transaction.subcategory_id && !isValidUUID(transaction.subcategory_id)) {
    return { valid: false, error: `Invalid subcategory_id format: "${transaction.subcategory_id}". Expected UUID format` };
  }
  
  if (transaction.to_account_id && !isValidUUID(transaction.to_account_id)) {
    return { valid: false, error: `Invalid to_account_id format: "${transaction.to_account_id}". Expected UUID format` };
  }
  
  if (!isValidAmount(transaction.amount)) {
    return { valid: false, error: `Amount ${transaction.amount} is out of range. Must be between -9,999,999,999,999.99 and 9,999,999,999,999.99` };
  }
  
  return { valid: true };
}

/**
 * Validate account data before insert/update
 */
function validateAccount(account: Account): { valid: boolean; error?: string } {
  if (!isValidUUID(account.id)) {
    return { valid: false, error: `Invalid account ID format: "${account.id}". Expected UUID format (e.g., "a1b2c3d4-1234-5678-9abc-def012345678")` };
  }
  
  if (!isValidUUID(account.user_id)) {
    return { valid: false, error: `Invalid user_id format: "${account.user_id}". Expected UUID format` };
  }
  
  if (!isValidAmount(account.balance)) {
    return { valid: false, error: `Balance ${account.balance} is out of range. Must be between -9,999,999,999,999.99 and 9,999,999,999,999.99` };
  }
  
  return { valid: true };
}

// ==========================================
// TRANSACTIONS
// ==========================================

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string;
  category_id?: string;
  subcategory_id?: string;
  to_account_id?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  date: string;
  description?: string;
  receipt_url?: string; // ✨ Comprobante adjunto
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export async function getTransactions(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    type?: string;
    categoryId?: string;
  }
) {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('transactions_727b50c3')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false }); // ✅ SORT: Within same day, newest first

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  }

  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }

  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error getting transactions from SQL', error);
    throw new Error(`Error getting transactions: ${error.message}`);
  }

  // ✅ DEBUG: Log para verificar que account_id viene del servidor
  if (data && data.length > 0) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔵 [STEP 8] DB Query returned ${data.length} transactions`);
    console.log(`🔵 First transaction from DB:`, {
      id: data[0].id.substring(0, 8) + '...',
      account_id: data[0].account_id || 'MISSING ❌',
      to_account_id: data[0].to_account_id || null,
      type: data[0].type,
      amount: data[0].amount,
    });
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  }

  // Log transfer transactions to debug toAccount issue
  const transfers = (data || []).filter(t => t.type === 'transfer');
  if (transfers.length > 0) {
    console.log('🔍 [DB] Transfer transactions from database:', 
      transfers.map(t => ({
        id: t.id.substring(0, 8),
        account_id: t.account_id?.substring(0, 8),
        to_account_id: t.to_account_id?.substring(0, 8) || 'MISSING',
      }))
    );
  }

  return data || [];
}

export async function createTransaction(transaction: Transaction) {
  const supabase = getSupabaseClient();
  
  // ✅ FIX: Clean empty strings to null before validation
  const cleanedTransaction = {
    ...transaction,
    account_id: cleanEmptyToNull(transaction.account_id),
    category_id: cleanEmptyToNull(transaction.category_id),
    subcategory_id: cleanEmptyToNull(transaction.subcategory_id),
    to_account_id: cleanEmptyToNull(transaction.to_account_id),
  };
  
  const validation = validateTransaction(cleanedTransaction);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid transaction data");
  }
  
  const { data, error } = await supabase
    .from('transactions_727b50c3')
    .insert(cleanedTransaction)
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction in SQL', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error details:', error.details);
    console.error('   Error hint:', error.hint);
    
    if (error.code === '42P01') {
      throw new Error(`❌ La tabla 'transactions_727b50c3' no existe en Postgres. Por favor ejecuta el script MIGRATION_SQL.sql en el SQL Editor de Supabase.`);
    }
    
    throw new Error(`Error creating transaction: ${error.message}`);
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   ✅ [STEP 7] Transaction saved to DB successfully!`);
  console.log(`   ✅ Saved with account_id: ${data.account_id || 'null'}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  return data;
}

export async function updateTransaction(id: string, userId: string, updates: Partial<Transaction>) {
  const supabase = getSupabaseClient();
  
  // ✅ FIX: Clean empty strings to null before update
  const cleanedUpdates = { ...updates };
  if ('account_id' in cleanedUpdates) {
    cleanedUpdates.account_id = cleanEmptyToNull(cleanedUpdates.account_id);
  }
  if ('category_id' in cleanedUpdates) {
    cleanedUpdates.category_id = cleanEmptyToNull(cleanedUpdates.category_id);
  }
  if ('subcategory_id' in cleanedUpdates) {
    cleanedUpdates.subcategory_id = cleanEmptyToNull(cleanedUpdates.subcategory_id);
  }
  if ('to_account_id' in cleanedUpdates) {
    cleanedUpdates.to_account_id = cleanEmptyToNull(cleanedUpdates.to_account_id);
  }
  
  const { data, error } = await supabase
    .from('transactions_727b50c3')
    .update(cleanedUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction in SQL', error);
    throw new Error(`Error updating transaction: ${error.message}`);
  }

  return data;
}

export async function deleteTransaction(id: string, userId: string) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('transactions_727b50c3')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting transaction in SQL', error);
    throw new Error(`Error deleting transaction: ${error.message}`);
  }
}

// ==========================================
// ACCOUNTS
// ==========================================

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'cash' | 'bank' | 'card' | 'digital';
  balance: number;
  icon?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getAccounts(userId: string) {
  const supabase = getSupabaseClient();
  
  // Obtener cuentas
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts_727b50c3')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (accountsError) {
    console.error('Error getting accounts from SQL', accountsError);
    throw new Error(`Error getting accounts: ${accountsError.message}`);
  }

  if (!accounts || accounts.length === 0) {
    return [];
  }

  // ✅ FIX: Calcular balances dinámicamente basándose en transacciones
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions_727b50c3')
    .select('type, amount, account_id, to_account_id')
    .eq('user_id', userId);

  if (transactionsError) {
    console.error('Error getting transactions for balance calculation', transactionsError);
    // Si falla obtener transacciones, devolver cuentas con balance del DB
    return accounts;
  }

  // Calcular balance por cuenta
  const balancesByAccount: Record<string, number> = {};
  
  // Inicializar balances en 0
  accounts.forEach(acc => {
    balancesByAccount[acc.id] = 0;
  });

  // Procesar transacciones y calcular balances reales
  if (transactions) {
    console.log(`🔍 Processing ${transactions.length} transactions for balance calculation...`);
    
    // Log de ejemplo de transacciones
    if (transactions.length > 0) {
      console.log(`   📊 Sample transaction:`, {
        type: transactions[0].type,
        amount: transactions[0].amount,
        account_id: transactions[0].account_id,
        to_account_id: transactions[0].to_account_id
      });
    }
    
    // Log de IDs de cuentas disponibles
    console.log(`   📊 Available account IDs:`, accounts.map(a => a.id));
    
    transactions.forEach(tx => {
      // ✅ LOG DETALLADO para debugging
      const hasValidAccountId = tx.account_id && accounts.some(a => a.id === tx.account_id);
      
      if (!hasValidAccountId && tx.account_id) {
        console.warn(`   ⚠️  Transaction with INVALID account_id: ${tx.account_id} (type: ${tx.type}, amount: ${tx.amount})`);
        console.warn(`   ⚠️  This transaction will be IGNORED in balance calculation`);
      }
      
      if (tx.type === 'income' && tx.account_id) {
        // Ingreso: suma al balance de la cuenta
        if (balancesByAccount[tx.account_id] !== undefined) {
          balancesByAccount[tx.account_id] = (balancesByAccount[tx.account_id] || 0) + tx.amount;
          console.log(`   ✅ Income: +$${tx.amount} to account ${tx.account_id.substring(0, 8)}... (new balance: $${balancesByAccount[tx.account_id]})`);
        }
      } else if (tx.type === 'expense' && tx.account_id) {
        // Gasto: resta del balance de la cuenta
        if (balancesByAccount[tx.account_id] !== undefined) {
          balancesByAccount[tx.account_id] = (balancesByAccount[tx.account_id] || 0) - tx.amount;
          console.log(`   ✅ Expense: -$${tx.amount} from account ${tx.account_id.substring(0, 8)}... (new balance: $${balancesByAccount[tx.account_id]})`);
        }
      } else if (tx.type === 'transfer' && tx.account_id && tx.to_account_id) {
        // Transferencia: resta de cuenta origen y suma a cuenta destino
        if (balancesByAccount[tx.account_id] !== undefined) {
          balancesByAccount[tx.account_id] = (balancesByAccount[tx.account_id] || 0) - tx.amount;
          console.log(`   ✅ Transfer: -$${tx.amount} from ${tx.account_id.substring(0, 8)}...`);
        }
        if (balancesByAccount[tx.to_account_id] !== undefined) {
          balancesByAccount[tx.to_account_id] = (balancesByAccount[tx.to_account_id] || 0) + tx.amount;
          console.log(`   ✅ Transfer: +$${tx.amount} to ${tx.to_account_id.substring(0, 8)}...`);
        }
      }
    });
  }

  // Actualizar balances en las cuentas
  const accountsWithCalculatedBalances = accounts.map(acc => ({
    ...acc,
    balance: balancesByAccount[acc.id] || 0
  }));

  console.log(`✅ Accounts balances calculated from ${transactions?.length || 0} transactions`);
  
  return accountsWithCalculatedBalances;
}

export async function createAccount(account: Account) {
  const supabase = getSupabaseClient();
  
  const validation = validateAccount(account);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid account data");
  }
  
  // Use UPSERT to handle duplicate IDs gracefully
  const { data, error } = await supabase
    .from('accounts_727b50c3')
    .upsert(account, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error creating/updating account in SQL', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error details:', error.details);
    console.error('   Error hint:', error.hint);
    
    if (error.code === '42P01') {
      throw new Error(`❌ La tabla 'accounts_727b50c3' no existe en Postgres. Por favor ejecuta el script MIGRATION_SQL.sql en el SQL Editor de Supabase.`);
    }
    
    throw new Error(`Error creating/updating account: ${error.message}`);
  }

  return data;
}

export async function updateAccount(id: string, userId: string, updates: Partial<Account>) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('accounts_727b50c3')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating account in SQL', error);
    throw new Error(`Error updating account: ${error.message}`);
  }

  return data;
}

export async function deleteAccount(id: string, userId: string) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('accounts_727b50c3')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting account in SQL', error);
    throw new Error(`Error deleting account: ${error.message}`);
  }
}

// ==========================================
// CATEGORIES
// ==========================================

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  emoji?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  // ⚠️ NO incluimos emoji porque la tabla en BD no tiene esa columna
  created_at?: string;
}

export async function getCategories(userId: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('categories_727b50c3')
    .select(`
      *,
      subcategories_727b50c3 (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error getting categories from SQL', error);
    throw new Error(`Error getting categories: ${error.message}`);
  }

  return data || [];
}

export async function createCategory(category: Category) {
  const supabase = getSupabaseClient();
  
  // Use UPSERT to handle duplicate IDs gracefully
  const { data, error } = await supabase
    .from('categories_727b50c3')
    .upsert(category, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error creating/updating category in SQL', error);
    throw new Error(`Error creating/updating category: ${error.message}`);
  }

  return data;
}

export async function updateCategory(id: string, userId: string, updates: Partial<Category>) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('categories_727b50c3')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating category in SQL', error);
    throw new Error(`Error updating category: ${error.message}`);
  }

  return data;
}

export async function deleteCategory(id: string, userId: string) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('categories_727b50c3')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting category in SQL', error);
    throw new Error(`Error deleting category: ${error.message}`);
  }
}

export async function createSubcategory(subcategory: Subcategory) {
  const supabase = getSupabaseClient();
  
  // Use UPSERT to handle duplicate IDs gracefully
  const { data, error } = await supabase
    .from('subcategories_727b50c3')
    .upsert(subcategory, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error creating/updating subcategory in SQL', error);
    throw new Error(`Error creating/updating subcategory: ${error.message}`);
  }

  return data;
}

export async function deleteSubcategory(id: string) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('subcategories_727b50c3')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting subcategory in SQL', error);
    throw new Error(`Error deleting subcategory: ${error.message}`);
  }
}

export async function deleteSubcategoriesByCategoryId(categoryId: string) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('subcategories_727b50c3')
    .delete()
    .eq('category_id', categoryId);

  if (error) {
    console.error('Error deleting subcategories by category_id in SQL', error);
    throw new Error(`Error deleting subcategories by category: ${error.message}`);
  }
}

// ==========================================
// BUDGETS
// ==========================================

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  month?: number | null;        // ✨ NEW: 0-11 for monthly budgets (null = applies to all months)
  year?: number | null;         // ✨ NEW: 2024, 2025, etc. (null = applies to all years)
  alert_threshold?: number;
  created_at?: string;
  updated_at?: string;
}

export async function getBudgets(userId: string) {
  const supabase = getSupabaseClient();
  
  console.log(`📥 [DB] Getting budgets for user: ${userId}`);
  
  const { data, error } = await supabase
    .from('budgets_727b50c3')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ [DB] Error getting budgets from SQL', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error details:', error.details);
    throw new Error(`Error getting budgets: ${error.message}`);
  }

  console.log(`✅ [DB] Found ${data?.length || 0} budgets for user ${userId.substring(0, 8)}`);
  if (data && data.length > 0) {
    console.log(`   📊 First budget:`, data[0]);
  }

  return data || [];
}

export async function createBudget(budget: Budget) {
  const supabase = getSupabaseClient();
  
  console.log(`💾 [DB] Creating/updating budget ${budget.id.substring(0, 8)}: categoryId=${budget.category_id}, amount=${budget.amount}, period=${budget.period}, month=${budget.month ?? 'null'}, year=${budget.year ?? 'null'}`);
  
  // 🔑 STEP 1: Check if this exact ID already exists in the database
  const { data: budgetById, error: idCheckError } = await supabase
    .from('budgets_727b50c3')
    .select('*')
    .eq('id', budget.id)
    .maybeSingle();
  
  if (idCheckError) {
    console.error('❌ [DB] Error checking budget by ID', idCheckError);
    throw new Error(`Error checking budget by ID: ${idCheckError.message}`);
  }
  
  // 🔑 STEP 2: Check if a budget exists for this user+category+period+month+year combination
  let query = supabase
    .from('budgets_727b50c3')
    .select('*')
    .eq('user_id', budget.user_id)
    .eq('category_id', budget.category_id)
    .eq('period', budget.period);
  
  // Handle NULL values for month and year in the query
  if (budget.month === null || budget.month === undefined) {
    query = query.is('month', null);
  } else {
    query = query.eq('month', budget.month);
  }
  
  if (budget.year === null || budget.year === undefined) {
    query = query.is('year', null);
  } else {
    query = query.eq('year', budget.year);
  }
  
  const { data: budgetByConstraint, error: checkError } = await query.maybeSingle();
  
  if (checkError) {
    console.error('❌ [DB] Error checking existing budget', checkError);
    throw new Error(`Error checking budget: ${checkError.message}`);
  }
  
  let data, error;
  
  // 🎯 DECISION LOGIC:
  // Case 1: Budget exists with same ID → UPDATE it
  if (budgetById) {
    console.log(`🔄 [DB] Budget exists with ID ${budget.id.substring(0, 8)}, updating...`);
    
    const result = await supabase
      .from('budgets_727b50c3')
      .update({
        category_id: budget.category_id,
        amount: budget.amount,
        period: budget.period,
        month: budget.month ?? null,
        year: budget.year ?? null,
        alert_threshold: budget.alert_threshold,
        updated_at: new Date().toISOString(),
      })
      .eq('id', budget.id)
      .eq('user_id', budget.user_id)
      .select()
      .single();
    
    data = result.data;
    error = result.error;
  }
  // Case 2: Different budget exists with same constraint → ERROR (conflict)
  else if (budgetByConstraint) {
    console.error(`❌ [DB] Conflict: Budget already exists for user=${budget.user_id}, category=${budget.category_id}, period=${budget.period}, month=${budget.month ?? 'null'}, year=${budget.year ?? 'null'}`);
    throw new Error(`Budget already exists for this category and period`);
  }
  // Case 3: No budget exists → INSERT new one
  else {
    console.log(`➕ [DB] No existing budget found, inserting new one...`);
    
    // Ensure month and year are explicitly set to null if undefined
    const budgetToInsert = {
      ...budget,
      month: budget.month ?? null,
      year: budget.year ?? null,
    };
    
    const result = await supabase
      .from('budgets_727b50c3')
      .insert(budgetToInsert)
      .select()
      .single();
    
    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error('❌ [DB] Error creating/updating budget in SQL', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error details:', error.details);
    console.error('   Error hint:', error.hint);
    console.error('   Budget data:', budget);
    throw new Error(`Error creating budget: ${error.message}`);
  }

  console.log(`✅ [DB] Budget ${budget.id.substring(0, 8)} saved successfully`);
  return data;
}

export async function updateBudget(id: string, userId: string, updates: Partial<Budget>) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('budgets_727b50c3')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating budget in SQL', error);
    throw new Error(`Error updating budget: ${error.message}`);
  }

  return data;
}

export async function deleteBudget(id: string, userId: string) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('budgets_727b50c3')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting budget in SQL', error);
    throw new Error(`Error deleting budget: ${error.message}`);
  }
}

// ==========================================
// USERS DATA
// ==========================================

export interface UserData {
  id: string;
  settings?: any;
  currency?: string;
  theme?: string;
  color_theme?: string;
  dark_mode?: boolean;
  pin_enabled?: boolean;
  pin_hash?: string;
  biometric_enabled?: boolean;
  disabled?: boolean;        // NEW: Track if user is disabled by admin
  photo_url?: string;        // NEW: Profile photo URL
  created_at?: string;
  updated_at?: string;
}

export async function getUserData(userId: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('users_data')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error getting user data from SQL', error);
    throw new Error(`Error getting user data: ${error.message}`);
  }

  return data;
}

export async function upsertUserData(userData: UserData) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('users_data')
    .upsert(userData)
    .select()
    .single();

  if (error) {
    console.error('Error upserting user data in SQL', error);
    throw new Error(`Error upserting user data: ${error.message}`);
  }

  return data;
}

// Helper function to check if user is disabled
export async function isUserDisabled(userId: string): Promise<boolean> {
  const userData = await getUserData(userId);
  return userData?.disabled === true;
}

// Helper function to toggle user disabled status
export async function toggleUserDisabled(userId: string): Promise<boolean> {
  const userData = await getUserData(userId);
  const newDisabledStatus = !(userData?.disabled === true);
  
  await upsertUserData({
    id: userId,
    disabled: newDisabledStatus,
  });
  
  return newDisabledStatus;
}

// Helper function to get/set photo URL
export async function getUserPhotoUrl(userId: string): Promise<string | null> {
  return withTimeout(
    (async () => {
      const userData = await getUserData(userId);
      return userData?.photo_url || null;
    })(),
    10000, // 10 second timeout
    'getUserPhotoUrl'
  );
}

export async function setUserPhotoUrl(userId: string, photoUrl: string | null): Promise<void> {
  await upsertUserData({
    id: userId,
    photo_url: photoUrl || undefined,
  });
}

// ==========================================
// USER CLEANUP FUNCTIONS
// ==========================================

/**
 * Delete ALL user data from Postgres
 * This is used for complete cleanup when a user is deleted
 */
export async function deleteAllUserData(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  console.log(`🗑️  Deleting ALL data for user: ${userId}`);
  
  // Delete in order to respect foreign key constraints
  // 1. Delete transactions (references accounts, categories)
  const { error: txError } = await supabase
    .from('transactions_727b50c3')
    .delete()
    .eq('user_id', userId);
  
  if (txError) {
    console.error('Error deleting transactions:', txError);
    throw new Error(`Error deleting transactions: ${txError.message}`);
  }
  console.log(`   ✅ Deleted transactions for user: ${userId}`);
  
  // 2. Delete budgets (references categories)
  const { error: budgetError } = await supabase
    .from('budgets_727b50c3')
    .delete()
    .eq('user_id', userId);
  
  if (budgetError) {
    console.error('Error deleting budgets:', budgetError);
    throw new Error(`Error deleting budgets: ${budgetError.message}`);
  }
  console.log(`   ✅ Deleted budgets for user: ${userId}`);
  
  // 3. Delete subcategories (child of categories)
  const { data: categories } = await supabase
    .from('categories_727b50c3')
    .select('id')
    .eq('user_id', userId);
  
  if (categories && categories.length > 0) {
    const categoryIds = categories.map(c => c.id);
    const { error: subCatError } = await supabase
      .from('subcategories_727b50c3')
      .delete()
      .in('category_id', categoryIds);
    
    if (subCatError) {
      console.error('Error deleting subcategories:', subCatError);
      throw new Error(`Error deleting subcategories: ${subCatError.message}`);
    }
    console.log(`   ✅ Deleted subcategories for user: ${userId}`);
  }
  
  // 4. Delete categories
  const { error: catError } = await supabase
    .from('categories_727b50c3')
    .delete()
    .eq('user_id', userId);
  
  if (catError) {
    console.error('Error deleting categories:', catError);
    throw new Error(`Error deleting categories: ${catError.message}`);
  }
  console.log(`   ✅ Deleted categories for user: ${userId}`);
  
  // 5. Delete accounts
  const { error: accError } = await supabase
    .from('accounts_727b50c3')
    .delete()
    .eq('user_id', userId);
  
  if (accError) {
    console.error('Error deleting accounts:', accError);
    throw new Error(`Error deleting accounts: ${accError.message}`);
  }
  console.log(`   ✅ Deleted accounts for user: ${userId}`);
  
  // 6. Delete user_data (profile)
  const { error: userDataError } = await supabase
    .from('users_data')
    .delete()
    .eq('id', userId);
  
  if (userDataError) {
    console.error('Error deleting user_data:', userDataError);
    throw new Error(`Error deleting user_data: ${userDataError.message}`);
  }
  console.log(`   ✅ Deleted user_data for user: ${userId}`);
  
  // 7. Delete OtiChat conversations from database (CASCADE will delete messages)
  // CRITICAL: This table has FK to auth.users - MUST be deleted before Auth deletion
  try {
    const { data: conversations, error: countError } = await supabase
      .from('chat_conversations_727b50c3')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);
    
    if (countError) {
      console.error('⚠️  Error counting OtiChat conversations:', countError);
    } else {
      console.log(`   📊 Found ${conversations?.length || 0} chat conversations to delete`);
    }
    
    const { error: chatError } = await supabase
      .from('chat_conversations_727b50c3')
      .delete()
      .eq('user_id', userId);
    
    if (chatError) {
      console.error('❌ CRITICAL: Error deleting OtiChat conversations:', chatError);
      console.error('   This will prevent Auth deletion!');
      throw new Error(`Failed to delete chat conversations: ${chatError.message}`);
    } else {
      console.log(`   ✅ Deleted ${conversations?.length || 0} OtiChat conversations for user: ${userId}`);
    }
    
    // ✅ DOUBLE CHECK: Verify conversations were actually deleted
    const { data: remainingConversations, error: checkError } = await supabase
      .from('chat_conversations_727b50c3')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);
    
    if (checkError) {
      console.warn('⚠️  Warning: Could not verify conversation deletion:', checkError);
    } else if (remainingConversations && remainingConversations.length > 0) {
      // Still have conversations - try one more time with individual deletes
      console.error(`❌ CRITICAL: ${remainingConversations.length} conversations still remain after delete!`);
      console.log(`   🔄 Attempting individual delete for each conversation...`);
      
      for (const conv of remainingConversations) {
        const { error: individualError } = await supabase
          .from('chat_conversations_727b50c3')
          .delete()
          .eq('id', conv.id);
        
        if (individualError) {
          console.error(`   ❌ Failed to delete conversation ${conv.id}:`, individualError);
        } else {
          console.log(`   ✅ Deleted conversation ${conv.id}`);
        }
      }
      
      // Final verification
      const { data: finalCheck } = await supabase
        .from('chat_conversations_727b50c3')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);
      
      if (finalCheck && finalCheck.length > 0) {
        throw new Error(`Failed to delete all conversations. ${finalCheck.length} still remain.`);
      }
    } else {
      console.log(`   ✅ Verified: All conversations deleted successfully`);
    }
  } catch (error) {
    console.error('❌ CRITICAL: Exception deleting OtiChat conversations:', error);
    throw error;
  }
  
  // Also cleanup any old conversations in KV store (legacy data)
  try {
    const prefix = `conversation:${userId}:`;
    const conversations = await kv.getByPrefix(prefix);
    
    if (conversations && conversations.length > 0) {
      const deletePromises = conversations.map((conv: any) => {
        const key = `conversation:${userId}:${conv.id}`;
        return kv.del(key);
      });
      await Promise.all(deletePromises);
      console.log(`   ✅ Deleted ${conversations.length} legacy OtiChat conversations from KV`);
    }
  } catch (error) {
    console.error('⚠️  Error deleting legacy KV conversations:', error);
  }
  
  // 8. Delete family/group related data (CRITICAL: Must be before Auth deletion due to FK constraints)
  // Delete group memberships
  const { error: memberError } = await supabase
    .from('group_members_727b50c3')
    .delete()
    .eq('user_id', userId);
  
  if (memberError) {
    console.error('⚠️  Error deleting group memberships:', memberError);
    // Don't throw - continue with cleanup
  } else {
    console.log(`   ✅ Deleted group memberships for user: ${userId}`);
  }
  
  // Delete invitations sent by this user
  const { error: inviteSentError } = await supabase
    .from('family_invitations_727b50c3')
    .delete()
    .eq('invited_by', userId);
  
  if (inviteSentError) {
    console.error('⚠️  Error deleting invitations sent:', inviteSentError);
  } else {
    console.log(`   ✅ Deleted invitations sent by user: ${userId}`);
  }
  
  // Delete groups owned/created by this user (CASCADE will handle related data)
  const { error: groupError } = await supabase
    .from('family_groups_727b50c3')
    .delete()
    .eq('created_by', userId);
  
  if (groupError) {
    console.error('⚠️  Error deleting groups:', groupError);
  } else {
    console.log(`   ✅ Deleted groups created by user: ${userId}`);
  }
  
  // 9. Delete user devices (MIGRATED from KV store)
  const { error: devicesError } = await supabase
    .from('user_devices_727b50c3')
    .delete()
    .eq('user_id', userId);
  
  if (devicesError) {
    console.error('⚠️  Error deleting user devices:', devicesError);
  } else {
    console.log(`   ✅ Deleted user devices for user: ${userId}`);
  }
  
  // 10. Delete notifications
  const { error: notificationsError } = await supabase
    .from('notifications_727b50c3')
    .delete()
    .eq('user_id', userId);
  
  if (notificationsError) {
    console.error('⚠️  Error deleting notifications:', notificationsError);
  } else {
    console.log(`   ✅ Deleted notifications for user: ${userId}`);
  }
  
  // 11. Clean any remaining KV store data (should be empty now, but just in case)
  // This includes any legacy data that wasn't migrated
  try {
    const { count: kvCount } = await supabase
      .from('kv_store_727b50c3')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (kvCount && kvCount > 0) {
      const { error: kvError } = await supabase
        .from('kv_store_727b50c3')
        .delete()
        .eq('user_id', userId);
      
      if (kvError) {
        console.error('⚠️  Error deleting KV store data:', kvError);
      } else {
        console.log(`   ✅ Deleted ${kvCount} legacy KV store entries for user: ${userId}`);
      }
    }
  } catch (error) {
    console.error('⚠️  Error checking/deleting KV store:', error);
  }
  
  console.log(`🎉 Successfully deleted ALL data for user: ${userId}`);
}

/**
 * Find user ID by email
 */
export async function getUserIdByEmail(email: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  
  // We need to query Supabase Auth to get the user ID by email
  // This requires using the admin API
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error listing users:', error);
    throw new Error(`Error listing users: ${error.message}`);
  }
  
  const user = users?.find(u => u.email === email);
  return user?.id || null;
}

// ==========================================
// DATA CLEANUP FUNCTIONS
// ==========================================

/**
 * Clean invalid data with non-UUID IDs for a specific user
 * This removes old data with invalid ID formats like "a1111111-0000-0000-0000-000000000001"
 */
export async function cleanInvalidUserData(userId: string): Promise<{
  deletedAccounts: number;
  deletedCategories: number;
  deletedSubcategories: number;
  deletedTransactions: number;
  deletedBudgets: number;
}> {
  const supabase = getSupabaseClient();
  
  console.log(`🧹 Cleaning invalid data for user: ${userId}`);
  
  let deletedAccounts = 0;
  let deletedCategories = 0;
  let deletedSubcategories = 0;
  let deletedTransactions = 0;
  let deletedBudgets = 0;
  
  // Helper function to check if ID is valid UUID
  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };
  
  // ========================================
  // STEP 1: Get all valid account IDs for this user
  // ========================================
  const { data: accounts } = await supabase
    .from('accounts_727b50c3')
    .select('id')
    .eq('user_id', userId);
  
  const validAccountIds = new Set(accounts?.map(a => a.id) || []);
  console.log(`   📊 Found ${validAccountIds.size} valid accounts for user`);
  
  // ========================================
  // STEP 2: Get all valid category IDs for this user
  // ========================================
  const { data: categories } = await supabase
    .from('categories_727b50c3')
    .select('id')
    .eq('user_id', userId);
  
  const validCategoryIds = new Set(categories?.map(c => c.id) || []);
  console.log(`   📊 Found ${validCategoryIds.size} valid categories for user`);
  console.log(`   📊 Valid category IDs (first 5):`, Array.from(validCategoryIds).slice(0, 5).map(id => id.substring(0, 16)));
  
  // ========================================
  // STEP 3: Clean transactions with invalid references
  // ========================================
  const { data: transactions } = await supabase
    .from('transactions_727b50c3')
    .select('*')
    .eq('user_id', userId);
  
  console.log(`   📊 Found ${transactions?.length || 0} total transactions for user`);
  
  if (transactions) {
    for (const tx of transactions) {
      let shouldDelete = false;
      let reason = '';
      
      // Check if transaction ID is invalid
      if (!isValidUUID(tx.id)) {
        shouldDelete = true;
        reason = 'Invalid transaction ID';
      }
      
      // ✅ FIX CRÍTICO: NO borrar transacciones con cuentas inexistentes
      // En su lugar, LIMPIAR las referencias inválidas y mantener la transacción
      let shouldCleanAccount = false;
      let shouldCleanToAccount = false;
      
      // Check if account_id references a non-existent account
      if (tx.account_id && !validAccountIds.has(tx.account_id)) {
        shouldCleanAccount = true;
        console.log(`   🧹 Transaction ${tx.id.substring(0, 8)} has invalid account_id: ${tx.account_id.substring(0, 8)} - will clean reference`);
      }
      
      // Check if to_account_id references a non-existent account (for transfers)
      if (tx.to_account_id && !validAccountIds.has(tx.to_account_id)) {
        shouldCleanToAccount = true;
        console.log(`   🧹 Transaction ${tx.id.substring(0, 8)} has invalid to_account_id: ${tx.to_account_id.substring(0, 8)} - will clean reference`);
      }
      
      // ✅ FIX: NO eliminar transacciones por categorías inválidas - solo limpiar la referencia
      // ❌ DESHABILITADO: La limpieza de categorías está causando que las transacciones pierdan sus categorías
      // Las categorías pueden crearse después de las transacciones, especialmente en el primer login
      // Check if category_id references a non-existent category
      let shouldCleanCategory = false;
      /*
      if (tx.category_id && !validCategoryIds.has(tx.category_id)) {
        shouldCleanCategory = true;
        console.log(`   🧹 Transaction ${tx.id.substring(0, 8)} has invalid category_id: ${tx.category_id.substring(0, 8)} - will clean reference`);
      }
      */
      
      // ✅ Limpiar referencias inválidas en lugar de borrar la transacción
      // ⚠️ DESHABILITADO: NO limpiar categorías para evitar pérdida de datos
      if ((shouldCleanAccount || shouldCleanToAccount || shouldCleanCategory) && !shouldDelete) {
        const updates: any = {};
        
        if (shouldCleanAccount) {
          updates.account_id = null;
        }
        
        if (shouldCleanToAccount) {
          updates.to_account_id = null;
        }
        
        if (shouldCleanCategory) {
          updates.category_id = null;
          updates.subcategory_id = null; // También limpiar subcategoría si la categoría es inválida
        }
        
        const { error } = await supabase
          .from('transactions_727b50c3')
          .update(updates)
          .eq('id', tx.id)
          .eq('user_id', userId);
        
        if (!error) {
          const cleanedFields = Object.keys(updates).join(', ');
          console.log(`   ✅ Cleaned invalid references (${cleanedFields}) from transaction ${tx.id.substring(0, 8)}`);
        } else {
          console.error(`   ❌ Error cleaning transaction ${tx.id.substring(0, 8)}:`, error);
        }
      }
      
      // Solo borrar si el ID de la transacción es inválido
      if (shouldDelete) {
        const { error } = await supabase
          .from('transactions_727b50c3')
          .delete()
          .eq('id', tx.id)
          .eq('user_id', userId);
        
        if (!error) {
          deletedTransactions++;
          console.log(`   🗑️  Deleted transaction ${tx.id.substring(0, 8)}: ${reason}`);
        }
      }
    }
  }
  
  // ========================================
  // STEP 4: Clean budgets with invalid references
  // ========================================
  const { data: budgets } = await supabase
    .from('budgets_727b50c3')
    .select('*')
    .eq('user_id', userId);
  
  // ✅ FIX: Helper to check if category is a default system category
  // Default categories start with specific patterns and should never be deleted
  const isDefaultCategory = (categoryId: string): boolean => {
    if (!categoryId) return false;
    // Income categories: 11111111-1111-4111-a111-1111111111XX
    // Expense categories: 22222222-2222-4222-a222-2222222222XX
    return categoryId.startsWith('11111111-1111-4111-a111') || 
           categoryId.startsWith('22222222-2222-4222-a222');
  };
  
  if (budgets) {
    for (const budget of budgets) {
      const hasInvalidId = !isValidUUID(budget.id);
      // ✅ FIX: Don't delete budgets with default system categories
      // Only delete if category is NOT default AND not in user's custom categories
      const hasInvalidCategoryId = budget.category_id && 
                                   !isDefaultCategory(budget.category_id) && 
                                   !validCategoryIds.has(budget.category_id);
      
      if (hasInvalidId || hasInvalidCategoryId) {
        const { error } = await supabase
          .from('budgets_727b50c3')
          .delete()
          .eq('id', budget.id)
          .eq('user_id', userId);
        
        if (!error) {
          deletedBudgets++;
          const reason = hasInvalidId ? 'Invalid budget ID' : 'Invalid category reference';
          console.log(`   🗑️  Deleted budget ${budget.id.substring(0, 8)}: ${reason}`);
        }
      }
    }
  }
  
  // ========================================
  // STEP 5: Clean orphaned subcategories
  // ========================================
  for (const categoryId of validCategoryIds) {
    const { data: subcategories } = await supabase
      .from('subcategories_727b50c3')
      .select('id')
      .eq('category_id', categoryId);
    
    if (subcategories) {
      for (const subcategory of subcategories) {
        if (!isValidUUID(subcategory.id)) {
          const { error } = await supabase
            .from('subcategories_727b50c3')
            .delete()
            .eq('id', subcategory.id);
          
          if (!error) {
            deletedSubcategories++;
            console.log(`   🗑️  Deleted subcategory with invalid ID: ${subcategory.id}`);
          }
        }
      }
    }
  }
  
  console.log(`✅ Cleanup complete:`, {
    deletedAccounts,
    deletedCategories,
    deletedSubcategories,
    deletedTransactions,
    deletedBudgets
  });
  
  return {
    deletedAccounts,
    deletedCategories,
    deletedSubcategories,
    deletedTransactions,
    deletedBudgets
  };
}