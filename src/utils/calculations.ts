/**
 * Financial Calculations Utilities
 * 
 * Centralized utilities for financial calculations used across the application.
 * This ensures consistency in how we calculate totals, percentages, and budgets.
 */

import { Transaction, Budget, Category } from '../types';
import { parseLocalDate } from './dateUtils';

/**
 * Calculate total income from transactions
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate total expenses from transactions
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate net balance (income - expenses)
 */
export function calculateBalance(transactions: Transaction[]): number {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  return income - expenses;
}

/**
 * Filter transactions by month and year
 */
export function filterTransactionsByMonth(
  transactions: Transaction[],
  month: number,
  year: number
): Transaction[] {
  return transactions.filter(transaction => {
    // Manejar tanto formato YYYY-MM-DD como ISO 8601
    const date = transaction.date.includes('T') 
      ? new Date(transaction.date) 
      : parseLocalDate(transaction.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
}

/**
 * Filter transactions by date range
 */
export function filterTransactionsByDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  return transactions.filter(transaction => {
    // Manejar tanto formato YYYY-MM-DD como ISO 8601
    const date = transaction.date.includes('T') 
      ? new Date(transaction.date) 
      : parseLocalDate(transaction.date);
    
    const isInRange = date >= startDate && date <= endDate;
    
    // Debug logging (disabled in browser)
    // if (process.env.NODE_ENV !== 'production') {
    //   console.log('Filter check:', {
    //     transaction: transaction.id,
    //     date: date.toISOString(),
    //     startDate: startDate.toISOString(),
    //     endDate: endDate.toISOString(),
    //     isInRange,
    //   });
    // }
    
    return isInRange;
  });
}

/**
 * Group transactions by category
 */
export function groupTransactionsByCategory(
  transactions: Transaction[]
): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();
  
  transactions.forEach(transaction => {
    if (!transaction.category) return;
    
    const existing = grouped.get(transaction.category) || [];
    grouped.set(transaction.category, [...existing, transaction]);
  });
  
  return grouped;
}

/**
 * Calculate category spending
 */
export function calculateCategorySpending(
  transactions: Transaction[],
  categoryId: string
): number {
  return transactions
    .filter(t => t.category === categoryId && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate budget usage percentage
 */
export function calculateBudgetUsage(
  spent: number,
  budgetAmount: number
): number {
  if (budgetAmount === 0) return 0;
  return Math.round((spent / budgetAmount) * 100);
}

/**
 * Check if budget is over threshold
 */
export function isBudgetOverThreshold(
  spent: number,
  budgetAmount: number,
  threshold: number = 80
): boolean {
  const usage = calculateBudgetUsage(spent, budgetAmount);
  return usage >= threshold;
}

/**
 * Get budget status
 */
export function getBudgetStatus(
  spent: number,
  budgetAmount: number,
  alertThreshold: number = 80
): 'safe' | 'warning' | 'danger' {
  const usage = calculateBudgetUsage(spent, budgetAmount);
  
  if (usage >= 100) return 'danger';
  if (usage >= alertThreshold) return 'warning';
  return 'safe';
}

/**
 * Calculate monthly average spending
 */
export function calculateMonthlyAverage(
  transactions: Transaction[],
  months: number = 6
): number {
  if (months === 0) return 0;
  
  const totalExpenses = calculateTotalExpenses(transactions);
  return totalExpenses / months;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Calculate total amount by type (income/expense)
 */
export function calculateTotalByType(
  transactions: Transaction[],
  type: 'income' | 'expense'
): number {
  return transactions
    .filter(t => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Get top spending categories
 */
export function getTopSpendingCategories(
  transactions: Transaction[],
  categories: Category[],
  limit: number = 5
): Array<{ categoryId: string; amount: number; name: string }> {
  const categorySpending = new Map<string, number>();
  
  // Calculate spending per category
  transactions
    .filter(t => t.type === 'expense' && t.category)
    .forEach(t => {
      const current = categorySpending.get(t.category!) || 0;
      categorySpending.set(t.category!, current + t.amount);
    });
  
  // Convert to array and sort
  const sorted = Array.from(categorySpending.entries())
    .map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        categoryId,
        amount,
        name: category?.name || 'Desconocido',
      };
    })
    .sort((a, b) => b.amount - a.amount);
  
  return sorted.slice(0, limit);
}

/**
 * Calculate savings rate (income - expenses) / income * 100
 */
export function calculateSavingsRate(transactions: Transaction[]): number {
  const income = calculateTotalIncome(transactions);
  if (income === 0) return 0;
  
  const expenses = calculateTotalExpenses(transactions);
  const savings = income - expenses;
  
  return Math.round((savings / income) * 100);
}