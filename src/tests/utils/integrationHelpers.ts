/**
 * INTEGRATION TEST HELPERS
 * 
 * Utilidades para tests de integración que necesitan simular
 * el estado completo de la aplicación y múltiples interacciones.
 */

import { vi } from 'vitest';

/**
 * Mock mejorado de Supabase para integration tests
 */
export const createMockSupabase = () => {
  const mockData = new Map<string, any[]>();

  return {
    from: (table: string) => ({
      insert: vi.fn(async (data: any) => {
        const tableData = mockData.get(table) || [];
        const newRecord = { ...data, id: `${table}-${Date.now()}` };
        mockData.set(table, [...tableData, newRecord]);
        return { data: newRecord, error: null };
      }),
      
      update: vi.fn((data: any) => ({
        eq: vi.fn(async (field: string, value: any) => {
          const tableData = mockData.get(table) || [];
          const index = tableData.findIndex((item) => item[field] === value);
          if (index !== -1) {
            tableData[index] = { ...tableData[index], ...data };
            mockData.set(table, tableData);
          }
          return { data: tableData[index], error: null };
        }),
      })),
      
      delete: vi.fn(() => ({
        eq: vi.fn(async (field: string, value: any) => {
          const tableData = mockData.get(table) || [];
          const filtered = tableData.filter((item) => item[field] !== value);
          mockData.set(table, filtered);
          return { data: {}, error: null };
        }),
      })),
      
      select: vi.fn((fields?: string) => ({
        eq: vi.fn(async (field: string, value: any) => {
          const tableData = mockData.get(table) || [];
          const filtered = tableData.filter((item) => item[field] === value);
          return { data: filtered, error: null };
        }),
        
        single: vi.fn(async () => {
          const tableData = mockData.get(table) || [];
          return { data: tableData[0] || null, error: null };
        }),
      })),
    }),
    
    // Método de utilidad para limpiar datos
    __reset: () => {
      mockData.clear();
    },
    
    // Método de utilidad para obtener datos de prueba
    __getData: (table: string) => {
      return mockData.get(table) || [];
    },
  };
};

/**
 * Simulador del estado completo de la aplicación
 */
export class AppStateSimulator {
  private transactions: Map<string, any> = new Map();
  private accounts: Map<string, any> = new Map();
  private budgets: Map<string, any> = new Map();
  private categories: Map<string, any> = new Map();
  private alerts: any[] = [];

  reset() {
    this.transactions.clear();
    this.accounts.clear();
    this.budgets.clear();
    this.categories.clear();
    this.alerts = [];
  }

  // ==========================================
  // ACCOUNTS
  // ==========================================

  addAccount(account: any) {
    const id = account.id || `acc-${Date.now()}`;
    this.accounts.set(id, { ...account, id });
    return this.accounts.get(id);
  }

  getAccount(id: string) {
    return this.accounts.get(id);
  }

  getAllAccounts() {
    return Array.from(this.accounts.values());
  }

  updateAccountBalance(accountId: string, delta: number) {
    const account = this.accounts.get(accountId);
    if (account) {
      account.balance += delta;
      account.updatedAt = new Date().toISOString();
      this.accounts.set(accountId, account);
    }
    return this.accounts.get(accountId);
  }

  setAccountBalance(accountId: string, newBalance: number) {
    const account = this.accounts.get(accountId);
    if (account) {
      account.balance = newBalance;
      account.updatedAt = new Date().toISOString();
      this.accounts.set(accountId, account);
    }
    return this.accounts.get(accountId);
  }

  deleteAccount(accountId: string) {
    return this.accounts.delete(accountId);
  }

  getTotalWealth() {
    return Array.from(this.accounts.values()).reduce(
      (total, account) => total + (account.balance || 0),
      0
    );
  }

  // ==========================================
  // BUDGETS
  // ==========================================

