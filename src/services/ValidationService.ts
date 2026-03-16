/**
 * ValidationService - Centralized Validation Logic
 * 
 * Provides validation functions for data integrity using Zod schemas.
 * Combines runtime validation with business logic validation.
 */

import { Account, Category, Budget, Transaction } from '../types';
import {
  AccountCreateSchema,
  CategoryCreateSchema,
  TransactionCreateSchema,
  BudgetCreateSchema,
} from '../schemas';
import { z } from 'zod';

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  errors?: Record<string, string>;
}

export class ValidationService {
  /**
   * Valida una cuenta usando Zod schema + business rules
   */
  static validateAccount(
    account: Omit<Account, 'id'>,
    existingAccounts: Account[] = []
  ): ValidationResult {
    // Schema validation first
    try {
      AccountCreateSchema.parse(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          error: error.errors[0].message,
          errors: error.errors.reduce((acc, err) => ({
            ...acc,
            [err.path.join('.')]: err.message,
          }), {}),
        };
      }
      return { valid: false, error: 'Error de validación desconocido' };
    }

    // Business logic validation
    const duplicate = existingAccounts.find(
      a => a.name.toLowerCase() === account.name.trim().toLowerCase()
    );
    if (duplicate) {
      return {
        valid: false,
        error: 'Ya existe una cuenta con ese nombre'
      };
    }

    return { valid: true };
  }

  /**
   * Valida una categoría usando Zod schema + business rules
   */
  static validateCategory(
    category: Omit<Category, 'id'>,
    existingCategories: Category[] = []
  ): ValidationResult {
    // Schema validation first
    try {
      CategoryCreateSchema.parse(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          error: error.errors[0].message,
          errors: error.errors.reduce((acc, err) => ({
            ...acc,
            [err.path.join('.')]: err.message,
          }), {}),
        };
      }
      return { valid: false, error: 'Error de validación desconocido' };
    }

    // Business logic validation
    const duplicate = existingCategories.find(
      c => c.type === category.type && 
           c.name.toLowerCase() === category.name.trim().toLowerCase()
    );
    if (duplicate) {
      return {
        valid: false,
        error: 'Ya existe una categoría con ese nombre'
      };
    }

    return { valid: true };
  }

  /**
   * Valida una transacción usando Zod schema
   */
  static validateTransaction(
    transaction: Omit<Transaction, 'id'>
  ): ValidationResult {
    try {
      TransactionCreateSchema.parse(transaction);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          error: error.errors[0].message,
          errors: error.errors.reduce((acc, err) => ({
            ...acc,
            [err.path.join('.')]: err.message,
          }), {}),
        };
      }
      return { valid: false, error: 'Error de validación desconocido' };
    }
  }

  /**
   * Valida un presupuesto usando Zod schema
   */
  static validateBudget(
    budget: Omit<Budget, 'id'>
  ): ValidationResult {
    try {
      BudgetCreateSchema.parse(budget);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          error: error.errors[0].message,
          errors: error.errors.reduce((acc, err) => ({
            ...acc,
            [err.path.join('.')]: err.message,
          }), {}),
        };
      }
      return { valid: false, error: 'Error de validación desconocido' };
    }
  }

  /**
   * Valida si una cuenta puede ser eliminada
   */
  static canDeleteAccount(
    accountId: string,
    transactions: Transaction[]
  ): { canDelete: boolean; reason?: string } {
    const hasTransactions = transactions.some(
      t => t.account === accountId || t.toAccount === accountId
    );

    if (hasTransactions) {
      return {
        canDelete: false,
        reason: 'No se puede eliminar una cuenta con transacciones asociadas'
      };
    }

    return { canDelete: true };
  }

  /**
   * Valida si una categoría puede ser eliminada
   */
  static canDeleteCategory(
    categoryId: string,
    transactions: Transaction[]
  ): { canDelete: boolean; reason?: string } {
    const hasTransactions = transactions.some(
      t => t.category === categoryId
    );

    if (hasTransactions) {
      return {
        canDelete: false,
        reason: 'No se puede eliminar una categoría con transacciones asociadas'
      };
    }

    return { canDelete: true };
  }

  /**
   * Valida un color hexadecimal
   */
  static isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  /**
   * Valida un email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida una fecha
   */
  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Valida que una fecha no sea futura
   */
  static isNotFutureDate(dateString: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    return date <= now;
  }

  /**
   * Valida un monto (debe ser positivo y un número válido)
   */
  static isValidAmount(amount: number): { valid: boolean; error?: string } {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return {
        valid: false,
        error: 'El monto debe ser un número válido'
      };
    }

    if (amount <= 0) {
      return {
        valid: false,
        error: 'El monto debe ser mayor a 0'
      };
    }

    if (amount > 999999999999) {
      return {
        valid: false,
        error: 'El monto es demasiado grande'
      };
    }

    return { valid: true };
  }

  /**
   * Sanitiza un string (elimina espacios extra, etc)
   */
  static sanitizeString(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  }

  /**
   * Valida un PIN de 4 dígitos
   */
  static isValidPin(pin: string): boolean {
    return /^\d{4}$/.test(pin);
  }

  /**
   * Valida que un porcentaje esté entre 0 y 100
   */
  static isValidPercentage(value: number): boolean {
    return value >= 0 && value <= 100;
  }
}