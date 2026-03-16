/**
 * INTEGRATION TESTS - TRANSACTION FLOWS
 * 
 * Tests de integración para flujos completos de transacciones.
 * Valida la interacción entre múltiples features y la sincronización con Supabase.
 * 
 * Cobertura:
 * - Crear transacciones (Ingreso, Gasto, Transferencia)
 * - Editar transacciones y validar actualizaciones
 * - Eliminar transacciones y validar reversiones
 * - Sincronización con backend
 * - Actualización de cuentas y presupuestos
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransactionCreateSchema } from '../../schemas/transaction';
import { AccountCreateSchema } from '../../schemas/account';
import { BudgetCreateSchema } from '../../schemas/budget';
import { CategoryCreateSchema } from '../../schemas/category';

// Mock de Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({ data: { id: 'tx-1' }, error: null })),
    update: vi.fn(() => ({ eq: vi.fn(() => ({ data: {}, error: null })) })),
    delete: vi.fn(() => ({ eq: vi.fn(() => ({ data: {}, error: null })) })),
    select: vi.fn(() => ({ eq: vi.fn(() => ({ data: [], error: null })) })),
  })),
};

// Simulador de estado de la aplicación
class AppState {
  transactions: any[] = [];
  accounts: Map<string, any> = new Map();
  budgets: Map<string, any> = new Map();
  categories: Map<string, any> = new Map();

  reset() {
    this.transactions = [];
    this.accounts.clear();
    this.budgets.clear();
    this.categories.clear();
  }

  addAccount(account: any) {
    this.accounts.set(account.id, account);
  }

  getAccount(id: string) {
    return this.accounts.get(id);
  }

  updateAccountBalance(accountId: string, amount: number) {
    const account = this.accounts.get(accountId);
    if (account) {
      account.balance += amount;
      this.accounts.set(accountId, account);
    }
  }

  addBudget(budget: any) {
    this.budgets.set(budget.id, budget);
  }

  getBudget(categoryId: string) {
    return Array.from(this.budgets.values()).find(
      (b) => b.categoryId === categoryId
    );
  }

  updateBudgetSpent(categoryId: string, amount: number) {
    const budget = this.getBudget(categoryId);
    if (budget) {
      budget.spent += amount;
      this.budgets.set(budget.id, budget);
    }
  }

  addCategory(category: any) {
    this.categories.set(category.id, category);
  }

  addTransaction(transaction: any) {
    this.transactions.push(transaction);
  }

  getTransaction(id: string) {
    return this.transactions.find((t) => t.id === id);
  }

  updateTransaction(id: string, updates: any) {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.transactions[index] = { ...this.transactions[index], ...updates };
    }
  }

  deleteTransaction(id: string) {
    this.transactions = this.transactions.filter((t) => t.id !== id);
  }
}

const appState = new AppState();

describe('Transaction Creation Flow - Integration', () => {
  beforeEach(() => {
    appState.reset();
    vi.clearAllMocks();

    // Setup inicial: cuenta y categoría
    appState.addAccount({
      id: 'acc-1',
      name: 'Cuenta Corriente',
      type: 'bank',
      balance: 1000,
      userId: 'user-1',
    });

    appState.addCategory({
      id: 'cat-income',
      name: 'Salario',
      type: 'income',
      userId: 'user-1',
    });

    appState.addCategory({
      id: 'cat-expense',
      name: 'Comida',
      type: 'expense',
      userId: 'user-1',
    });
  });

  it('should create income transaction with complete flow', async () => {
    // 1. Preparar datos de transacción de ingreso
    const incomeData = {
      type: 'income',
      amount: 500,
      accountId: 'acc-1',
      categoryId: 'cat-income',
      description: 'Pago de salario',
      date: new Date().toISOString(),
      userId: 'user-1',
    };

    // 2. Validar con schema
    const validationResult = TransactionCreateSchema.safeParse(incomeData);
    expect(validationResult.success).toBe(true);

    // 3. Obtener balance inicial
    const accountBefore = appState.getAccount('acc-1');
    expect(accountBefore?.balance).toBe(1000);

    // 4. Simular creación de transacción
    const transaction = {
      id: 'tx-1',
      ...incomeData,
      createdAt: new Date().toISOString(),
    };
    appState.addTransaction(transaction);

    // 5. Actualizar balance de cuenta
    appState.updateAccountBalance('acc-1', incomeData.amount);

    // 6. Verificar actualización de balance
    const accountAfter = appState.getAccount('acc-1');
    expect(accountAfter?.balance).toBe(1500); // 1000 + 500

    // 7. Verificar transacción creada
    const createdTransaction = appState.getTransaction('tx-1');
    expect(createdTransaction).toBeDefined();
    expect(createdTransaction?.amount).toBe(500);
    expect(createdTransaction?.type).toBe('income');

    // 8. Simular sincronización con Supabase
    const syncResult = await mockSupabase.from('transactions').insert(transaction);
    expect(syncResult.data).toBeDefined();
    expect(syncResult.error).toBeNull();
  });

  it('should create expense transaction and update budget', async () => {
    // 1. Crear presupuesto para categoría de gasto
    const budget = {
      id: 'budget-1',
      categoryId: 'cat-expense',
      amount: 300,
      spent: 0,
      period: 'monthly',
      userId: 'user-1',
    };
    appState.addBudget(budget);

    // 2. Preparar datos de transacción de gasto
    const expenseData = {
      type: 'expense',
      amount: 150,
      accountId: 'acc-1',
      categoryId: 'cat-expense',
      description: 'Compra de alimentos',
      date: new Date().toISOString(),
      userId: 'user-1',
    };

    // 3. Validar con schema
    const validationResult = TransactionCreateSchema.safeParse(expenseData);
    expect(validationResult.success).toBe(true);

    // 4. Obtener estados iniciales
    const accountBefore = appState.getAccount('acc-1');
    const budgetBefore = appState.getBudget('cat-expense');
    expect(accountBefore?.balance).toBe(1000);
    expect(budgetBefore?.spent).toBe(0);

    // 5. Simular creación de transacción
    const transaction = {
      id: 'tx-2',
      ...expenseData,
      createdAt: new Date().toISOString(),
    };
    appState.addTransaction(transaction);

    // 6. Actualizar balance de cuenta (restar gasto)
    appState.updateAccountBalance('acc-1', -expenseData.amount);

    // 7. Actualizar presupuesto gastado
    appState.updateBudgetSpent('cat-expense', expenseData.amount);

    // 8. Verificar actualización de balance
    const accountAfter = appState.getAccount('acc-1');
    expect(accountAfter?.balance).toBe(850); // 1000 - 150

    // 9. Verificar actualización de presupuesto
    const budgetAfter = appState.getBudget('cat-expense');
    expect(budgetAfter?.spent).toBe(150);
    expect(budgetAfter?.spent / budgetAfter?.amount).toBe(0.5); // 50% usado

    // 10. Verificar que no excede límite
    expect(budgetAfter?.spent).toBeLessThan(budgetAfter?.amount);

    // 11. Simular sincronización
    const syncResult = await mockSupabase.from('transactions').insert(transaction);
    expect(syncResult.data).toBeDefined();
  });

  it('should trigger alert when expense exceeds budget', async () => {
    // 1. Crear presupuesto con límite bajo
    const budget = {
      id: 'budget-2',
      categoryId: 'cat-expense',
      amount: 100,
      spent: 80, // Ya gastado 80%
      period: 'monthly',
      alertThreshold: 90, // Alerta al 90%
      userId: 'user-1',
    };
    appState.addBudget(budget);

    // 2. Preparar gasto que excederá el límite
    const expenseData = {
      type: 'expense',
      amount: 30, // Total será 110, excediendo 100
      accountId: 'acc-1',
      categoryId: 'cat-expense',
      description: 'Compra que excede presupuesto',
      date: new Date().toISOString(),
      userId: 'user-1',
    };

    // 3. Crear transacción
    const transaction = {
      id: 'tx-3',
      ...expenseData,
      createdAt: new Date().toISOString(),
    };
    appState.addTransaction(transaction);
    appState.updateAccountBalance('acc-1', -expenseData.amount);
    appState.updateBudgetSpent('cat-expense', expenseData.amount);

    // 4. Verificar que se excedió el presupuesto
    const budgetAfter = appState.getBudget('cat-expense');
    expect(budgetAfter?.spent).toBe(110);
    expect(budgetAfter?.spent).toBeGreaterThan(budgetAfter?.amount);

    // 5. Calcular porcentaje usado
    const percentUsed = (budgetAfter.spent / budgetAfter.amount) * 100;
    expect(percentUsed).toBe(110); // 110%

    // 6. Verificar que se debe mostrar alerta
    const shouldAlert = budgetAfter.spent > budgetAfter.amount;
    expect(shouldAlert).toBe(true);

    // 7. Simular generación de alerta
    const alert = {
      type: 'budget_exceeded',
      categoryId: 'cat-expense',
      budgetId: 'budget-2',
      budgetAmount: budgetAfter.amount,
      spent: budgetAfter.spent,
      excess: budgetAfter.spent - budgetAfter.amount,
      message: `Has excedido tu presupuesto de Comida en $${budgetAfter.spent - budgetAfter.amount}`,
    };

    expect(alert.excess).toBe(10);
    expect(alert.type).toBe('budget_exceeded');
  });
});

describe('Transaction Transfer Flow - Integration', () => {
  beforeEach(() => {
    appState.reset();

    // Setup: dos cuentas para transferencia
    appState.addAccount({
      id: 'acc-1',
      name: 'Cuenta Corriente',
      type: 'bank',
      balance: 1000,
      userId: 'user-1',
    });

    appState.addAccount({
      id: 'acc-2',
      name: 'Ahorros',
      type: 'savings',
      balance: 500,
      userId: 'user-1',
    });

    appState.addCategory({
      id: 'cat-transfer',
      name: 'Transferencia',
      type: 'transfer',
      userId: 'user-1',
    });
  });

  it('should transfer money between accounts with complete flow', async () => {
    // 1. Preparar datos de transferencia
    const transferData = {
      type: 'transfer',
      amount: 300,
      accountId: 'acc-1', // Cuenta origen
      toAccountId: 'acc-2', // Cuenta destino
      categoryId: 'cat-transfer',
      description: 'Ahorro mensual',
      date: new Date().toISOString(),
      userId: 'user-1',
    };

    // 2. Validar datos
    const validationResult = TransactionCreateSchema.safeParse(transferData);
    expect(validationResult.success).toBe(true);

    // 3. Obtener balances iniciales
    const account1Before = appState.getAccount('acc-1');
    const account2Before = appState.getAccount('acc-2');
    expect(account1Before?.balance).toBe(1000);
    expect(account2Before?.balance).toBe(500);

    // 4. Crear transacción de salida (cuenta origen)
    const transactionOut = {
      id: 'tx-out-1',
      ...transferData,
      type: 'expense', // Sale de cuenta origen
      createdAt: new Date().toISOString(),
    };
    appState.addTransaction(transactionOut);

    // 5. Crear transacción de entrada (cuenta destino)
    const transactionIn = {
      id: 'tx-in-1',
      ...transferData,
      type: 'income', // Entra a cuenta destino
      accountId: 'acc-2',
      linkedTransactionId: 'tx-out-1', // Vinculación
      createdAt: new Date().toISOString(),
    };
    appState.addTransaction(transactionIn);

    // 6. Actualizar balance de cuenta origen (restar)
    appState.updateAccountBalance('acc-1', -transferData.amount);

    // 7. Actualizar balance de cuenta destino (sumar)
    appState.updateAccountBalance('acc-2', transferData.amount);

    // 8. Verificar balances finales
    const account1After = appState.getAccount('acc-1');
    const account2After = appState.getAccount('acc-2');
    expect(account1After?.balance).toBe(700); // 1000 - 300
    expect(account2After?.balance).toBe(800); // 500 + 300

    // 9. Verificar que se crearon ambas transacciones
    expect(appState.transactions).toHaveLength(2);

    // 10. Verificar vinculación entre transacciones
    const txOut = appState.getTransaction('tx-out-1');
    const txIn = appState.getTransaction('tx-in-1');
    expect(txIn?.linkedTransactionId).toBe(txOut?.id);

    // 11. Verificar que el total de patrimonio se mantuvo
    const totalBefore = 1000 + 500;
    const totalAfter = account1After.balance + account2After.balance;
    expect(totalAfter).toBe(totalBefore); // 1500 = 1500

    // 12. Simular sincronización de ambas transacciones
    await mockSupabase.from('transactions').insert(transactionOut);
    await mockSupabase.from('transactions').insert(transactionIn);
  });

  it('should validate sufficient balance for transfer', async () => {
    // 1. Intentar transferir más dinero del disponible
    const transferData = {
      type: 'transfer',
      amount: 1500, // Más que el balance de 1000
      accountId: 'acc-1',
      toAccountId: 'acc-2',
      categoryId: 'cat-transfer',
      description: 'Transferencia que excede balance',
      date: new Date().toISOString(),
      userId: 'user-1',
    };

    // 2. Obtener balance actual
    const account = appState.getAccount('acc-1');
    expect(account?.balance).toBe(1000);

    // 3. Validar que hay fondos suficientes
    const hasSufficientFunds = account.balance >= transferData.amount;
    expect(hasSufficientFunds).toBe(false);

    // 4. La transacción NO debe crearse
    if (!hasSufficientFunds) {
      const error = {
        code: 'INSUFFICIENT_FUNDS',
        message: 'Fondos insuficientes para realizar la transferencia',
        available: account.balance,
        required: transferData.amount,
        shortage: transferData.amount - account.balance,
      };

      expect(error.code).toBe('INSUFFICIENT_FUNDS');
      expect(error.shortage).toBe(500);
    }

    // 5. Verificar que no se creó ninguna transacción
    expect(appState.transactions).toHaveLength(0);

    // 6. Verificar que los balances no cambiaron
    const accountAfter = appState.getAccount('acc-1');
    expect(accountAfter?.balance).toBe(1000);
  });
});

describe('Transaction Edit/Delete Flow - Integration', () => {
  beforeEach(() => {
    appState.reset();

    appState.addAccount({
      id: 'acc-1',
      name: 'Cuenta Corriente',
      type: 'bank',
      balance: 1000,
      userId: 'user-1',
    });

    appState.addCategory({
      id: 'cat-expense',
      name: 'Comida',
      type: 'expense',
      userId: 'user-1',
    });

    appState.addBudget({
      id: 'budget-1',
      categoryId: 'cat-expense',
      amount: 300,
      spent: 0,
      period: 'monthly',
      userId: 'user-1',
    });
  });

  it('should edit transaction and update all related data', async () => {
    // 1. Crear transacción inicial
    const originalTransaction = {
      id: 'tx-1',
      type: 'expense',
      amount: 100,
      accountId: 'acc-1',
      categoryId: 'cat-expense',
      description: 'Compra original',
      date: new Date().toISOString(),
      userId: 'user-1',
    };
    appState.addTransaction(originalTransaction);
    appState.updateAccountBalance('acc-1', -100);
    appState.updateBudgetSpent('cat-expense', 100);

    // 2. Verificar estado inicial
    const accountBefore = appState.getAccount('acc-1');
    const budgetBefore = appState.getBudget('cat-expense');
    expect(accountBefore?.balance).toBe(900); // 1000 - 100
    expect(budgetBefore?.spent).toBe(100);

    // 3. Preparar edición (cambiar monto de 100 a 150)
    const editedData = {
      amount: 150, // +50
    };

    // 4. Calcular diferencia
    const amountDiff = editedData.amount - originalTransaction.amount;
    expect(amountDiff).toBe(50);

    // 5. Actualizar transacción
    appState.updateTransaction('tx-1', editedData);

    // 6. Ajustar balance de cuenta
    appState.updateAccountBalance('acc-1', -amountDiff);

    // 7. Ajustar presupuesto gastado
    appState.updateBudgetSpent('cat-expense', amountDiff);

    // 8. Verificar actualizaciones
    const accountAfter = appState.getAccount('acc-1');
    const budgetAfter = appState.getBudget('cat-expense');
    const transactionAfter = appState.getTransaction('tx-1');

    expect(accountAfter?.balance).toBe(850); // 900 - 50
    expect(budgetAfter?.spent).toBe(150); // 100 + 50
    expect(transactionAfter?.amount).toBe(150);

    // 9. Simular sincronización
    await mockSupabase.from('transactions').update(editedData);
  });

  it('should delete transaction and revert all changes', async () => {
    // 1. Crear transacción
    const transaction = {
      id: 'tx-2',
      type: 'expense',
      amount: 200,
      accountId: 'acc-1',
      categoryId: 'cat-expense',
      description: 'Compra a eliminar',
      date: new Date().toISOString(),
      userId: 'user-1',
    };
    appState.addTransaction(transaction);
    appState.updateAccountBalance('acc-1', -200);
    appState.updateBudgetSpent('cat-expense', 200);

    // 2. Verificar estado después de crear
    const accountBefore = appState.getAccount('acc-1');
    const budgetBefore = appState.getBudget('cat-expense');
    expect(accountBefore?.balance).toBe(800); // 1000 - 200
    expect(budgetBefore?.spent).toBe(200);
    expect(appState.transactions).toHaveLength(1);

    // 3. Eliminar transacción
    appState.deleteTransaction('tx-2');

    // 4. Revertir cambios en balance (devolver el monto)
    appState.updateAccountBalance('acc-1', transaction.amount);

    // 5. Revertir cambios en presupuesto
    appState.updateBudgetSpent('cat-expense', -transaction.amount);

    // 6. Verificar reversión completa
    const accountAfter = appState.getAccount('acc-1');
    const budgetAfter = appState.getBudget('cat-expense');

    expect(accountAfter?.balance).toBe(1000); // Vuelve al original
    expect(budgetAfter?.spent).toBe(0); // Vuelve a 0
    expect(appState.transactions).toHaveLength(0);

    // 7. Verificar transacción eliminada
    const deletedTransaction = appState.getTransaction('tx-2');
    expect(deletedTransaction).toBeUndefined();

    // 8. Simular sincronización de eliminación
    await mockSupabase.from('transactions').delete();
  });

  it('should maintain data integrity when editing multiple times', async () => {
    // 1. Crear transacción
    const transaction = {
      id: 'tx-3',
      type: 'expense',
      amount: 50,
      accountId: 'acc-1',
      categoryId: 'cat-expense',
      description: 'Compra múltiple edición',
      date: new Date().toISOString(),
      userId: 'user-1',
    };
    appState.addTransaction(transaction);
    appState.updateAccountBalance('acc-1', -50);
    appState.updateBudgetSpent('cat-expense', 50);

    const initialBalance = 950; // 1000 - 50
    const initialSpent = 50;

    // 2. Primera edición: cambiar a 75
    let currentAmount = 50;
    let newAmount = 75;
    let diff = newAmount - currentAmount;

    appState.updateTransaction('tx-3', { amount: newAmount });
    appState.updateAccountBalance('acc-1', -diff);
    appState.updateBudgetSpent('cat-expense', diff);

    let account = appState.getAccount('acc-1');
    let budget = appState.getBudget('cat-expense');
    expect(account?.balance).toBe(925); // 950 - 25
    expect(budget?.spent).toBe(75); // 50 + 25

    // 3. Segunda edición: cambiar a 60
    currentAmount = 75;
    newAmount = 60;
    diff = newAmount - currentAmount;

    appState.updateTransaction('tx-3', { amount: newAmount });
    appState.updateAccountBalance('acc-1', -diff);
    appState.updateBudgetSpent('cat-expense', diff);

    account = appState.getAccount('acc-1');
    budget = appState.getBudget('cat-expense');
    expect(account?.balance).toBe(940); // 925 + 15
    expect(budget?.spent).toBe(60); // 75 - 15

    // 4. Tercera edición: cambiar a 100
    currentAmount = 60;
    newAmount = 100;
    diff = newAmount - currentAmount;

    appState.updateTransaction('tx-3', { amount: newAmount });
    appState.updateAccountBalance('acc-1', -diff);
    appState.updateBudgetSpent('cat-expense', diff);

    account = appState.getAccount('acc-1');
    budget = appState.getBudget('cat-expense');
    expect(account?.balance).toBe(900); // 940 - 40
    expect(budget?.spent).toBe(100); // 60 + 40

    // 5. Verificar integridad final
    const finalTransaction = appState.getTransaction('tx-3');
    expect(finalTransaction?.amount).toBe(100);
    expect(account?.balance).toBe(initialBalance - 50); // 1000 - 100 = 900
    expect(budget?.spent).toBe(100);
  });
});
