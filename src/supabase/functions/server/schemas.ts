/**
 * =====================================================
 * VALIDATION SCHEMAS
 * =====================================================
 * 
 * Schemas de validación para todos los endpoints.
 * 
 * NOTA: Este código usa Zod-like syntax pero está preparado
 * para funcionar con validación manual mientras no se instale Zod.
 * 
 * CUANDO INSTALES ZOD:
 * 1. npm install zod
 * 2. Descomentar la línea: import { z } from 'zod';
 * 3. Los schemas funcionarán automáticamente
 * 
 * =====================================================
 */

// TODO: Descomentar cuando instales Zod
// import { z } from 'zod';

// =====================================================
// MANUAL VALIDATION (mientras no hay Zod)
// =====================================================

interface ValidationResult {
  success: boolean;
  data?: any;
  error?: {
    errors: Array<{
      path: string[];
      message: string;
    }>;
  };
}

/**
 * Validador manual de transacciones
 */
export function validateTransaction(data: any): ValidationResult {
  const errors: Array<{ path: string[]; message: string }> = [];

  // Type
  if (!data.type || !['income', 'expense', 'transfer'].includes(data.type)) {
    errors.push({
      path: ['type'],
      message: 'Type must be income, expense, or transfer',
    });
  }

  // Amount
  if (typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push({
      path: ['amount'],
      message: 'Amount must be a positive number',
    });
  }

  if (data.amount > 999999999) {
    errors.push({
      path: ['amount'],
      message: 'Amount is too large',
    });
  }

  // Account ID
  if (!data.account_id || typeof data.account_id !== 'string') {
    errors.push({
      path: ['account_id'],
      message: 'Account ID is required',
    });
  }

  // Date
  if (!data.date) {
    errors.push({
      path: ['date'],
      message: 'Date is required',
    });
  }

  // Note (optional but max length)
  if (data.note && typeof data.note === 'string' && data.note.length > 500) {
    errors.push({
      path: ['note'],
      message: 'Note must be less than 500 characters',
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: { errors },
    };
  }

  return {
    success: true,
    data: {
      type: data.type,
      amount: data.amount,
      account_id: data.account_id,
      to_account_id: data.to_account_id,
      category_id: data.category_id,
      subcategory_id: data.subcategory_id,
      note: data.note,
      date: data.date,
    },
  };
}

/**
 * Validador manual de presupuestos
 */
export function validateBudget(data: any): ValidationResult {
  const errors: Array<{ path: string[]; message: string }> = [];

  // Category ID
  if (!data.category_id || typeof data.category_id !== 'string') {
    errors.push({
      path: ['category_id'],
      message: 'Category ID is required',
    });
  }

  // Amount
  if (typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push({
      path: ['amount'],
      message: 'Amount must be a positive number',
    });
  }

  if (data.amount > 999999999) {
    errors.push({
      path: ['amount'],
      message: 'Amount is too large',
    });
  }

  // Month (optional)
  if (data.month !== undefined && data.month !== null) {
    if (typeof data.month !== 'number' || data.month < 1 || data.month > 12) {
      errors.push({
        path: ['month'],
        message: 'Month must be between 1 and 12',
      });
    }
  }

  // Year (optional)
  if (data.year !== undefined && data.year !== null) {
    if (typeof data.year !== 'number' || data.year < 2020 || data.year > 2100) {
      errors.push({
        path: ['year'],
        message: 'Year must be between 2020 and 2100',
      });
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: { errors },
    };
  }

  return {
    success: true,
    data: {
      category_id: data.category_id,
      amount: data.amount,
      month: data.month,
      year: data.year,
    },
  };
}

/**
 * Validador manual de cuentas
 */
export function validateAccount(data: any): ValidationResult {
  const errors: Array<{ path: string[]; message: string }> = [];

  // Name
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({
      path: ['name'],
      message: 'Name is required',
    });
  }

  if (data.name && data.name.length > 100) {
    errors.push({
      path: ['name'],
      message: 'Name must be less than 100 characters',
    });
  }

  // Type
  if (!data.type || !['cash', 'bank', 'savings', 'credit'].includes(data.type)) {
    errors.push({
      path: ['type'],
      message: 'Type must be cash, bank, savings, or credit',
    });
  }

  // Balance (optional)
  if (data.balance !== undefined && typeof data.balance !== 'number') {
    errors.push({
      path: ['balance'],
      message: 'Balance must be a number',
    });
  }

  // Currency (optional)
  if (data.currency && (typeof data.currency !== 'string' || data.currency.length !== 3)) {
    errors.push({
      path: ['currency'],
      message: 'Currency must be a 3-letter code',
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: { errors },
    };
  }

  return {
    success: true,
    data: {
      name: data.name?.trim(),
      type: data.type,
      balance: data.balance,
      currency: data.currency,
    },
  };
}

/**
 * Validador de mensajes de chat
 */
export function validateChatMessage(data: any): ValidationResult {
  const errors: Array<{ path: string[]; message: string }> = [];

  // Message
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.push({
      path: ['message'],
      message: 'Message is required',
    });
  }

  if (data.message && data.message.length > 2000) {
    errors.push({
      path: ['message'],
      message: 'Message must be less than 2000 characters',
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: { errors },
    };
  }

  return {
    success: true,
    data: {
      message: data.message?.trim(),
    },
  };
}

// =====================================================
// SANITIZATION FUNCTIONS
// =====================================================

/**
 * Sanitizar texto (prevenir XSS)
 */
export function sanitizeText(text: string | undefined | null): string | undefined {
  if (!text) return undefined;

  return text
    .trim()
    .substring(0, 500)
    // Remover scripts
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remover iframes
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remover javascript: URLs
    .replace(/javascript:/gi, '')
    // Remover on* event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
}

/**
 * Sanitizar HTML (más agresivo)
 */
export function sanitizeHtml(html: string | undefined | null): string | undefined {
  if (!html) return undefined;

  return html
    .trim()
    .substring(0, 5000)
    // Remover TODOS los tags HTML
    .replace(/<[^>]*>/g, '')
    // Decodificar entidades HTML básicas
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Validar UUID
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validar email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// =====================================================
// ZOD SCHEMAS (Para cuando se instale Zod)
// =====================================================

/*
// Descomentar cuando instales Zod:

import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive().max(999999999),
  account_id: z.string().uuid(),
  to_account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  subcategory_id: z.string().uuid().optional(),
  note: z.string().max(500).optional(),
  date: z.string().datetime(),
});

export const budgetSchema = z.object({
  category_id: z.string().uuid(),
  amount: z.number().positive().max(999999999),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2020).max(2100).optional(),
});

export const accountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['cash', 'bank', 'savings', 'credit']),
  balance: z.number().optional(),
  currency: z.string().length(3).optional(),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
});

// Uso con Zod:
// const validation = transactionSchema.safeParse(data);
// if (!validation.success) { ... }
*/

// =====================================================
// EXPORTS
// =====================================================

export default {
  validateTransaction,
  validateBudget,
  validateAccount,
  validateChatMessage,
  sanitizeText,
  sanitizeHtml,
  isValidUuid,
  isValidEmail,
  isValidUrl,
};
