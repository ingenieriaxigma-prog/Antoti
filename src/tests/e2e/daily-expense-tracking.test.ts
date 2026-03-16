/**
 * E2E TESTS - DAILY EXPENSE TRACKING
 * 
 * Tests end-to-end para el flujo diario típico de un usuario activo.
 * Simula el uso diario de la app para registrar gastos e ingresos.
 * 
 * Cobertura:
 * - Login y sincronización automática
 * - Registro rápido de múltiples transacciones
 * - Actualización del dashboard en tiempo real
 * - Revisión de presupuestos
 * - Verificación de estadísticas
 * - Notificaciones y alertas
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestAppState, testFixtures } from '../utils/integrationHelpers';

const appState = createTestAppState();

// Mock de sistema de sincronización
const syncSystem = {
  lastSync: null as Date | null,
  isSyncing: false,
  syncStatus: 'idle' as 'idle' | 'syncing' | 'success' | 'error',
  pendingChanges: 0,
  
  sync: async function() {
    this.isSyncing = true;
    this.syncStatus = 'syncing';
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.isSyncing = false;
    this.syncStatus = 'success';
    this.lastSync = new Date();
    this.pendingChanges = 0;
    
    return { success: true, syncedAt: this.lastSync };
  },
  
  markPendingChange: function() {
    this.pendingChanges++;
  },
  
  reset: function() {
    this.lastSync = null;
    this.isSyncing = false;
    this.syncStatus = 'idle';
    this.pendingChanges = 0;
  }
};

// Mock de sistema de notificaciones
const notificationSystem = {
  notifications: [] as any[],
  
  send: function(notification: {
    type: 'budget_alert' | 'sync_success' | 'low_balance' | 'tip';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }) {
    this.notifications.push({
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    });
  },
  
  getUnread: function() {
    return this.notifications.filter(n => !n.read);
  },
  
  markAsRead: function(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
    }
  },
  
  clear: function() {
    this.notifications = [];
  }
};

// Mock de dashboard state
const dashboardState = {
  totalWealth: 0,
  totalIncome: 0,
  totalExpense: 0,
  monthlyBudgetProgress: 0,
  recentTransactions: [] as any[],
  alerts: [] as any[],
  
  refresh: function() {
    // Obtener datos actualizados
    this.totalWealth = appState.getTotalWealth();
    
    const stats = appState.getStatistics();
    this.totalIncome = stats.totalIncome;
    this.totalExpense = stats.totalExpense;
    
    // Calcular progreso de presupuestos
    const budgets = appState.getAllBudgets();
    if (budgets.length > 0) {
      const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
      const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
      this.monthlyBudgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    }
    
    // Obtener transacciones recientes (últimas 5)
    this.recentTransactions = appState.getAllTransactions()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    // Obtener alertas
    this.alerts = appState.getAlerts();
  },
  
  reset: function() {
    this.totalWealth = 0;
    this.totalIncome = 0;
    this.totalExpense = 0;
    this.monthlyBudgetProgress = 0;
    this.recentTransactions = [];
    this.alerts = [];
  }
};

describe('Daily Expense Tracking E2E Flow', () => {
  beforeEach(() => {
    appState.reset();
    syncSystem.reset();
    notificationSystem.clear();
    dashboardState.reset();
    
    // Setup: usuario con datos existentes
    appState.addAccount(testFixtures.accounts.checking);
    appState.addAccount(testFixtures.accounts.savings);
    appState.addCategory(testFixtures.categories.salary);
    appState.addCategory(testFixtures.categories.food);
    appState.addCategory(testFixtures.categories.transport);
    
    // Presupuesto mensual
    appState.addBudget(testFixtures.budgets.food);
    appState.addBudget(testFixtures.budgets.transport);
  });

  it('should complete daily expense tracking routine', async () => {
    // ==========================================
    // FASE 1: APERTURA DE APP Y SINCRONIZACIÓN
    // ==========================================
    
    // 1. Usuario abre la app
    expect(syncSystem.syncStatus).toBe('idle');
    expect(syncSystem.lastSync).toBeNull();
    
    // 2. App automáticamente sincroniza datos
    const syncResult = await syncSystem.sync();
    
    expect(syncResult.success).toBe(true);
    expect(syncSystem.syncStatus).toBe('success');
    expect(syncSystem.lastSync).toBeDefined();
    expect(syncSystem.isSyncing).toBe(false);
    
    // 3. Mostrar notificación de sincronización exitosa
    notificationSystem.send({
      type: 'sync_success',
      title: 'Sincronización completa',
      message: 'Tus datos están actualizados',
      priority: 'low',
    });
    
    expect(notificationSystem.notifications.length).toBe(1);
    
    // ==========================================
    // FASE 2: VERIFICAR DASHBOARD
    // ==========================================
    
    // 4. Dashboard carga datos actualizados
    dashboardState.refresh();
    
    expect(dashboardState.totalWealth).toBe(6200); // checking + savings
    expect(dashboardState.totalIncome).toBe(0);
    expect(dashboardState.totalExpense).toBe(0);
    
    // ==========================================
    // FASE 3: REGISTRAR GASTOS DEL DÍA
    // ==========================================
    
    // 5. Gasto 1: Desayuno - $8
    const breakfast = appState.createExpenseTransaction({
      amount: 8,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Desayuno - Café y pan',
      date: new Date().toISOString(),
      userId: testFixtures.user.id,
    });
    
    expect(breakfast).toBeDefined();
    syncSystem.markPendingChange();
    
    // 6. Dashboard se actualiza automáticamente
    dashboardState.refresh();
    expect(dashboardState.totalExpense).toBe(8);
    expect(dashboardState.recentTransactions.length).toBe(1);
    
    // 7. Gasto 2: Gasolina - $30
    const gas = appState.createExpenseTransaction({
      amount: 30,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.transport.id,
      description: 'Gasolina',
      date: new Date().toISOString(),
      userId: testFixtures.user.id,
    });
    
    expect(gas).toBeDefined();
    syncSystem.markPendingChange();
    dashboardState.refresh();
    
    // 8. Gasto 3: Almuerzo - $15
    appState.createExpenseTransaction({
      amount: 15,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Almuerzo',
      date: new Date().toISOString(),
      userId: testFixtures.user.id,
    });
    
    syncSystem.markPendingChange();
    dashboardState.refresh();
    
    // 9. Gasto 4: Estacionamiento - $5
    appState.createExpenseTransaction({
      amount: 5,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.transport.id,
      description: 'Estacionamiento',
      date: new Date().toISOString(),
      userId: testFixtures.user.id,
    });
    
    syncSystem.markPendingChange();
    dashboardState.refresh();
    
    // 10. Gasto 5: Cena - $20
    appState.createExpenseTransaction({
      amount: 20,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Cena',
      date: new Date().toISOString(),
      userId: testFixtures.user.id,
    });
    
    syncSystem.markPendingChange();
    
    // ==========================================
    // FASE 4: VERIFICAR ACTUALIZACIONES
    // ==========================================
    
    // 11. Actualizar dashboard final
    dashboardState.refresh();
    
    expect(appState.getAllTransactions().length).toBe(5);
    expect(dashboardState.totalExpense).toBe(78); // 8+30+15+5+20
    expect(dashboardState.recentTransactions.length).toBe(5);
    
    // 12. Verificar balance de cuenta actualizado
    const checkingAccount = appState.getAccount(testFixtures.accounts.checking.id);
    expect(checkingAccount?.balance).toBe(922); // 1000 - 78
    
    // 13. Verificar patrimonio total actualizado
    expect(dashboardState.totalWealth).toBe(5922); // 922 + 5000
    
    // ==========================================
    // FASE 5: REVISAR PRESUPUESTOS
    // ==========================================
    
    // 14. Verificar progreso de presupuesto de comida
    const foodBudget = appState.getBudgetByCategory(testFixtures.categories.food.id);
    expect(foodBudget?.spent).toBe(43); // 8 + 15 + 20
    
    const foodProgress = appState.getBudgetProgress(foodBudget.id);
    expect(foodProgress?.percentUsed).toBe(8.6); // 43/500 = 8.6%
    expect(foodProgress?.exceeded).toBe(false);
    
    // 15. Verificar progreso de presupuesto de transporte
    const transportBudget = appState.getBudgetByCategory(testFixtures.categories.transport.id);
    expect(transportBudget?.spent).toBe(35); // 30 + 5
    
    const transportProgress = appState.getBudgetProgress(transportBudget.id);
    expect(transportProgress?.percentUsed).toBe(17.5); // 35/200 = 17.5%
    
    // 16. Verificar progreso general de presupuestos
    expect(dashboardState.monthlyBudgetProgress).toBeCloseTo(11.14, 1); // 78/700
    
    // ==========================================
    // FASE 6: SINCRONIZACIÓN FINAL
    // ==========================================
    
    // 17. Usuario cierra sesión en la app
    expect(syncSystem.pendingChanges).toBe(5);
    
    // 18. Sincronizar cambios pendientes
    await syncSystem.sync();
    
    expect(syncSystem.syncStatus).toBe('success');
    expect(syncSystem.pendingChanges).toBe(0);
    
    // 19. Confirmar que todos los datos están guardados
    notificationSystem.send({
      type: 'sync_success',
      title: 'Datos guardados',
      message: '5 transacciones sincronizadas',
      priority: 'low',
    });
    
    expect(notificationSystem.notifications.length).toBe(2);
  });

  it('should handle multiple quick transactions efficiently', async () => {
    // Simular usuario registrando muchas transacciones rápidamente
    
    // 1. Abrir app
    await syncSystem.sync();
    dashboardState.refresh();
    
    const initialBalance = appState.getAccount(testFixtures.accounts.checking.id)?.balance;
    
    // 2. Registrar 10 transacciones pequeñas rápidamente
    const quickTransactions = [
      { amount: 5, description: 'Café' },
      { amount: 3, description: 'Propina' },
      { amount: 12, description: 'Snack' },
      { amount: 8, description: 'Agua' },
      { amount: 15, description: 'Comida rápida' },
      { amount: 6, description: 'Postre' },
      { amount: 4, description: 'Estacionamiento' },
      { amount: 10, description: 'Bebida' },
      { amount: 7, description: 'Revista' },
      { amount: 9, description: 'Dulces' },
    ];
    
    quickTransactions.forEach(tx => {
      appState.createExpenseTransaction({
        amount: tx.amount,
        accountId: testFixtures.accounts.checking.id,
        categoryId: testFixtures.categories.food.id,
        description: tx.description,
        userId: testFixtures.user.id,
      });
      syncSystem.markPendingChange();
    });
    
    // 3. Verificar todas las transacciones se crearon
    expect(appState.getAllTransactions().length).toBe(10);
    
    // 4. Calcular total gastado
    const totalSpent = quickTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    expect(totalSpent).toBe(79);
    
    // 5. Verificar balance actualizado
    const currentAccount = appState.getAccount(testFixtures.accounts.checking.id);
    expect(currentAccount?.balance).toBe(initialBalance! - totalSpent);
    
    // 6. Dashboard muestra últimas 5 transacciones solamente
    dashboardState.refresh();
    expect(dashboardState.recentTransactions.length).toBe(5);
    
    // 7. Todas las transacciones están pendientes de sync
    expect(syncSystem.pendingChanges).toBe(10);
    
    // 8. Sincronización batch
    await syncSystem.sync();
    expect(syncSystem.pendingChanges).toBe(0);
  });

  it('should send alert when approaching budget limit', async () => {
    // 1. Setup inicial
    await syncSystem.sync();
    notificationSystem.clear();
    
    // 2. Crear gastos que se acerquen al límite del presupuesto
    // Presupuesto de comida: $500, threshold: 90%
    
    // Gastar hasta 85% (425)
    appState.createExpenseTransaction({
      amount: 425,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Compra grande de supermercado',
      userId: testFixtures.user.id,
    });
    
    dashboardState.refresh();
    
    // 3. Verificar que todavía no hay alerta (85% < 90%)
    expect(notificationSystem.getUnread().length).toBe(0);
    
    const foodBudget = appState.getBudgetByCategory(testFixtures.categories.food.id);
    const progress = appState.getBudgetProgress(foodBudget.id);
    expect(progress.percentUsed).toBe(85);
    
    // 4. Gastar más para alcanzar 92%
    appState.createExpenseTransaction({
      amount: 35,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Restaurante',
      userId: testFixtures.user.id,
    });
    
    // 5. Ahora debe generar alerta (92% > 90%)
    dashboardState.refresh();
    
    const alerts = appState.getAlerts();
    expect(alerts.length).toBe(1);
    expect(alerts[0].severity).toBe('warning');
    
    // 6. Enviar notificación al usuario
    notificationSystem.send({
      type: 'budget_alert',
      title: '⚠️ Presupuesto casi agotado',
      message: 'Has usado el 92% de tu presupuesto de Comida',
      priority: 'medium',
    });
    
    expect(notificationSystem.getUnread().length).toBe(1);
    
    // 7. Usuario ve la notificación
    const unreadNotifs = notificationSystem.getUnread();
    expect(unreadNotifs[0].title).toContain('Presupuesto');
    expect(unreadNotifs[0].priority).toBe('medium');
  });

  it('should show statistics after daily transactions', async () => {
    // 1. Crear múltiples transacciones de diferentes categorías
    appState.createExpenseTransaction({
      amount: 50,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Supermercado',
      userId: testFixtures.user.id,
    });
    
    appState.createExpenseTransaction({
      amount: 30,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.transport.id,
      description: 'Uber',
      userId: testFixtures.user.id,
    });
    
    appState.createIncomeTransaction({
      amount: 100,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.salary.id,
      description: 'Freelance',
      userId: testFixtures.user.id,
    });
    
    // 2. Usuario navega a estadísticas
    const stats = appState.getStatistics();
    
    // 3. Verificar estadísticas totales
    expect(stats.totalIncome).toBe(100);
    expect(stats.totalExpense).toBe(80); // 50 + 30
    expect(stats.netBalance).toBe(20); // 100 - 80
    expect(stats.transactionCount).toBe(3);
    
    // 4. Verificar estadísticas por categoría
    expect(stats.byCategory[testFixtures.categories.food.id].expense).toBe(50);
    expect(stats.byCategory[testFixtures.categories.transport.id].expense).toBe(30);
    expect(stats.byCategory[testFixtures.categories.salary.id].income).toBe(100);
    
    // 5. Verificar promedio de gastos
    expect(stats.averageExpense).toBe(40); // 80 / 2 transacciones de gasto
    
    // 6. Dashboard refleja estas estadísticas
    dashboardState.refresh();
    expect(dashboardState.totalIncome).toBe(100);
    expect(dashboardState.totalExpense).toBe(80);
  });

  it('should handle offline mode and queue transactions', async () => {
    // 1. Usuario está online inicialmente
    await syncSystem.sync();
    expect(syncSystem.syncStatus).toBe('success');
    
    // 2. Usuario pierde conexión (modo offline)
    const offlineMode = {
      isOnline: false,
      queuedTransactions: [] as any[],
      
      addToQueue: function(transaction: any) {
        this.queuedTransactions.push(transaction);
      },
      
      syncQueue: async function() {
        if (this.isOnline) {
          // Sincronizar todas las transacciones en cola
          this.queuedTransactions.forEach(tx => {
            syncSystem.markPendingChange();
          });
          this.queuedTransactions = [];
          return await syncSystem.sync();
        }
        return { success: false, error: 'OFFLINE' };
      }
    };
    
    // 3. Crear transacciones mientras está offline
    const offlineTx1 = appState.createExpenseTransaction({
      amount: 25,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Offline transaction 1',
      userId: testFixtures.user.id,
    });
    
    offlineMode.addToQueue(offlineTx1);
    
    const offlineTx2 = appState.createExpenseTransaction({
      amount: 15,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Offline transaction 2',
      userId: testFixtures.user.id,
    });
    
    offlineMode.addToQueue(offlineTx2);
    
    // 4. Verificar que están en cola
    expect(offlineMode.queuedTransactions.length).toBe(2);
    expect(appState.getAllTransactions().length).toBe(2);
    
    // 5. Intentar sincronizar mientras está offline
    const offlineResult = await offlineMode.syncQueue();
    expect(offlineResult.success).toBe(false);
    expect(offlineResult.error).toBe('OFFLINE');
    
    // 6. Usuario recupera conexión
    offlineMode.isOnline = true;
    
    // 7. Sincronizar cola de transacciones
    const onlineResult = await offlineMode.syncQueue();
    expect(onlineResult.success).toBe(true);
    expect(offlineMode.queuedTransactions.length).toBe(0);
    expect(syncSystem.pendingChanges).toBe(0);
    
    // 8. Notificar al usuario
    notificationSystem.send({
      type: 'sync_success',
      title: 'Sincronización completa',
      message: '2 transacciones sincronizadas',
      priority: 'low',
    });
    
    expect(notificationSystem.notifications.length).toBe(1);
  });
});
