/**
 * INTEGRATION TESTS - ACCOUNT FLOWS
 * 
 * Tests de integración para flujos completos de cuentas.
 * Valida la gestión de cuentas, balances y patrimonio total.
 * 
 * Cobertura:
 * - Crear y gestionar cuentas
 * - Tracking automático de balances
 * - Múltiples cuentas simultáneas
 * - Cálculo de patrimonio total
 * - Transferencias entre cuentas
 * - Consistencia de datos
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AccountCreateSchema } from '../../schemas/account';
import { createTestAppState, testFixtures } from '../utils/integrationHelpers';

const appState = createTestAppState();

describe('Account Creation and Balance Tracking Flow - Integration', () => {
  beforeEach(() => {
    appState.reset();

    // Setup: categorías necesarias
    appState.addCategory(testFixtures.categories.salary);
    appState.addCategory(testFixtures.categories.food);
    appState.addCategory(testFixtures.categories.transfer);
  });

  it('should create account and track balance through transactions', async () => {
    // 1. Crear cuenta bancaria
    const accountData = {
      name: 'Cuenta Corriente Principal',
      type: 'bank',
      balance: 1000,
      currency: 'USD',
      userId: testFixtures.user.id,
    };

    // 2. Validar con schema
    const validationResult = AccountCreateSchema.safeParse(accountData);
    expect(validationResult.success).toBe(true);

    // 3. Agregar cuenta al estado
    const account = appState.addAccount(accountData);
    expect(account).toBeDefined();
    expect(account.balance).toBe(1000);

    // 4. Crear ingreso
    const income = appState.createIncomeTransaction({
      amount: 500,
      accountId: account.id,
      categoryId: testFixtures.categories.salary.id,
      description: 'Pago de salario',
      userId: testFixtures.user.id,
    });

    expect(income).toBeDefined();

    // 5. Verificar actualización de balance
    let updatedAccount = appState.getAccount(account.id);
    expect(updatedAccount?.balance).toBe(1500); // 1000 + 500

    // 6. Crear gasto
    appState.createExpenseTransaction({
      amount: 200,
      accountId: account.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Compra de alimentos',
      userId: testFixtures.user.id,
    });

    // 7. Verificar descuento de balance
    updatedAccount = appState.getAccount(account.id);
    expect(updatedAccount?.balance).toBe(1300); // 1500 - 200

    // 8. Crear varios gastos más
    appState.createExpenseTransaction({
      amount: 100,
      accountId: account.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Restaurante',
      userId: testFixtures.user.id,
    });

    appState.createExpenseTransaction({
      amount: 50,
      accountId: account.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Café',
      userId: testFixtures.user.id,
    });

    // 9. Verificar balance final
    updatedAccount = appState.getAccount(account.id);
    expect(updatedAccount?.balance).toBe(1150); // 1300 - 100 - 50

    // 10. Verificar historial de transacciones
    const transactions = appState.getTransactionsByAccount(account.id);
    expect(transactions.length).toBe(4); // 1 ingreso + 3 gastos

    // 11. Calcular balance desde transacciones
    const initialBalance = 1000;
    const incomes = transactions.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const calculatedBalance = initialBalance + incomes - expenses;
    expect(calculatedBalance).toBe(updatedAccount?.balance);
  });

  it('should handle initial balance editing correctly', async () => {
    // 1. Crear cuenta con balance inicial
    const account = appState.addAccount({
      name: 'Cuenta de Ahorros',
      type: 'savings',
      balance: 5000,
      currency: 'USD',
      userId: testFixtures.user.id,
    });

    expect(account.balance).toBe(5000);

    // 2. Crear algunas transacciones
    appState.createIncomeTransaction({
      amount: 1000,
      accountId: account.id,
      categoryId: testFixtures.categories.salary.id,
      description: 'Ingreso',
      userId: testFixtures.user.id,
    });

    appState.createExpenseTransaction({
      amount: 500,
      accountId: account.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Gasto',
      userId: testFixtures.user.id,
    });

    // 3. Verificar balance actual
    let currentAccount = appState.getAccount(account.id);
    expect(currentAccount?.balance).toBe(5500); // 5000 + 1000 - 500

    // 4. Simular edición de balance inicial (ajuste manual)
    const newInitialBalance = 6000;
    const oldInitialBalance = 5000;
    const balanceAdjustment = newInitialBalance - oldInitialBalance;

    // 5. Aplicar ajuste
    appState.updateAccountBalance(account.id, balanceAdjustment);

    // 6. Verificar nuevo balance
    currentAccount = appState.getAccount(account.id);
    expect(currentAccount?.balance).toBe(6500); // 5500 + 1000

    // 7. Validar que el ajuste fue correcto
    const transactions = appState.getTransactionsByAccount(account.id);
    const transactionDelta = transactions.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);

    expect(currentAccount?.balance).toBe(newInitialBalance + transactionDelta);
  });

  it('should support different account types with different behaviors', async () => {
    // 1. Crear cuenta bancaria
    const bankAccount = appState.addAccount({
      name: 'Banco',
      type: 'bank',
      balance: 1000,
      currency: 'USD',
      userId: testFixtures.user.id,
    });

    // 2. Crear cuenta de efectivo
    const cashAccount = appState.addAccount({
      name: 'Efectivo',
      type: 'cash',
      balance: 200,
      currency: 'USD',
      userId: testFixtures.user.id,
    });

    // 3. Crear cuenta de ahorros
    const savingsAccount = appState.addAccount({
      name: 'Ahorros',
      type: 'savings',
      balance: 5000,
      currency: 'USD',
      userId: testFixtures.user.id,
    });

    // 4. Verificar que todos los tipos fueron creados
    const allAccounts = appState.getAllAccounts();
    expect(allAccounts.length).toBe(3);

    const accountTypes = allAccounts.map((a) => a.type);
    expect(accountTypes).toContain('bank');
    expect(accountTypes).toContain('cash');
    expect(accountTypes).toContain('savings');

    // 5. Crear transacciones en cada tipo de cuenta
    appState.createExpenseTransaction({
      amount: 50,
      accountId: bankAccount.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Compra con tarjeta',
      userId: testFixtures.user.id,
    });

    appState.createExpenseTransaction({
      amount: 20,
      accountId: cashAccount.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Compra en efectivo',
      userId: testFixtures.user.id,
    });

    // No se crea gasto en ahorros (típicamente solo recibe transferencias)

    // 6. Verificar balances independientes
    expect(appState.getAccount(bankAccount.id)?.balance).toBe(950);
    expect(appState.getAccount(cashAccount.id)?.balance).toBe(180);
    expect(appState.getAccount(savingsAccount.id)?.balance).toBe(5000);
  });
});

describe('Multiple Accounts and Wealth Calculation Flow - Integration', () => {
  beforeEach(() => {
    appState.reset();

    appState.addCategory(testFixtures.categories.salary);
    appState.addCategory(testFixtures.categories.food);
    appState.addCategory(testFixtures.categories.transfer);
  });

  it('should manage multiple accounts and calculate total wealth', async () => {
    // 1. Crear múltiples cuentas
    const checking = appState.addAccount({
      name: 'Cuenta Corriente',
      type: 'bank',
      balance: 1000,
      currency: 'USD',
      userId: testFixtures.user.id,
    });

    const savings = appState.addAccount({
      name: 'Ahorros',
      type: 'savings',
      balance: 5000,
      currency: 'USD',
      userId: testFixtures.user.id,
    });

    const cash = appState.addAccount({
      name: 'Efectivo',
      type: 'cash',
      balance: 200,
      currency: 'USD',
      userId: testFixtures.user.id,
    });

    // 2. Calcular patrimonio inicial
    let totalWealth = appState.getTotalWealth();
    expect(totalWealth).toBe(6200); // 1000 + 5000 + 200

    // 3. Crear transacciones en diferentes cuentas
    appState.createIncomeTransaction({
      amount: 500,
      accountId: checking.id,
      categoryId: testFixtures.categories.salary.id,
      description: 'Ingreso en corriente',
      userId: testFixtures.user.id,
    });

    appState.createExpenseTransaction({
      amount: 100,
      accountId: cash.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Gasto en efectivo',
      userId: testFixtures.user.id,
    });

    // 4. Verificar balances individuales
    expect(appState.getAccount(checking.id)?.balance).toBe(1500);
    expect(appState.getAccount(savings.id)?.balance).toBe(5000);
    expect(appState.getAccount(cash.id)?.balance).toBe(100);

    // 5. Verificar patrimonio total actualizado
    totalWealth = appState.getTotalWealth();
    expect(totalWealth).toBe(6600); // 1500 + 5000 + 100

    // 6. Verificar que el cambio neto es correcto
    const netChange = 6600 - 6200;
    expect(netChange).toBe(400); // +500 ingreso - 100 gasto
  });

  it('should maintain wealth consistency during transfers', async () => {
    // 1. Crear dos cuentas
    const checking = appState.addAccount({
      name: 'Corriente',
      type: 'bank',
      balance: 2000,
      currency: 'USD',
      userId: testFixtures.user.id,
    });

    const savings = appState.addAccount({
      name: 'Ahorros',
      type: 'savings',
      balance: 3000,
      currency: 'USD',
      userId: testFixtures.user.id,
    });

    // 2. Calcular patrimonio inicial
    const initialWealth = appState.getTotalWealth();
    expect(initialWealth).toBe(5000); // 2000 + 3000

    // 3. Transferir de corriente a ahorros
    const transfer = appState.createTransferTransaction({
      amount: 500,
      fromAccountId: checking.id,
      toAccountId: savings.id,
      categoryId: testFixtures.categories.transfer.id,
      description: 'Ahorro mensual',
      userId: testFixtures.user.id,
    });

    expect(transfer.transactionOut).toBeDefined();
    expect(transfer.transactionIn).toBeDefined();

    // 4. Verificar balances después de transferencia
    expect(appState.getAccount(checking.id)?.balance).toBe(1500); // 2000 - 500
    expect(appState.getAccount(savings.id)?.balance).toBe(3500); // 3000 + 500

    // 5. CRUCIAL: Verificar que el patrimonio total NO CAMBIÓ
    const finalWealth = appState.getTotalWealth();
    expect(finalWealth).toBe(initialWealth);
    expect(finalWealth).toBe(5000);

    // 6. Realizar múltiples transferencias
    appState.createTransferTransaction({
      amount: 300,
      fromAccountId: savings.id,
      toAccountId: checking.id,
      categoryId: testFixtures.categories.transfer.id,
      description: 'Retirar de ahorros',
      userId: testFixtures.user.id,
    });

    // 7. Verificar balances después de segunda transferencia
    expect(appState.getAccount(checking.id)?.balance).toBe(1800); // 1500 + 300
    expect(appState.getAccount(savings.id)?.balance).toBe(3200); // 3500 - 300

    // 8. Verificar que el patrimonio total SIGUE SIN CAMBIAR
    expect(appState.getTotalWealth()).toBe(5000);
  });

  it('should track wealth changes only from income and expenses', async () => {
    // 1. Crear cuentas
    const account1 = appState.addAccount({
      ...testFixtures.accounts.checking,
      balance: 1000,
    });

    const account2 = appState.addAccount({
      ...testFixtures.accounts.savings,
      balance: 2000,
    });

    // 2. Patrimonio inicial
    expect(appState.getTotalWealth()).toBe(3000);

    // 3. Crear ingreso (debe aumentar patrimonio)
    appState.createIncomeTransaction({
      amount: 500,
      accountId: account1.id,
      categoryId: testFixtures.categories.salary.id,
      description: 'Ingreso',
      userId: testFixtures.user.id,
    });

    expect(appState.getTotalWealth()).toBe(3500); // +500

    // 4. Crear gasto (debe disminuir patrimonio)
    appState.createExpenseTransaction({
      amount: 200,
      accountId: account1.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Gasto',
      userId: testFixtures.user.id,
    });

    expect(appState.getTotalWealth()).toBe(3300); // -200

    // 5. Crear transferencia (NO debe cambiar patrimonio)
    appState.createTransferTransaction({
      amount: 400,
      fromAccountId: account1.id,
      toAccountId: account2.id,
      categoryId: testFixtures.categories.transfer.id,
      description: 'Transferencia',
      userId: testFixtures.user.id,
    });

    expect(appState.getTotalWealth()).toBe(3300); // Sin cambios

    // 6. Crear otro ingreso y gasto
    appState.createIncomeTransaction({
      amount: 1000,
      accountId: account2.id,
      categoryId: testFixtures.categories.salary.id,
      description: 'Ingreso',
      userId: testFixtures.user.id,
    });

    expect(appState.getTotalWealth()).toBe(4300); // +1000

    appState.createExpenseTransaction({
      amount: 300,
      accountId: account2.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Gasto',
      userId: testFixtures.user.id,
    });

    expect(appState.getTotalWealth()).toBe(4000); // -300

    // 7. Verificar cálculo final
    const allAccounts = appState.getAllAccounts();
    const calculatedWealth = allAccounts.reduce(
      (sum, acc) => sum + acc.balance,
      0
    );
    expect(calculatedWealth).toBe(4000);
  });
});

describe('Account Statistics and Reporting Flow - Integration', () => {
  beforeEach(() => {
    appState.reset();

    appState.addAccount(testFixtures.accounts.checking);
    appState.addAccount(testFixtures.accounts.savings);

    appState.addCategory(testFixtures.categories.salary);
    appState.addCategory(testFixtures.categories.food);
    appState.addCategory(testFixtures.categories.transport);
  });

  it('should generate account transaction statistics', async () => {
    // 1. Crear múltiples transacciones
    appState.createIncomeTransaction({
      amount: 1000,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.salary.id,
      description: 'Salario',
      userId: testFixtures.user.id,
    });

    appState.createExpenseTransaction({
      amount: 200,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Comida',
      userId: testFixtures.user.id,
    });

    appState.createExpenseTransaction({
      amount: 100,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.transport.id,
      description: 'Transporte',
      userId: testFixtures.user.id,
    });

    appState.createIncomeTransaction({
      amount: 500,
      accountId: testFixtures.accounts.savings.id,
      categoryId: testFixtures.categories.salary.id,
      description: 'Intereses',
      userId: testFixtures.user.id,
    });

    // 2. Obtener estadísticas generales
    const stats = appState.getStatistics();

    expect(stats.totalIncome).toBe(1500); // 1000 + 500
    expect(stats.totalExpense).toBe(300); // 200 + 100
    expect(stats.netBalance).toBe(1200); // 1500 - 300
    expect(stats.transactionCount).toBe(4);

    // 3. Verificar promedio de gastos
    expect(stats.averageExpense).toBe(150); // 300 / 2 transacciones de gasto

    // 4. Verificar estadísticas por categoría
    expect(stats.byCategory[testFixtures.categories.food.id].expense).toBe(200);
    expect(stats.byCategory[testFixtures.categories.transport.id].expense).toBe(100);
    expect(stats.byCategory[testFixtures.categories.salary.id].income).toBe(1500);

    // 5. Obtener transacciones por cuenta
    const checkingTxs = appState.getTransactionsByAccount(
      testFixtures.accounts.checking.id
    );
    const savingsTxs = appState.getTransactionsByAccount(
      testFixtures.accounts.savings.id
    );

    expect(checkingTxs.length).toBe(3);
    expect(savingsTxs.length).toBe(1);
  });

  it('should identify most active account', async () => {
    // 1. Crear muchas transacciones en cuenta 1
    for (let i = 0; i < 10; i++) {
      appState.createExpenseTransaction({
        amount: 10,
        accountId: testFixtures.accounts.checking.id,
        categoryId: testFixtures.categories.food.id,
        description: `Gasto ${i + 1}`,
        userId: testFixtures.user.id,
      });
    }

    // 2. Crear pocas transacciones en cuenta 2
    for (let i = 0; i < 3; i++) {
      appState.createIncomeTransaction({
        amount: 100,
        accountId: testFixtures.accounts.savings.id,
        categoryId: testFixtures.categories.salary.id,
        description: `Ingreso ${i + 1}`,
        userId: testFixtures.user.id,
      });
    }

    // 3. Contar transacciones por cuenta
    const checkingCount = appState.getTransactionsByAccount(
      testFixtures.accounts.checking.id
    ).length;
    const savingsCount = appState.getTransactionsByAccount(
      testFixtures.accounts.savings.id
    ).length;

    expect(checkingCount).toBe(10);
    expect(savingsCount).toBe(3);

    // 4. Identificar cuenta más activa
    const allAccounts = appState.getAllAccounts();
    const accountActivity = allAccounts.map((account) => ({
      account,
      transactionCount: appState.getTransactionsByAccount(account.id).length,
    }));

    const mostActive = accountActivity.reduce((prev, current) =>
      current.transactionCount > prev.transactionCount ? current : prev
    );

    expect(mostActive.account.id).toBe(testFixtures.accounts.checking.id);
    expect(mostActive.transactionCount).toBe(10);
  });

  it('should calculate account balance history correctly', async () => {
    // 1. Balance inicial
    const initialBalance = testFixtures.accounts.checking.balance;
    expect(initialBalance).toBe(1000);

    const balanceHistory = [initialBalance];

    // 2. Crear transacciones y registrar balances
    appState.createIncomeTransaction({
      amount: 500,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.salary.id,
      description: 'Ingreso 1',
      userId: testFixtures.user.id,
    });

    balanceHistory.push(appState.getAccount(testFixtures.accounts.checking.id)!.balance);

    appState.createExpenseTransaction({
      amount: 200,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Gasto 1',
      userId: testFixtures.user.id,
    });

    balanceHistory.push(appState.getAccount(testFixtures.accounts.checking.id)!.balance);

    appState.createExpenseTransaction({
      amount: 100,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Gasto 2',
      userId: testFixtures.user.id,
    });

    balanceHistory.push(appState.getAccount(testFixtures.accounts.checking.id)!.balance);

    // 3. Verificar progresión de balances
    expect(balanceHistory).toEqual([
      1000,  // Inicial
      1500,  // +500
      1300,  // -200
      1200,  // -100
    ]);

    // 4. Verificar balance final
    const finalBalance = appState.getAccount(testFixtures.accounts.checking.id)?.balance;
    expect(finalBalance).toBe(1200);

    // 5. Verificar que coincide con el último del historial
    expect(finalBalance).toBe(balanceHistory[balanceHistory.length - 1]);
  });
});
