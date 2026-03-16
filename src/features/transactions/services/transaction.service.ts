/**
 * TransactionService - Business Logic for Transactions
 * 
 * Handles all transaction-related calculations and operations
 * including account balance updates.
 */

import type { Transaction, TransactionType } from '../types';

// Simplified Account type to avoid circular deps
interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
}

export class TransactionService {
  /**
   * Genera un ID único para una transacción (UUID v4)
   */
  static generateTransactionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Calcula los cambios de balance que una transacción produce en las cuentas
   * 
   * @param transaction - La transacción a aplicar
   * @returns Map con accountId -> cambio de balance
   */
  static calculateBalanceChanges(transaction: Transaction): Map<string, number> {
    const changes = new Map<string, number>();

    if (transaction.type === 'transfer') {
      // Transferencia: resta de cuenta origen, suma a cuenta destino
      changes.set(transaction.account, -transaction.amount);
      if (transaction.toAccount) {
        changes.set(transaction.toAccount, transaction.amount);
      }
    } else {
      // Ingreso o gasto: afecta solo una cuenta
      const change = transaction.type === 'income' 
        ? transaction.amount 
        : -transaction.amount;
      changes.set(transaction.account, change);
    }

    return changes;
  }

  /**
   * Aplica cambios de balance a un array de cuentas
   */
  static applyBalanceChanges(
    accounts: Account[],
    changes: Map<string, number>
  ): Account[] {
    return accounts.map(account => {
      const change = changes.get(account.id);
      if (change !== undefined && change !== 0) {
        return { 
          ...account, 
          balance: account.balance + change 
        };
      }
      return account;
    });
  }

  /**
   * Calcula los cambios inversos de una transacción (para revertirla)
   */
  static calculateReverseBalanceChanges(transaction: Transaction): Map<string, number> {
    const changes = this.calculateBalanceChanges(transaction);
    const reversedChanges = new Map<string, number>();
    
    changes.forEach((value, key) => {
      reversedChanges.set(key, -value);
    });
    
    return reversedChanges;
  }

  /**
   * Revierte los efectos de una transacción en las cuentas
   */
  static revertTransaction(
    transaction: Transaction,
    accounts: Account[]
  ): Account[] {
    const reverseChanges = this.calculateReverseBalanceChanges(transaction);
    return this.applyBalanceChanges(accounts, reverseChanges);
  }

  /**
   * Aplica una nueva transacción y revierte una antigua en un solo paso
   */
  static replaceTransaction(
    oldTransaction: Transaction,
    newTransaction: Transaction,
    accounts: Account[]
  ): Account[] {
    const accountsAfterRevert = this.revertTransaction(oldTransaction, accounts);
    const newChanges = this.calculateBalanceChanges(newTransaction);
    return this.applyBalanceChanges(accountsAfterRevert, newChanges);
  }

  /**
   * Valida que una transacción sea válida
   */
  static validateTransaction(
    transaction: Omit<Transaction, 'id'>,
    accounts: Account[]
  ): { valid: boolean; error?: string } {
    if (transaction.amount <= 0) {
      return { valid: false, error: 'El monto debe ser mayor a 0' };
    }

    const sourceAccount = accounts.find(a => a.id === transaction.account);
    if (!sourceAccount) {
      return { valid: false, error: 'Cuenta de origen no encontrada' };
    }

    if (transaction.type === 'transfer') {
      if (!transaction.toAccount) {
        return { valid: false, error: 'Debe seleccionar una cuenta destino para la transferencia' };
      }

      if (transaction.account === transaction.toAccount) {
        return { valid: false, error: 'Las cuentas de origen y destino deben ser diferentes' };
      }

      const destinationAccount = accounts.find(a => a.id === transaction.toAccount);
      if (!destinationAccount) {
        return { valid: false, error: 'Cuenta destino no encontrada' };
      }
    }

    if (transaction.type === 'expense' || transaction.type === 'transfer') {
      if (sourceAccount.balance < transaction.amount) {
        return { 
          valid: false, 
          error: `Fondos insuficientes en ${sourceAccount.name}. Saldo disponible: $${sourceAccount.balance.toLocaleString()}` 
        };
      }
    }

    if (transaction.type !== 'transfer' && !transaction.category) {
      return { valid: false, error: 'Debe seleccionar una categoría' };
    }

    return { valid: true };
  }

  /**
   * Filtra transacciones por tipo
   */
  static filterByType(
    transactions: Transaction[],
    type: 'income' | 'expense' | 'transfer' | 'all'
  ): Transaction[] {
    if (type === 'all') return transactions;
    return transactions.filter(t => t.type === type);
  }

  /**
   * Filtra transacciones por mes y año
   */
  static filterByMonth(
    transactions: Transaction[],
    month: number,
    year: number
  ): Transaction[] {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  }

  /**
   * Filtra transacciones por búsqueda de texto
   */
  static filterBySearch(
    transactions: Transaction[],
    query: string,
    categories: any[]
  ): Transaction[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return transactions;

    return transactions.filter(transaction => {
      // Search in note
      if (transaction.note?.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in category name
      if (transaction.category) {
        const category = categories.find(c => c.id === transaction.category);
        if (category?.name.toLowerCase().includes(lowerQuery)) {
          return true;
        }
      }

      // Search in amount
      if (transaction.amount.toString().includes(lowerQuery)) {
        return true;
      }

      return false;
    });
  }

  /**
   * Calcula el total de ingresos
   */
  static calculateTotalIncome(transactions: Transaction[]): number {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Calcula el total de gastos
   */
  static calculateTotalExpenses(transactions: Transaction[]): number {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Calcula el balance neto (ingresos - gastos)
   */
  static calculateNetBalance(transactions: Transaction[]): number {
    return this.calculateTotalIncome(transactions) - this.calculateTotalExpenses(transactions);
  }

  /**
   * Agrupa transacciones por fecha
   */
  static groupByDate(transactions: Transaction[]): Map<string, Transaction[]> {
    const grouped = new Map<string, Transaction[]>();
    
    transactions.forEach(transaction => {
      const existing = grouped.get(transaction.date) || [];
      grouped.set(transaction.date, [...existing, transaction]);
    });
    
    return grouped;
  }

  /**
   * Ordena transacciones por fecha (más recientes primero)
   */
  static sortByDate(transactions: Transaction[], ascending = false): Transaction[] {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  /**
   * Obtiene transacciones de hoy
   */
  static getTodayTransactions(transactions: Transaction[]): Transaction[] {
    const today = new Date().toISOString().split('T')[0];
    return transactions.filter(t => t.date === today);
  }

  /**
   * Obtiene transacciones de esta semana
   */
  static getThisWeekTransactions(transactions: Transaction[]): Transaction[] {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= weekAgo && date <= now;
    });
  }

  /**
   * Obtiene transacciones de este mes
   */
  static getThisMonthTransactions(transactions: Transaction[]): Transaction[] {
    const now = new Date();
    return this.filterByMonth(transactions, now.getMonth(), now.getFullYear());
  }

  /**
   * Cuenta transacciones por tipo
   */
  static countByType(transactions: Transaction[]): {
    all: number;
    income: number;
    expense: number;
    transfer: number;
  } {
    return {
      all: transactions.length,
      income: transactions.filter(t => t.type === 'income').length,
      expense: transactions.filter(t => t.type === 'expense').length,
      transfer: transactions.filter(t => t.type === 'transfer').length,
    };
  }

  /**
   * Formatea una fecha para display
   */
  static formatDateDisplay(dateString: string, locale = 'es-ES'): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) {
      return 'Hoy';
    } else if (dateStr === yesterdayStr) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString(locale, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }
}