  addBudget(budget: any) {
    const id = budget.id || `budget-${Date.now()}`;
    this.budgets.set(id, { ...budget, id, spent: budget.spent || 0 });
    return this.budgets.get(id);
  }

  getBudget(id: string) {
    return this.budgets.get(id);
  }

  getBudgetByCategory(categoryId: string) {
    return Array.from(this.budgets.values()).find(
      (b) => b.categoryId === categoryId
    );
  }

  getAllBudgets() {
    return Array.from(this.budgets.values());
  }

  updateBudgetSpent(categoryId: string, delta: number) {
    const budget = this.getBudgetByCategory(categoryId);
    if (budget) {
      budget.spent += delta;
      budget.updatedAt = new Date().toISOString();
      
      // Verificar si se debe generar alerta
      if (this.shouldTriggerBudgetAlert(budget)) {
        this.generateBudgetAlert(budget);
      }
      
      this.budgets.set(budget.id, budget);
    }
    return budget;
  }

  setBudgetSpent(budgetId: string, newSpent: number) {
    const budget = this.budgets.get(budgetId);
    if (budget) {
      budget.spent = newSpent;
      budget.updatedAt = new Date().toISOString();
      this.budgets.set(budgetId, budget);
    }
    return budget;
  }

  deleteBudget(budgetId: string) {
    return this.budgets.delete(budgetId);
  }

  shouldTriggerBudgetAlert(budget: any) {
    const percentUsed = (budget.spent / budget.amount) * 100;
    const threshold = budget.alertThreshold || 90;
    return percentUsed >= threshold;
  }

  getBudgetProgress(budgetId: string) {
    const budget = this.budgets.get(budgetId);
    if (!budget) return null;

    const percentUsed = (budget.spent / budget.amount) * 100;
    const remaining = budget.amount - budget.spent;

    return {
      budgetId: budget.id,
      amount: budget.amount,
      spent: budget.spent,
      remaining,
      percentUsed,
      exceeded: budget.spent > budget.amount,
    };
  }

  // ==========================================
  // CATEGORIES
  // ==========================================

  addCategory(category: any) {
    const id = category.id || `cat-${Date.now()}`;
    this.categories.set(id, { ...category, id });
    return this.categories.get(id);
  }

  getCategory(id: string) {
    return this.categories.get(id);
  }

  getAllCategories(type?: 'income' | 'expense' | 'transfer') {
    const categories = Array.from(this.categories.values());
    return type ? categories.filter((c) => c.type === type) : categories;
  }

  deleteCategory(categoryId: string) {
    return this.categories.delete(categoryId);
  }

  // ==========================================
  // TRANSACTIONS
  // ==========================================

  addTransaction(transaction: any) {
    const id = transaction.id || `tx-${Date.now()}`;
    const newTransaction = {
      ...transaction,
      id,
      createdAt: transaction.createdAt || new Date().toISOString(),
    };
    this.transactions.set(id, newTransaction);
    return this.transactions.get(id);
  }

  getTransaction(id: string) {
    return this.transactions.get(id);
  }

  getAllTransactions() {
    return Array.from(this.transactions.values());
  }

  getTransactionsByAccount(accountId: string) {
    return Array.from(this.transactions.values()).filter(
      (t) => t.accountId === accountId
    );
  }

  getTransactionsByCategory(categoryId: string) {
    return Array.from(this.transactions.values()).filter(
      (t) => t.categoryId === categoryId
    );
  }

