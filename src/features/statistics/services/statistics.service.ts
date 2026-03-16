/**
 * StatisticsService - Business Logic for Statistics
 * 
 * Handles all statistics calculations, aggregations, and data analysis
 */

import type { CategoryStatData, MonthlyTrendData, PeriodSummary, CategoryComparison } from '../types';
import { parseLocalDate } from '../../../utils/dateUtils'; // ✅ Import parseLocalDate

// Simplified types to avoid circular deps
interface Transaction {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category?: string;
  date: string;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  emoji?: string;
}

export class StatisticsService {
  /**
   * Filter transactions by month and year
   */
  static filterByMonth(
    transactions: Transaction[],
    month: number,
    year: number,
    excludeTransfers = true
  ): Transaction[] {
    return transactions.filter(t => {
      const date = parseLocalDate(t.date); // ✅ FIX: Use parseLocalDate instead of new Date
      const matchesMonth = date.getMonth() === month && date.getFullYear() === year;
      const matchesType = excludeTransfers ? t.type !== 'transfer' : true;
      return matchesMonth && matchesType;
    });
  }

  /**
   * Calculate category statistics for a period
   */
  static calculateCategoryStats(
    transactions: Transaction[],
    categories: Category[],
    viewType: 'income' | 'expense'
  ): CategoryStatData[] {
    // Group by category
    const categoryTotals: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    transactions
      .filter(t => t.type === viewType)
      .forEach(t => {
        const categoryId = t.category || 'unknown';
        categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + t.amount;
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      });

    const totalAmount = Object.values(categoryTotals).reduce((sum, amt) => sum + amt, 0);
    if (totalAmount === 0) return [];

    // Convert to array and sort
    return Object.entries(categoryTotals)
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          id: categoryId,
          name: category?.name || 'Sin categoría',
          amount,
          percentage: (amount / totalAmount) * 100,
          color: category?.color || '#6b7280',
          emoji: category?.emoji,
          count: categoryCounts[categoryId] || 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Calculate monthly trend data for the last N months
   */
  static calculateMonthlyTrend(
    transactions: Transaction[],
    monthsCount = 6
  ): MonthlyTrendData[] {
    const now = new Date();
    const data: MonthlyTrendData[] = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthTransactions = this.filterByMonth(transactions, month, year);

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        month: date.toLocaleDateString('es-ES', { month: 'long' }),
        monthShort: date.toLocaleDateString('es-ES', { month: 'short' }),
        income,
        expense,
        net: income - expense,
      });
    }

    return data;
  }

  /**
   * Calculate period summary statistics
   */
  static calculatePeriodSummary(
    transactions: Transaction[],
    month: number,
    year: number
  ): PeriodSummary {
    const monthTransactions = this.filterByMonth(transactions, month, year, false);

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;
    const transactionCount = monthTransactions.length;
    const averageTransaction = transactionCount > 0 
      ? (totalIncome + totalExpense) / transactionCount 
      : 0;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      transactionCount,
      averageTransaction,
    };
  }

  /**
   * Compare current month with previous month by category
   */
  static compareCategoryMonths(
    transactions: Transaction[],
    categories: Category[],
    currentMonth: number,
    currentYear: number,
    viewType: 'income' | 'expense'
  ): CategoryComparison[] {
    // Calculate previous month
    const prevDate = new Date(currentYear, currentMonth - 1);
    const prevMonth = prevDate.getMonth();
    const prevYear = prevDate.getFullYear();

    // Get stats for both months
    const currentStats = this.calculateCategoryStats(
      this.filterByMonth(transactions, currentMonth, currentYear),
      categories,
      viewType
    );

    const prevStats = this.calculateCategoryStats(
      this.filterByMonth(transactions, prevMonth, prevYear),
      categories,
      viewType
    );

    // Create comparison map
    const prevMap = new Map(prevStats.map(s => [s.id, s.amount]));

    return currentStats.map(current => {
      const previous = prevMap.get(current.id) || 0;
      const change = current.amount - previous;
      const changePercentage = previous > 0 ? (change / previous) * 100 : 100;

      return {
        categoryId: current.id,
        categoryName: current.name,
        currentMonth: current.amount,
        previousMonth: previous,
        change,
        changePercentage,
      };
    });
  }

  /**
   * Calculate top categories by spending
   */
  static getTopCategories(
    categoryStats: CategoryStatData[],
    limit = 5
  ): CategoryStatData[] {
    return categoryStats.slice(0, limit);
  }

  /**
   * Calculate budget vs actual for categories
   */
  static calculateBudgetVsActual(
    transactions: Transaction[],
    categories: Category[],
    budgets: any[],
    month: number,
    year: number
  ): any[] {
    const monthTransactions = this.filterByMonth(transactions, month, year);
    const categoryStats = this.calculateCategoryStats(monthTransactions, categories, 'expense');

    return budgets.map(budget => {
      const stats = categoryStats.find(s => s.id === budget.categoryId);
      const actual = stats?.amount || 0;
      const budgeted = budget.amount;
      const remaining = budgeted - actual;
      const percentage = budgeted > 0 ? (actual / budgeted) * 100 : 0;

      let status: 'under' | 'near' | 'over';
      if (percentage >= 100) status = 'over';
      else if (percentage >= 80) status = 'near';
      else status = 'under';

      const category = categories.find(c => c.id === budget.categoryId);

      return {
        categoryId: budget.categoryId,
        categoryName: category?.name || 'Unknown',
        budgeted,
        actual,
        remaining,
        percentage,
        status,
      };
    });
  }

  /**
   * Get spending by day of week
   */
  static getSpendingByDayOfWeek(transactions: Transaction[]): any[] {
    const dayTotals: Record<number, { amount: number; count: number }> = {};

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const date = parseLocalDate(t.date); // ✅ FIX: Use parseLocalDate instead of new Date
        const day = date.getDay();
        
        if (!dayTotals[day]) {
          dayTotals[day] = { amount: 0, count: 0 };
        }
        
        dayTotals[day].amount += t.amount;
        dayTotals[day].count += 1;
      });

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return dayNames.map((name, index) => ({
      dayOfWeek: name,
      amount: dayTotals[index]?.amount || 0,
      count: dayTotals[index]?.count || 0,
    }));
  }

  /**
   * Calculate average daily spending
   */
  static calculateAverageDailySpending(
    transactions: Transaction[],
    month: number,
    year: number
  ): number {
    const monthTransactions = this.filterByMonth(transactions, month, year);
    const totalExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return totalExpense / daysInMonth;
  }

  /**
   * Get largest transactions
   */
  static getLargestTransactions(
    transactions: Transaction[],
    limit = 5
  ): Transaction[] {
    return [...transactions]
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  }

  /**
   * Calculate category diversity (number of categories used)
   */
  static calculateCategoryDiversity(transactions: Transaction[]): number {
    const uniqueCategories = new Set(
      transactions
        .filter(t => t.category)
        .map(t => t.category!)
    );
    return uniqueCategories.size;
  }

  /**
   * Get month over month growth percentage
   */
  static getMonthOverMonthGrowth(
    transactions: Transaction[],
    month: number,
    year: number,
    type: 'income' | 'expense'
  ): number {
    const current = this.filterByMonth(transactions, month, year)
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);

    const prevDate = new Date(year, month - 1);
    const previous = this.filterByMonth(transactions, prevDate.getMonth(), prevDate.getFullYear())
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);

    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }
}