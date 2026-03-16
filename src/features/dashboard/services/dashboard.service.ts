/**
 * DashboardService - Business Logic for Dashboard
 * 
 * Handles dashboard-specific calculations and data aggregation
 */

import type { DashboardStats, MonthSummary } from '../types';
import { parseLocalDate, getColombiaTime } from '../../../utils/dateUtils'; // ✅ Import date utils

// Simplified types to avoid circular deps
interface Transaction {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  date: string;
}

interface Account {
  id: string;
  balance: number;
}

interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
  month?: number | null;        // ✨ NEW: 0-11 for monthly budgets
  year?: number | null;         // ✨ NEW: 2024, 2025, etc.
  alertThreshold?: number;
}

export class DashboardService {
  /**
   * Calculate total balance across all accounts
   */
  static calculateTotalBalance(accounts: Account[]): number {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  }

  /**
   * Calculate monthly income for a specific month
   */
  static calculateMonthlyIncome(
    transactions: Transaction[],
    month: number,
    year: number
  ): number {
    return transactions
      .filter(t => {
        const date = parseLocalDate(t.date);
        return (
          t.type === 'income' &&
          date.getMonth() === month &&
          date.getFullYear() === year
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Calculate monthly expenses for a specific month
   */
  static calculateMonthlyExpenses(
    transactions: Transaction[],
    month: number,
    year: number
  ): number {
    return transactions
      .filter(t => {
        const date = parseLocalDate(t.date);
        return (
          t.type === 'expense' &&
          date.getMonth() === month &&
          date.getFullYear() === year
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Calculate net balance for a month (income - expenses)
   */
  static calculateNetBalance(income: number, expenses: number): number {
    return income - expenses;
  }

  /**
   * Calculate savings rate as percentage
   */
  static calculateSavingsRate(income: number, expenses: number): number {
    if (income === 0) return 0;
    return ((income - expenses) / income) * 100;
  }

  /**
   * Calculate complete dashboard statistics
   */
  static calculateDashboardStats(
    transactions: Transaction[],
    accounts: Account[],
    month?: number,
    year?: number
  ): DashboardStats {
    const colombiaTime = getColombiaTime(); // ✅ FIX: Use Colombia time for defaults
    const currentMonth = month ?? colombiaTime.getMonth();
    const currentYear = year ?? colombiaTime.getFullYear();

    const totalBalance = this.calculateTotalBalance(accounts);
    const monthlyIncome = this.calculateMonthlyIncome(transactions, currentMonth, currentYear);
    const monthlyExpenses = this.calculateMonthlyExpenses(transactions, currentMonth, currentYear);
    const netBalance = this.calculateNetBalance(monthlyIncome, monthlyExpenses);
    const savingsRate = this.calculateSavingsRate(monthlyIncome, monthlyExpenses);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      netBalance,
      savingsRate,
    };
  }

  /**
   * Get month summary
   */
  static getMonthSummary(
    transactions: Transaction[],
    month: number,
    year: number
  ): MonthSummary {
    const monthTransactions = transactions.filter(t => {
      const date = parseLocalDate(t.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    const income = this.calculateMonthlyIncome(transactions, month, year);
    const expenses = this.calculateMonthlyExpenses(transactions, month, year);
    const netBalance = this.calculateNetBalance(income, expenses);

    return {
      month,
      year,
      income,
      expenses,
      netBalance,
      transactionCount: monthTransactions.length,
    };
  }

  /**
   * Get budget alerts for over-budget categories
   */
  static getBudgetAlerts(
    budgets: Budget[],
    transactions: Transaction[],
    categories: any[],
    month: number,
    year: number
  ): any[] {
    const alerts: any[] = [];

    budgets.forEach(budget => {
      // Calculate spent in this category for the month
      const spent = transactions
        .filter(t => {
          const date = parseLocalDate(t.date);
          return (
            t.type === 'expense' &&
            (t as any).category === budget.categoryId &&
            date.getMonth() === month &&
            date.getFullYear() === year
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / budget.amount) * 100;
      const threshold = budget.alertThreshold ?? 80;

      // Only add if it's at warning level or above
      if (percentage >= threshold) {
        const category = categories.find(c => c.id === budget.categoryId);
        const status = 
          percentage >= 100 ? 'exceeded' : 
          percentage >= threshold ? 'danger' : 
          'warning';

        alerts.push({
          budgetId: budget.id,
          categoryId: budget.categoryId,
          categoryName: category?.name || 'Unknown',
          budgetAmount: budget.amount,
          spent,
          percentage,
          status,
        });
      }
    });

    return alerts;
  }

  /**
   * Get recent transactions (limited count)
   */
  static getRecentTransactions(
    transactions: Transaction[],
    limit = 10
  ): Transaction[] {
    return [...transactions]
      .sort((a, b) => {
        const dateA = parseLocalDate(a.date).getTime();
        const dateB = parseLocalDate(b.date).getTime();
        return dateB - dateA; // Newest first
      })
      .slice(0, limit);
  }

  /**
   * Filter transactions by type
   */
  static filterTransactionsByType(
    transactions: Transaction[],
    type: 'all' | 'income' | 'expense' | 'transfer'
  ): Transaction[] {
    if (type === 'all') return transactions;
    return transactions.filter(t => t.type === type);
  }

  /**
   * Filter transactions by search query
   */
  static filterTransactionsBySearch(
    transactions: Transaction[],
    query: string,
    categories: any[]
  ): Transaction[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return transactions;

    return transactions.filter(transaction => {
      // Search in note
      if ((transaction as any).note?.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in category name
      if ((transaction as any).category) {
        const category = categories.find(c => c.id === (transaction as any).category);
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
   * Calculate account growth percentage
   */
  static calculateAccountGrowth(
    transactions: Transaction[],
    currentMonth: number,
    currentYear: number
  ): number {
    const thisMonthNet = this.calculateNetBalance(
      this.calculateMonthlyIncome(transactions, currentMonth, currentYear),
      this.calculateMonthlyExpenses(transactions, currentMonth, currentYear)
    );

    // Get previous month
    const prevDate = new Date(currentYear, currentMonth - 1);
    const prevMonth = prevDate.getMonth();
    const prevYear = prevDate.getFullYear();

    const prevMonthNet = this.calculateNetBalance(
      this.calculateMonthlyIncome(transactions, prevMonth, prevYear),
      this.calculateMonthlyExpenses(transactions, prevMonth, prevYear)
    );

    if (prevMonthNet === 0) return 0;
    return ((thisMonthNet - prevMonthNet) / Math.abs(prevMonthNet)) * 100;
  }
}