  updateTransaction(id: string, updates: any) {
    const transaction = this.transactions.get(id);
    if (transaction) {
      const updated = {
        ...transaction,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.transactions.set(id, updated);
      return updated;
    }
    return null;
  }

  deleteTransaction(id: string) {
    return this.transactions.delete(id);
  }

  // ==========================================
  // TRANSACTION FLOWS
  // ==========================================

  createIncomeTransaction(data: {
    amount: number;
    accountId: string;
    categoryId: string;
    description?: string;
    date?: string;
    userId: string;
  }) {
    // 1. Crear transacción
    const transaction = this.addTransaction({
      type: 'income',
      ...data,
    });

    // 2. Actualizar balance de cuenta
    this.updateAccountBalance(data.accountId, data.amount);

    return transaction;
  }

  createExpenseTransaction(data: {
    amount: number;
    accountId: string;
    categoryId: string;
    description?: string;
    date?: string;
    userId: string;
  }) {
    // 1. Crear transacción
    const transaction = this.addTransaction({
      type: 'expense',
      ...data,
    });

    // 2. Actualizar balance de cuenta (restar)
    this.updateAccountBalance(data.accountId, -data.amount);

    // 3. Actualizar presupuesto si existe
    const budget = this.getBudgetByCategory(data.categoryId);
    if (budget) {
      this.updateBudgetSpent(data.categoryId, data.amount);
    }

    return transaction;
  }

  createTransferTransaction(data: {
    amount: number;
    fromAccountId: string;
    toAccountId: string;
    categoryId: string;
    description?: string;
    date?: string;
    userId: string;
  }) {
    // 1. Verificar fondos suficientes
    const fromAccount = this.getAccount(data.fromAccountId);
    if (!fromAccount || fromAccount.balance < data.amount) {
      throw new Error('INSUFFICIENT_FUNDS');
    }

    // 2. Crear transacción de salida
    const transactionOut = this.addTransaction({
      type: 'expense',
      amount: data.amount,
      accountId: data.fromAccountId,
      categoryId: data.categoryId,
      description: data.description,
      date: data.date,
      userId: data.userId,
    });

    // 3. Crear transacción de entrada
    const transactionIn = this.addTransaction({
      type: 'income',
      amount: data.amount,
      accountId: data.toAccountId,
      categoryId: data.categoryId,
      description: data.description,
      date: data.date,
      userId: data.userId,
      linkedTransactionId: transactionOut.id,
    });

    // 4. Actualizar balances
    this.updateAccountBalance(data.fromAccountId, -data.amount);
    this.updateAccountBalance(data.toAccountId, data.amount);

    return { transactionOut, transactionIn };
  }

  editTransaction(id: string, updates: { amount?: number; [key: string]: any }) {
    const originalTransaction = this.getTransaction(id);
    if (!originalTransaction) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }

    // Si cambia el monto, ajustar balance y presupuesto
    if (updates.amount !== undefined && updates.amount !== originalTransaction.amount) {
      const delta = updates.amount - originalTransaction.amount;

      // Ajustar balance según tipo de transacción
      if (originalTransaction.type === 'income') {
        this.updateAccountBalance(originalTransaction.accountId, delta);
      } else if (originalTransaction.type === 'expense') {
        this.updateAccountBalance(originalTransaction.accountId, -delta);
        
        // Ajustar presupuesto
        const budget = this.getBudgetByCategory(originalTransaction.categoryId);
        if (budget) {
          this.updateBudgetSpent(originalTransaction.categoryId, delta);
        }
      }
    }

    // Actualizar transacción
    return this.updateTransaction(id, updates);
  }

  removeTransaction(id: string) {
    const transaction = this.getTransaction(id);
    if (!transaction) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }

    // Revertir cambios en balance
    if (transaction.type === 'income') {
      this.updateAccountBalance(transaction.accountId, -transaction.amount);
    } else if (transaction.type === 'expense') {
      this.updateAccountBalance(transaction.accountId, transaction.amount);
      
      // Revertir presupuesto
      const budget = this.getBudgetByCategory(transaction.categoryId);
      if (budget) {
        this.updateBudgetSpent(transaction.categoryId, -transaction.amount);
      }
    }

