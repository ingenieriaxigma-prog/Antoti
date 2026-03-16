/**
 * BudgetService - Business Logic for Budgets
 * 
 * Handles budget calculations and monitoring.
 */

import type { Budget, BudgetStatus } from '../types';

// Transaction type (simplified to avoid circular deps)
interface Transaction {
  type: 'income' | 'expense' | 'transfer';
  category: string;
  amount: number;
  date: string;
}

export class BudgetService {
  /**
   * Verifica si una fecha está dentro de un período (mes/año)
   */
  static isInPeriod(
    dateString: string,
    period: { month: number; year: number }
  ): boolean {
    const date = new Date(dateString);
    return date.getMonth() === period.month && date.getFullYear() === period.year;
  }

  /**
   * Calcula el gasto total en una categoría para un período específico
   * 
   * @param categoryId - ID de la categoría
   * @param transactions - Todas las transacciones
   * @param month - Mes (0-11)
   * @param year - Año
   * @returns Total gastado en la categoría
   */
  static calculateCategoryExpense(
    categoryId: string,
    transactions: Transaction[],
    month: number,
    year: number
  ): number {
    return transactions
      .filter(t => 
        t.type === 'expense' &&
        t.category === categoryId &&
        this.isInPeriod(t.date, { month, year })
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Calcula el porcentaje usado de un presupuesto
   * 
   * @param budget - Presupuesto a evaluar
   * @param spent - Cantidad gastada
   * @returns Porcentaje usado (0-100+)
   */
  static calculateUsagePercentage(budget: Budget, spent: number): number {
    if (budget.amount === 0) return 0;
    return (spent / budget.amount) * 100;
  }

  /**
   * Verifica si un presupuesto debe mostrar alerta
   * 
   * @param budget - Presupuesto a evaluar
   * @param spent - Cantidad gastada
   * @returns true si se debe mostrar alerta
   */
  static shouldShowAlert(budget: Budget, spent: number): boolean {
    const percentage = this.calculateUsagePercentage(budget, spent);
    const threshold = budget.alertThreshold ?? 80; // Default to 80 if undefined
    return percentage >= threshold;
  }

  /**
   * Determina el estado de un presupuesto
   * 
   * @param budget - Presupuesto
   * @param spent - Cantidad gastada
   * @returns Estado: 'safe' | 'warning' | 'danger' | 'exceeded'
   */
  static getBudgetStatus(
    budget: Budget,
    spent: number
  ): BudgetStatus {
    const percentage = this.calculateUsagePercentage(budget, spent);
    const threshold = budget.alertThreshold ?? 80; // Default to 80 if undefined

    if (percentage >= 100) return 'exceeded';
    if (percentage >= threshold) return 'danger';
    if (percentage >= threshold - 20) return 'warning';
    return 'safe';
  }

  /**
   * Calcula cuánto queda disponible en un presupuesto
   * 
   * @param budget - Presupuesto
   * @param spent - Cantidad gastada
   * @returns Cantidad disponible (puede ser negativa si excedió)
   */
  static calculateRemaining(budget: Budget, spent: number): number {
    return budget.amount - spent;
  }

  /**
   * Calcula el promedio diario de gasto en una categoría
   * 
   * @param categoryId - ID de la categoría
   * @param transactions - Transacciones del mes
   * @param daysInMonth - Días del mes
   * @returns Promedio diario
   */
  static calculateDailyAverage(
    categoryId: string,
    transactions: Transaction[],
    daysInMonth: number
  ): number {
    const total = transactions
      .filter(t => t.type === 'expense' && t.category === categoryId)
      .reduce((sum, t) => sum + t.amount, 0);

    return total / daysInMonth;
  }

  /**
   * Proyecta el gasto al final del mes basado en el ritmo actual
   * 
   * @param spent - Gastado hasta ahora
   * @param currentDay - Día actual del mes (1-31)
   * @param daysInMonth - Total de días del mes
   * @returns Proyección de gasto al final del mes
   */
  static projectEndOfMonthSpending(
    spent: number,
    currentDay: number,
    daysInMonth: number
  ): number {
    if (currentDay === 0) return 0;
    const dailyRate = spent / currentDay;
    return dailyRate * daysInMonth;
  }

  /**
   * Valida que un presupuesto sea válido
   * 
   * @param budget - Presupuesto a validar
   * @returns Resultado de validación
   */
  static validateBudget(
    budget: Omit<Budget, 'id'>
  ): { valid: boolean; error?: string } {
    if (budget.amount <= 0) {
      return {
        valid: false,
        error: 'El monto del presupuesto debe ser mayor a 0'
      };
    }

    // alertThreshold is optional, but if provided must be valid
    if (budget.alertThreshold !== undefined && (budget.alertThreshold < 0 || budget.alertThreshold > 100)) {
      return {
        valid: false,
        error: 'El umbral de alerta debe estar entre 0 y 100'
      };
    }

    if (!budget.categoryId) {
      return {
        valid: false,
        error: 'Debe seleccionar una categoría'
      };
    }

    return { valid: true };
  }

  /**
   * Obtiene el color del estado del presupuesto
   * 
   * @param status - Estado del presupuesto
   * @returns Color hex
   */
  static getStatusColor(status: BudgetStatus): string {
    const colors = {
      safe: '#10b981',     // green
      warning: '#f59e0b',  // orange
      danger: '#ef4444',   // red
      exceeded: '#dc2626', // dark red
    };
    return colors[status];
  }

  /**
   * Calcula cuántos días quedan en el mes
   */
  static getDaysRemainingInMonth(): number {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.getDate() - now.getDate();
  }

  /**
   * Calcula el presupuesto sugerido diario
   * 
   * @param budget - Presupuesto total
   * @param spent - Gastado hasta ahora
   * @returns Presupuesto diario sugerido para el resto del mes
   */
  static calculateDailyBudgetSuggestion(budget: Budget, spent: number): number {
    const remaining = this.calculateRemaining(budget, spent);
    const daysLeft = this.getDaysRemainingInMonth();
    
    if (daysLeft === 0) return 0;
    return Math.max(0, remaining / daysLeft);
  }

  /**
   * Generate a unique ID for a budget
   */
  static generateBudgetId(): string {
    return crypto.randomUUID();
  }

  /**
   * Check if a budget exists for a category
   * @deprecated Use getBudgetForMonth instead for month-specific budgets
   */
  static hasBudgetForCategory(categoryId: string, budgets: Budget[]): boolean {
    return budgets.some(b => b.categoryId === categoryId);
  }

  /**
   * Get budget for a specific category
   * @deprecated Use getBudgetForMonth instead for month-specific budgets
   */
  static getBudgetForCategory(categoryId: string, budgets: Budget[]): Budget | undefined {
    return budgets.find(b => b.categoryId === categoryId);
  }

  /**
   * ✨ NEW: Get budget for a specific category and month with fallback logic
   * 
   * Fallback priority:
   * 1. Specific month+year budget (e.g., November 2025)
   * 2. Specific month for all years (e.g., November of any year)
   * 3. Year-wide budget (month=null, specific year, e.g., all months of 2025)
   * 4. Template budget (month=null, year=null, universal)
   * 
   * @param categoryId - ID of the category
   * @param month - Month (0-11)
   * @param year - Year (e.g., 2024)
   * @param budgets - Array of all budgets
   * @param period - 'monthly' or 'yearly' (default: 'monthly')
   * @returns Budget object or undefined
   */
  static getBudgetForMonth(
    categoryId: string,
    month: number,
    year: number,
    budgets: Budget[],
    period: 'monthly' | 'yearly' = 'monthly'
  ): Budget | undefined {
    // Filter budgets for this category and period
    const categoryBudgets = budgets.filter(
      b => b.categoryId === categoryId && b.period === period
    );

    if (categoryBudgets.length === 0) return undefined;

    // 1️⃣ Priority 1: Specific month+year budget (e.g., November 2025)
    const specificBudget = categoryBudgets.find(
      b => b.month === month && b.year === year
    );
    if (specificBudget) {
      console.log(`[BudgetService] Found specific budget for ${categoryId} in ${month}/${year}`);
      return specificBudget;
    }

    // 2️⃣ Priority 2: Specific month for all years (e.g., November of any year)
    const monthlyBudget = categoryBudgets.find(
      b => b.month === month && (b.year === null || b.year === undefined)
    );
    if (monthlyBudget) {
      console.log(`[BudgetService] Found monthly budget for ${categoryId} in month ${month} (all years)`);
      return monthlyBudget;
    }

    // 3️⃣ Priority 3: Year-wide budget (month=null, specific year, e.g., all months of 2025)
    const yearBudget = categoryBudgets.find(
      b => (b.month === null || b.month === undefined) && b.year === year
    );
    if (yearBudget) {
      console.log(`[BudgetService] Found year-wide budget for ${categoryId} in ${year}`);
      return yearBudget;
    }

    // 4️⃣ Priority 4: Template budget (month=null, year=null, universal)
    const templateBudget = categoryBudgets.find(
      b => (b.month === null || b.month === undefined) && (b.year === null || b.year === undefined)
    );
    if (templateBudget) {
      console.log(`[BudgetService] Found template budget for ${categoryId}`);
      return templateBudget;
    }

    return undefined;
  }

  /**
   * ✨ NEW: Check if a budget exists for a specific month
   */
  static hasBudgetForMonth(
    categoryId: string,
    month: number,
    year: number,
    budgets: Budget[],
    period: 'monthly' | 'yearly' = 'monthly'
  ): boolean {
    return this.getBudgetForMonth(categoryId, month, year, budgets, period) !== undefined;
  }

  /**
   * Calculate total budget across all categories (for a specific month)
   * ✨ UPDATED: Now considers month/year
   */
  static calculateTotalBudget(
    budgets: Budget[],
    month: number,
    year: number
  ): number {
    // Get unique categories
    const uniqueCategories = [...new Set(budgets.map(b => b.categoryId))];
    
    // For each category, get the applicable budget for this month
    return uniqueCategories.reduce((sum, categoryId) => {
      const budget = this.getBudgetForMonth(categoryId, month, year, budgets);
      return sum + (budget?.amount || 0);
    }, 0);
  }

  /**
   * Calculate total spent across all budgets
   */
  static calculateTotalSpent(
    budgets: Budget[],
    transactions: Transaction[],
    month: number,
    year: number
  ): number {
    return budgets.reduce((sum, budget) => {
      const spent = this.calculateCategoryExpense(budget.categoryId, transactions, month, year);
      return sum + spent;
    }, 0);
  }
}