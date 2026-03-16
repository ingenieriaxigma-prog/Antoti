/**
 * AccountService - Business Logic for Accounts
 * 
 * Handles account-related calculations and operations.
 */

import type { Account } from '../types';

export class AccountService {
  /**
   * Genera un ID único para una cuenta (UUID v4)
   */
  static generateAccountId(): string {
    return crypto.randomUUID();
  }

  /**
   * Calcula el balance total de todas las cuentas
   */
  static calculateTotalBalance(accounts: Account[]): number {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  }

  /**
   * Calcula el balance total por tipo de cuenta
   */
  static calculateBalanceByType(
    accounts: Account[],
    type: Account['type']
  ): number {
    return accounts
      .filter(account => account.type === type)
      .reduce((sum, account) => sum + account.balance, 0);
  }

  /**
   * Agrupa cuentas por tipo
   */
  static groupByType(accounts: Account[]): Record<Account['type'], Account[]> {
    return {
      cash: accounts.filter(a => a.type === 'cash'),
      bank: accounts.filter(a => a.type === 'bank'),
      card: accounts.filter(a => a.type === 'card'),
      digital: accounts.filter(a => a.type === 'digital'),
    };
  }

  /**
   * Encuentra la cuenta con mayor balance
   */
  static findAccountWithHighestBalance(accounts: Account[]): Account | null {
    if (accounts.length === 0) return null;
    return accounts.reduce((max, account) => 
      account.balance > max.balance ? account : max
    );
  }

  /**
   * Encuentra la cuenta con menor balance
   */
  static findAccountWithLowestBalance(accounts: Account[]): Account | null {
    if (accounts.length === 0) return null;
    return accounts.reduce((min, account) => 
      account.balance < min.balance ? account : min
    );
  }

  /**
   * Obtiene cuentas con balance positivo
   */
  static getAccountsWithPositiveBalance(accounts: Account[]): Account[] {
    return accounts.filter(account => account.balance > 0);
  }

  /**
   * Obtiene cuentas con balance negativo (deudas)
   */
  static getAccountsWithNegativeBalance(accounts: Account[]): Account[] {
    return accounts.filter(account => account.balance < 0);
  }

  /**
   * Calcula el balance total de deudas
   */
  static calculateTotalDebt(accounts: Account[]): number {
    return Math.abs(
      accounts
        .filter(a => a.balance < 0)
        .reduce((sum, a) => sum + a.balance, 0)
    );
  }

  /**
   * Calcula el balance total de activos (cuentas con saldo positivo)
   */
  static calculateTotalAssets(accounts: Account[]): number {
    return accounts
      .filter(a => a.balance > 0)
      .reduce((sum, a) => sum + a.balance, 0);
  }

  /**
   * Calcula el patrimonio neto (activos - deudas)
   */
  static calculateNetWorth(accounts: Account[]): number {
    return this.calculateTotalBalance(accounts);
  }

  /**
   * Obtiene el nombre de cuenta por ID
   */
  static getAccountName(accountId: string, accounts: Account[]): string {
    return accounts.find(a => a.id === accountId)?.name || 'Cuenta eliminada';
  }

  /**
   * Obtiene una cuenta por ID
   */
  static getAccountById(accountId: string, accounts: Account[]): Account | undefined {
    return accounts.find(a => a.id === accountId);
  }

  /**
   * Verifica si una cuenta tiene suficiente saldo
   */
  static hasSufficientBalance(
    accountId: string,
    amount: number,
    accounts: Account[]
  ): boolean {
    const account = this.getAccountById(accountId, accounts);
    if (!account) return false;
    return account.balance >= amount;
  }

  /**
   * Ordena cuentas por balance (mayor a menor)
   */
  static sortByBalance(accounts: Account[], ascending = false): Account[] {
    const sorted = [...accounts].sort((a, b) => b.balance - a.balance);
    return ascending ? sorted.reverse() : sorted;
  }

  /**
   * Ordena cuentas por nombre alfabéticamente
   */
  static sortByName(accounts: Account[], ascending = true): Account[] {
    const sorted = [...accounts].sort((a, b) => 
      a.name.localeCompare(b.name, 'es')
    );
    return ascending ? sorted : sorted.reverse();
  }

  /**
   * Obtiene el icono del tipo de cuenta
   */
  static getTypeIcon(type: Account['type']): string {
    const icons = {
      cash: 'wallet',
      bank: 'building-2',
      card: 'credit-card',
      digital: 'smartphone',
    };
    return icons[type];
  }

  /**
   * Obtiene el label del tipo de cuenta
   */
  static getTypeLabel(type: Account['type']): string {
    const labels = {
      cash: 'Efectivo',
      bank: 'Banco',
      card: 'Tarjeta',
      digital: 'Digital',
    };
    return labels[type];
  }

  /**
   * Calcula el porcentaje que representa una cuenta del total
   */
  static calculatePercentageOfTotal(
    accountBalance: number,
    totalBalance: number
  ): number {
    if (totalBalance === 0) return 0;
    return (accountBalance / totalBalance) * 100;
  }

  /**
   * Filtra cuentas por búsqueda de texto
   */
  static searchAccounts(accounts: Account[], query: string): Account[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return accounts;

    return accounts.filter(account =>
      account.name.toLowerCase().includes(lowerQuery) ||
      this.getTypeLabel(account.type).toLowerCase().includes(lowerQuery)
    );
  }
}