    // Eliminar transacción
    return this.deleteTransaction(id);
  }

  // ==========================================
  // ALERTS
  // ==========================================

  generateBudgetAlert(budget: any) {
    const alert = {
      id: `alert-${Date.now()}`,
      type: 'budget_alert',
      budgetId: budget.id,
      categoryId: budget.categoryId,
      severity: budget.spent > budget.amount ? 'critical' : 'warning',
      message: budget.spent > budget.amount
        ? `Has excedido tu presupuesto en $${budget.spent - budget.amount}`
        : `Has alcanzado el ${Math.round((budget.spent / budget.amount) * 100)}% de tu presupuesto`,
      createdAt: new Date().toISOString(),
    };

    this.alerts.push(alert);
    return alert;
  }

  getAlerts() {
    return this.alerts;
  }

  clearAlerts() {
    this.alerts = [];
  }

  // ==========================================
  // STATISTICS
  // ==========================================

  getStatistics(startDate?: string, endDate?: string) {
    const transactions = this.getAllTransactions();
    
    const filtered = startDate && endDate
      ? transactions.filter((t) => {
          const txDate = new Date(t.date || t.createdAt);
          return txDate >= new Date(startDate) && txDate <= new Date(endDate);
        })
      : transactions;

    const totalIncome = filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpense;

    const byCategory = filtered.reduce((acc, t) => {
      if (!acc[t.categoryId]) {
        acc[t.categoryId] = { income: 0, expense: 0, count: 0 };
      }
      if (t.type === 'income') {
        acc[t.categoryId].income += t.amount;
      } else if (t.type === 'expense') {
        acc[t.categoryId].expense += t.amount;
      }
      acc[t.categoryId].count++;
      return acc;
    }, {} as Record<string, any>);

    return {
      totalIncome,
      totalExpense,
      netBalance,
      transactionCount: filtered.length,
      byCategory,
      averageExpense: filtered.filter((t) => t.type === 'expense').length > 0
        ? totalExpense / filtered.filter((t) => t.type === 'expense').length
        : 0,
    };
  }
}

/**
 * Factory para crear simulador preconfigurado
 */
export function createTestAppState() {
  return new AppStateSimulator();
}

/**
 * Fixture de datos de prueba comunes
 */
export const testFixtures = {
  user: {
    id: 'user-test-1',
    email: 'test@oti.com',
    name: 'Usuario Test',
  },

  accounts: {
    checking: {
      id: 'acc-checking',
      name: 'Cuenta Corriente',
      type: 'bank',
      balance: 1000,
      currency: 'USD',
      userId: 'user-test-1',
    },
    savings: {
      id: 'acc-savings',
      name: 'Ahorros',
      type: 'savings',
      balance: 5000,
      currency: 'USD',
      userId: 'user-test-1',
    },
    cash: {
      id: 'acc-cash',
      name: 'Efectivo',
      type: 'cash',
      balance: 200,
      currency: 'USD',
      userId: 'user-test-1',
    },
  },

  categories: {
    salary: {
      id: 'cat-salary',
      name: 'Salario',
      type: 'income',
      icon: '💰',
      userId: 'user-test-1',
    },
    food: {
      id: 'cat-food',
      name: 'Comida',
      type: 'expense',
      icon: '🍔',
      userId: 'user-test-1',
    },
    transport: {
      id: 'cat-transport',
      name: 'Transporte',
      type: 'expense',
      icon: '🚗',
      userId: 'user-test-1',
    },
    transfer: {
      id: 'cat-transfer',
      name: 'Transferencia',
      type: 'transfer',
      icon: '↔️',
      userId: 'user-test-1',
    },
  },

  budgets: {
    food: {
      id: 'budget-food',
      categoryId: 'cat-food',
      amount: 500,
      spent: 0,
      period: 'monthly',
      alertThreshold: 90,
      userId: 'user-test-1',
    },
    transport: {
      id: 'budget-transport',
      categoryId: 'cat-transport',
      amount: 200,
      spent: 0,
      period: 'monthly',
      alertThreshold: 85,
      userId: 'user-test-1',
    },
  },
};
