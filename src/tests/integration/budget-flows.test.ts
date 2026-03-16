/**
 * INTEGRATION TESTS - BUDGET FLOWS
 * 
 * Tests de integración para flujos completos de presupuestos.
 * Valida la creación, tracking, alertas y gestión de presupuestos.
 * 
 * Cobertura:
 * - Crear presupuestos mensuales/anuales
 * - Tracking automático de gastos
 * - Generación de alertas al exceder límites
 * - Múltiples presupuestos simultáneos
 * - Cálculo de porcentajes y progreso
 * - Actualización con transacciones
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BudgetCreateSchema, BudgetConfigSchema } from '../../schemas/budget';
import { createTestAppState, testFixtures } from '../utils/integrationHelpers';

const appState = createTestAppState();

describe('Budget Creation and Tracking Flow - Integration', () => {
  beforeEach(() => {
    appState.reset();

    // Setup inicial: cuenta, categorías y usuario
    appState.addAccount(testFixtures.accounts.checking);
    appState.addCategory(testFixtures.categories.food);
    appState.addCategory(testFixtures.categories.transport);
  });

  it('should create monthly budget and track spending correctly', async () => {
    // 1. Crear presupuesto mensual para categoría "Comida"
    const budgetData = {
      categoryId: testFixtures.categories.food.id,
      amount: 500,
      period: 'monthly',
      alertThreshold: 90,
      userId: testFixtures.user.id,
    };

    // 2. Validar con schema
    const validationResult = BudgetCreateSchema.safeParse(budgetData);
    expect(validationResult.success).toBe(true);

    // 3. Crear presupuesto
    const budget = appState.addBudget(budgetData);
    expect(budget).toBeDefined();
    expect(budget.spent).toBe(0);
    expect(budget.amount).toBe(500);

    // 4. Crear primer gasto
    const expense1 = appState.createExpenseTransaction({
      amount: 150,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Supermercado',
      userId: testFixtures.user.id,
    });

    expect(expense1).toBeDefined();

    // 5. Verificar actualización de presupuesto
    const updatedBudget1 = appState.getBudgetByCategory(testFixtures.categories.food.id);
    expect(updatedBudget1?.spent).toBe(150);

    // 6. Verificar progreso
    const progress1 = appState.getBudgetProgress(budget.id);
    expect(progress1?.percentUsed).toBe(30); // 150/500 = 30%
    expect(progress1?.remaining).toBe(350);
    expect(progress1?.exceeded).toBe(false);

    // 7. Crear segundo gasto
    appState.createExpenseTransaction({
      amount: 200,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Restaurante',
      userId: testFixtures.user.id,
    });

    // 8. Verificar actualización acumulada
    const updatedBudget2 = appState.getBudgetByCategory(testFixtures.categories.food.id);
    expect(updatedBudget2?.spent).toBe(350); // 150 + 200

    // 9. Verificar nuevo progreso
    const progress2 = appState.getBudgetProgress(budget.id);
    expect(progress2?.percentUsed).toBe(70); // 350/500 = 70%
    expect(progress2?.remaining).toBe(150);

    // 10. Crear tercer gasto que alcanza límite
    appState.createExpenseTransaction({
      amount: 100,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Café',
      userId: testFixtures.user.id,
    });

    // 11. Verificar estado final
    const finalBudget = appState.getBudgetByCategory(testFixtures.categories.food.id);
    expect(finalBudget?.spent).toBe(450); // 350 + 100

    const finalProgress = appState.getBudgetProgress(budget.id);
    expect(finalProgress?.percentUsed).toBe(90); // 450/500 = 90%
    expect(finalProgress?.remaining).toBe(50);
    expect(finalProgress?.exceeded).toBe(false);

    // 12. Verificar que NO excedió el presupuesto
    expect(finalBudget?.spent).toBeLessThan(finalBudget?.amount);
  });

  it('should trigger alert when spending reaches threshold', async () => {
    // 1. Crear presupuesto con threshold bajo
    const budget = appState.addBudget({
      categoryId: testFixtures.categories.food.id,
      amount: 300,
      spent: 0,
      period: 'monthly',
      alertThreshold: 80, // Alerta al 80%
      userId: testFixtures.user.id,
    });

    // 2. Crear gasto que NO alcanza threshold (70%)
    appState.createExpenseTransaction({
      amount: 210, // 210/300 = 70%
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Compra 1',
      userId: testFixtures.user.id,
    });

    // 3. Verificar que NO se generó alerta aún
    let alerts = appState.getAlerts();
    expect(alerts.length).toBe(0);

    let budgetState = appState.getBudgetByCategory(testFixtures.categories.food.id);
    let percentUsed = (budgetState.spent / budgetState.amount) * 100;
    expect(percentUsed).toBe(70);
    expect(percentUsed).toBeLessThan(budget.alertThreshold);

    // 4. Crear gasto que SÍ alcanza threshold (85%)
    appState.createExpenseTransaction({
      amount: 45, // Total: 255/300 = 85%
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Compra 2',
      userId: testFixtures.user.id,
    });

    // 5. Verificar que SÍ se generó alerta
    alerts = appState.getAlerts();
    expect(alerts.length).toBe(1);
    expect(alerts[0].type).toBe('budget_alert');
    expect(alerts[0].severity).toBe('warning');

    // 6. Verificar contenido de alerta
    budgetState = appState.getBudgetByCategory(testFixtures.categories.food.id);
    percentUsed = (budgetState.spent / budgetState.amount) * 100;
    expect(percentUsed).toBe(85);
    expect(alerts[0].message).toContain('85%');
  });

  it('should generate critical alert when budget is exceeded', async () => {
    // 1. Crear presupuesto
    const budget = appState.addBudget({
      categoryId: testFixtures.categories.food.id,
      amount: 200,
      spent: 0,
      period: 'monthly',
      alertThreshold: 90,
      userId: testFixtures.user.id,
    });

    // 2. Limpiar alertas previas
    appState.clearAlerts();

    // 3. Crear gasto que EXCEDE el presupuesto
    appState.createExpenseTransaction({
      amount: 250, // 250/200 = 125% - EXCEDIDO
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Gasto que excede presupuesto',
      userId: testFixtures.user.id,
    });

    // 4. Verificar que se excedió el presupuesto
    const budgetState = appState.getBudgetByCategory(testFixtures.categories.food.id);
    expect(budgetState.spent).toBe(250);
    expect(budgetState.spent).toBeGreaterThan(budgetState.amount);

    const progress = appState.getBudgetProgress(budget.id);
    expect(progress.exceeded).toBe(true);
    expect(progress.percentUsed).toBe(125);
    expect(progress.remaining).toBe(-50); // Negativo

    // 5. Verificar alerta CRÍTICA generada
    const alerts = appState.getAlerts();
    expect(alerts.length).toBe(1);
    expect(alerts[0].severity).toBe('critical');
    expect(alerts[0].type).toBe('budget_alert');

    // 6. Verificar mensaje de exceso
    const excess = budgetState.spent - budgetState.amount;
    expect(excess).toBe(50);
    expect(alerts[0].message).toContain('excedido');
    expect(alerts[0].message).toContain('$50');
  });
});

describe('Multiple Budgets Management Flow - Integration', () => {
  beforeEach(() => {
    appState.reset();

    // Setup: cuenta y categorías múltiples
    appState.addAccount(testFixtures.accounts.checking);
    appState.addCategory(testFixtures.categories.food);
    appState.addCategory(testFixtures.categories.transport);
    
    // Agregar categoría adicional para tests
    appState.addCategory({
      id: 'cat-entertainment',
      name: 'Entretenimiento',
      type: 'expense',
      icon: '🎬',
      userId: testFixtures.user.id,
    });
  });

  it('should manage multiple budgets independently', async () => {
    // 1. Crear 3 presupuestos diferentes
    const budgetFood = appState.addBudget({
      categoryId: testFixtures.categories.food.id,
      amount: 500,
      period: 'monthly',
      userId: testFixtures.user.id,
    });

    const budgetTransport = appState.addBudget({
      categoryId: testFixtures.categories.transport.id,
      amount: 200,
      period: 'monthly',
      userId: testFixtures.user.id,
    });

    const budgetEntertainment = appState.addBudget({
      categoryId: 'cat-entertainment',
      amount: 150,
      period: 'monthly',
      userId: testFixtures.user.id,
    });

    expect(appState.getAllBudgets().length).toBe(3);

    // 2. Crear gastos en cada categoría
    appState.createExpenseTransaction({
      amount: 200,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Comida',
      userId: testFixtures.user.id,
    });

    appState.createExpenseTransaction({
      amount: 50,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.transport.id,
      description: 'Gasolina',
      userId: testFixtures.user.id,
    });

    appState.createExpenseTransaction({
      amount: 100,
      accountId: testFixtures.accounts.checking.id,
      categoryId: 'cat-entertainment',
      description: 'Cine',
      userId: testFixtures.user.id,
    });

    // 3. Verificar actualización independiente de cada presupuesto
    const foodBudget = appState.getBudgetByCategory(testFixtures.categories.food.id);
    const transportBudget = appState.getBudgetByCategory(testFixtures.categories.transport.id);
    const entertainmentBudget = appState.getBudgetByCategory('cat-entertainment');

    expect(foodBudget.spent).toBe(200);
    expect(transportBudget.spent).toBe(50);
    expect(entertainmentBudget.spent).toBe(100);

    // 4. Verificar porcentajes independientes
    const foodProgress = appState.getBudgetProgress(budgetFood.id);
    const transportProgress = appState.getBudgetProgress(budgetTransport.id);
    const entertainmentProgress = appState.getBudgetProgress(budgetEntertainment.id);

    expect(foodProgress.percentUsed).toBe(40); // 200/500
    expect(transportProgress.percentUsed).toBe(25); // 50/200
    expect(entertainmentProgress.percentUsed).toBeCloseTo(66.67, 1); // 100/150

    // 5. Crear más gastos solo en una categoría
    appState.createExpenseTransaction({
      amount: 100,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Más comida',
      userId: testFixtures.user.id,
    });

    // 6. Verificar que solo se actualizó ese presupuesto
    const updatedFoodBudget = appState.getBudgetByCategory(testFixtures.categories.food.id);
    const unchangedTransportBudget = appState.getBudgetByCategory(testFixtures.categories.transport.id);

    expect(updatedFoodBudget.spent).toBe(300); // 200 + 100
    expect(unchangedTransportBudget.spent).toBe(50); // Sin cambios

    // 7. Verificar totales
    const allBudgets = appState.getAllBudgets();
    const totalBudgeted = allBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = allBudgets.reduce((sum, b) => sum + b.spent, 0);

    expect(totalBudgeted).toBe(850); // 500 + 200 + 150
    expect(totalSpent).toBe(450); // 300 + 50 + 100
  });

  it('should calculate overall budget statistics correctly', async () => {
    // 1. Crear múltiples presupuestos
    appState.addBudget({
      categoryId: testFixtures.categories.food.id,
      amount: 400,
      spent: 300,
      period: 'monthly',
      userId: testFixtures.user.id,
    });

    appState.addBudget({
      categoryId: testFixtures.categories.transport.id,
      amount: 200,
      spent: 150,
      period: 'monthly',
      userId: testFixtures.user.id,
    });

    appState.addBudget({
      categoryId: 'cat-entertainment',
      amount: 100,
      spent: 50,
      period: 'monthly',
      userId: testFixtures.user.id,
    });

    // 2. Obtener todos los presupuestos
    const allBudgets = appState.getAllBudgets();
    expect(allBudgets.length).toBe(3);

    // 3. Calcular estadísticas generales
    const totalBudgeted = allBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = allBudgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = allBudgets.reduce((sum, b) => sum + (b.amount - b.spent), 0);

    expect(totalBudgeted).toBe(700); // 400 + 200 + 100
    expect(totalSpent).toBe(500); // 300 + 150 + 50
    expect(totalRemaining).toBe(200); // 100 + 50 + 50

    // 4. Calcular porcentaje general usado
    const overallPercentUsed = (totalSpent / totalBudgeted) * 100;
    expect(overallPercentUsed).toBeCloseTo(71.43, 1);

    // 5. Identificar presupuesto más usado
    const budgetsWithProgress = allBudgets.map((b) => ({
      ...b,
      percentUsed: (b.spent / b.amount) * 100,
    }));

    const mostUsedBudget = budgetsWithProgress.reduce((prev, current) =>
      current.percentUsed > prev.percentUsed ? current : prev
    );

    expect(mostUsedBudget.categoryId).toBe(testFixtures.categories.food.id);
    expect(mostUsedBudget.percentUsed).toBe(75); // 300/400

    // 6. Identificar presupuesto con más margen
    const leastUsedBudget = budgetsWithProgress.reduce((prev, current) =>
      current.percentUsed < prev.percentUsed ? current : prev
    );

    expect(leastUsedBudget.categoryId).toBe('cat-entertainment');
    expect(leastUsedBudget.percentUsed).toBe(50); // 50/100
  });

  it('should handle budget alerts across multiple budgets', async () => {
    // 1. Crear presupuestos con diferentes thresholds
    const budget1 = appState.addBudget({
      categoryId: testFixtures.categories.food.id,
      amount: 300,
      spent: 0,
      period: 'monthly',
      alertThreshold: 80,
      userId: testFixtures.user.id,
    });

    const budget2 = appState.addBudget({
      categoryId: testFixtures.categories.transport.id,
      amount: 100,
      spent: 0,
      period: 'monthly',
      alertThreshold: 90,
      userId: testFixtures.user.id,
    });

    // 2. Limpiar alertas
    appState.clearAlerts();

    // 3. Crear gasto que NO alcanza threshold en budget1 (70%)
    appState.createExpenseTransaction({
      amount: 210, // 210/300 = 70%
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Comida',
      userId: testFixtures.user.id,
    });

    expect(appState.getAlerts().length).toBe(0);

    // 4. Crear gasto que SÍ alcanza threshold en budget2 (95%)
    appState.createExpenseTransaction({
      amount: 95, // 95/100 = 95%
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.transport.id,
      description: 'Transporte',
      userId: testFixtures.user.id,
    });

    // 5. Verificar que solo se generó alerta para budget2
    let alerts = appState.getAlerts();
    expect(alerts.length).toBe(1);
    expect(alerts[0].budgetId).toBe(budget2.id);

    // 6. Crear gasto que alcanza threshold en budget1 (85%)
    appState.createExpenseTransaction({
      amount: 45, // Total: 255/300 = 85%
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Más comida',
      userId: testFixtures.user.id,
    });

    // 7. Verificar que ahora hay 2 alertas
    alerts = appState.getAlerts();
    expect(alerts.length).toBe(2);

    // 8. Verificar que son de diferentes presupuestos
    const budgetIds = alerts.map((a) => a.budgetId);
    expect(budgetIds).toContain(budget1.id);
    expect(budgetIds).toContain(budget2.id);

    // 9. Crear gasto que excede budget2 (110%)
    appState.createExpenseTransaction({
      amount: 15, // Total: 110/100 = 110%
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.transport.id,
      description: 'Más transporte',
      userId: testFixtures.user.id,
    });

    // 10. Verificar alerta crítica adicional
    alerts = appState.getAlerts();
    expect(alerts.length).toBe(3);

    const criticalAlert = alerts.find((a) => a.severity === 'critical');
    expect(criticalAlert).toBeDefined();
    expect(criticalAlert?.budgetId).toBe(budget2.id);
  });
});

describe('Budget Configuration and Updates Flow - Integration', () => {
  beforeEach(() => {
    appState.reset();

    appState.addAccount(testFixtures.accounts.checking);
    appState.addCategory(testFixtures.categories.food);
  });

  it('should update budget configuration and recalculate alerts', async () => {
    // 1. Crear presupuesto inicial
    const budget = appState.addBudget({
      id: 'budget-test',
      categoryId: testFixtures.categories.food.id,
      amount: 300,
      spent: 240, // 80% usado
      period: 'monthly',
      alertThreshold: 90, // Alerta al 90%
      userId: testFixtures.user.id,
    });

    // 2. Verificar estado inicial (sin alerta - 80%)
    let progress = appState.getBudgetProgress(budget.id);
    expect(progress.percentUsed).toBe(80);
    expect(appState.shouldTriggerBudgetAlert(budget)).toBe(false);

    // 3. Actualizar threshold a 70%
    const updatedBudget = appState.getBudget(budget.id);
    updatedBudget.alertThreshold = 70;

    // 4. Verificar que ahora SÍ debe generar alerta (80% > 70%)
    expect(appState.shouldTriggerBudgetAlert(updatedBudget)).toBe(true);

    // 5. Actualizar monto del presupuesto (aumentar)
    updatedBudget.amount = 400; // 240/400 = 60%

    // 6. Verificar nuevo porcentaje
    progress = appState.getBudgetProgress(budget.id);
    expect(progress.percentUsed).toBe(60);
    expect(appState.shouldTriggerBudgetAlert(updatedBudget)).toBe(false);

    // 7. Reducir monto del presupuesto
    updatedBudget.amount = 200; // 240/200 = 120% - EXCEDIDO

    // 8. Verificar exceso
    progress = appState.getBudgetProgress(budget.id);
    expect(progress.percentUsed).toBe(120);
    expect(progress.exceeded).toBe(true);
    expect(appState.shouldTriggerBudgetAlert(updatedBudget)).toBe(true);
  });

  it('should handle budget period changes correctly', async () => {
    // 1. Crear presupuesto mensual
    const budget = appState.addBudget({
      categoryId: testFixtures.categories.food.id,
      amount: 500,
      spent: 200,
      period: 'monthly',
      userId: testFixtures.user.id,
    });

    // 2. Validar configuración mensual
    const monthlyConfig = {
      budgetId: budget.id,
      period: 'monthly' as const,
      amount: 500,
    };

    const monthlyValidation = BudgetConfigSchema.safeParse(monthlyConfig);
    expect(monthlyValidation.success).toBe(true);

    // 3. Cambiar a presupuesto anual
    const updatedBudget = appState.getBudget(budget.id);
    updatedBudget.period = 'annual';
    updatedBudget.amount = 6000; // 500 * 12

    // 4. Validar configuración anual
    const annualConfig = {
      budgetId: budget.id,
      period: 'annual' as const,
      amount: 6000,
    };

    const annualValidation = BudgetConfigSchema.safeParse(annualConfig);
    expect(annualValidation.success).toBe(true);

    // 5. Verificar que el gasto acumulado se mantiene
    expect(updatedBudget.spent).toBe(200);

    // 6. Verificar nuevo porcentaje (200/6000)
    const progress = appState.getBudgetProgress(budget.id);
    expect(progress.percentUsed).toBeCloseTo(3.33, 1);
  });
});
