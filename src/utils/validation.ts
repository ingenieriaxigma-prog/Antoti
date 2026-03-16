/**
 * Validation Utilities
 * 
 * Helper functions for validating data in the frontend.
 * 
 * ⚠️ NOTE: These validators are for frontend feedback only.
 * The backend has its own validation layer that is the source of truth.
 */

import { Account, Transaction, Category, Budget } from '../types';

/**
 * Validate if a string is a valid UUID
 */
export function isValidUUID(id: string | undefined | null): boolean {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validate if an amount is within DECIMAL(15,2) range
 */
export function isValidAmount(amount: number): boolean {
  // DECIMAL(15,2) max: 9,999,999,999,999.99
  return amount >= -9999999999999.99 && amount <= 9999999999999.99;
}

/**
 * Validate account data
 */
export function validateAccount(account: Account): { valid: boolean; error?: string } {
  if (!isValidUUID(account.id)) {
    return { 
      valid: false, 
      error: `ID de cuenta inválido: "${account.id}". Se espera formato UUID (ej: "a1b2c3d4-1234-5678-9abc-def012345678")` 
    };
  }
  
  if (!isValidAmount(account.balance)) {
    return { 
      valid: false, 
      error: `Balance ${account.balance} fuera de rango. Debe estar entre -9,999,999,999,999.99 y 9,999,999,999,999.99` 
    };
  }
  
  return { valid: true };
}

/**
 * Validate transaction data
 */
export function validateTransaction(transaction: Transaction): { valid: boolean; error?: string } {
  if (!isValidUUID(transaction.id)) {
    return { 
      valid: false, 
      error: `ID de transacción inválido: "${transaction.id}". Se espera formato UUID` 
    };
  }
  
  if (transaction.account && !isValidUUID(transaction.account)) {
    return { 
      valid: false, 
      error: `ID de cuenta inválido: "${transaction.account}". Se espera formato UUID` 
    };
  }
  
  // ✅ Las transferencias NO deben validar category/subcategory
  if (transaction.type !== 'transfer') {
    if (transaction.category && !isValidUUID(transaction.category)) {
      return { 
        valid: false, 
        error: `ID de categoría inválido: "${transaction.category}". Se espera formato UUID` 
      };
    }
    
    if (transaction.subcategory && !isValidUUID(transaction.subcategory)) {
      return { 
        valid: false, 
        error: `ID de subcategoría inválido: "${transaction.subcategory}". Se espera formato UUID` 
      };
    }
  }
  
  if (transaction.toAccount && !isValidUUID(transaction.toAccount)) {
    return { 
      valid: false, 
      error: `ID de cuenta destino inválido: "${transaction.toAccount}". Se espera formato UUID` 
    };
  }
  
  if (!isValidAmount(transaction.amount)) {
    return { 
      valid: false, 
      error: `Monto ${transaction.amount} fuera de rango. Debe estar entre -9,999,999,999,999.99 y 9,999,999,999,999.99` 
    };
  }
  
  return { valid: true };
}

/**
 * Validate category data
 */
export function validateCategory(category: Category): { valid: boolean; error?: string } {
  if (!isValidUUID(category.id)) {
    return { 
      valid: false, 
      error: `ID de categoría inválido: "${category.id}". Se espera formato UUID` 
    };
  }
  
  // Validate subcategories
  if (category.subcategories) {
    for (const sub of category.subcategories) {
      if (!isValidUUID(sub.id)) {
        return { 
          valid: false, 
          error: `ID de subcategoría inválido: "${sub.id}" (${sub.name}). Se espera formato UUID` 
        };
      }
      if (!isValidUUID(sub.categoryId)) {
        return { 
          valid: false, 
          error: `ID de categoría padre inválido en subcategoría: "${sub.categoryId}". Se espera formato UUID` 
        };
      }
    }
  }
  
  return { valid: true };
}

/**
 * Validate budget data
 */
export function validateBudget(budget: Budget): { valid: boolean; error?: string } {
  if (!isValidUUID(budget.id)) {
    return { 
      valid: false, 
      error: `ID de presupuesto inválido: "${budget.id}". Se espera formato UUID` 
    };
  }
  
  if (!isValidUUID(budget.categoryId)) {
    return { 
      valid: false, 
      error: `ID de categoría inválido: "${budget.categoryId}". Se espera formato UUID` 
    };
  }
  
  if (!isValidAmount(budget.amount)) {
    return { 
      valid: false, 
      error: `Monto ${budget.amount} fuera de rango. Debe estar entre -9,999,999,999,999.99 y 9,999,999,999,999.99` 
    };
  }
  
  return { valid: true };
}

/**
 * Filter valid categories from array
 * 
 * Note: This is kept because it performs actual validation logic.
 * The backend handles final validation, but this provides early feedback.
 */
export function filterValidCategories(categories: Category[]): Category[] {
  return categories.filter(cat => {
    const validation = validateCategory(cat);
    if (!validation.valid) {
      console.log(`🧹 Filtrando categoría con datos antiguos: ${validation.error} (se limpiará automáticamente)`);
      return false;
    }
    return true;
  });
}
