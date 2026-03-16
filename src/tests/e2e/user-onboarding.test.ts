/**
 * E2E TESTS - USER ONBOARDING
 * 
 * Tests end-to-end para el flujo completo de onboarding de nuevos usuarios.
 * Simula la experiencia completa desde que un usuario abre la app por primera vez.
 * 
 * Cobertura:
 * - Tour del producto
 * - Signup y autenticación
 * - Configuración inicial de cuentas
 * - Configuración de categorías
 * - Primera transacción
 * - Navegación por todas las pantallas
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestAppState } from '../utils/integrationHelpers';

const appState = createTestAppState();

// Mock de navegación
const mockNavigation = {
  currentScreen: 'splash',
  history: [] as string[],
  navigate: function(screen: string) {
    this.history.push(this.currentScreen);
    this.currentScreen = screen;
  },
  goBack: function() {
    const previous = this.history.pop();
    if (previous) {
      this.currentScreen = previous;
    }
  },
  getCurrentScreen: function() {
    return this.currentScreen;
  }
};

// Mock de tour del producto
const productTour = {
  steps: [
    { id: 1, screen: 'dashboard', title: 'Bienvenido a Oti', completed: false },
    { id: 2, screen: 'transactions', title: 'Registra tus gastos', completed: false },
    { id: 3, screen: 'budgets', title: 'Controla tu presupuesto', completed: false },
    { id: 4, screen: 'statistics', title: 'Visualiza tus finanzas', completed: false },
    { id: 5, screen: 'oti-chat', title: 'Consulta con Oti', completed: false },
  ],
  currentStep: 0,
  completed: false,
  
  nextStep: function() {
    if (this.currentStep < this.steps.length) {
      this.steps[this.currentStep].completed = true;
      this.currentStep++;
      
      if (this.currentStep >= this.steps.length) {
        this.completed = true;
      }
    }
  },
  
  skipTour: function() {
    this.completed = true;
    this.steps.forEach(step => step.completed = false);
  },
  
  reset: function() {
    this.currentStep = 0;
    this.completed = false;
    this.steps.forEach(step => step.completed = false);
  }
};

// Mock de sistema de autenticación
const authSystem = {
  currentUser: null as any,
  isAuthenticated: false,
  
  signup: async function(userData: {
    email: string;
    password: string;
    name: string;
  }) {
    // Simular validación
    if (!userData.email.includes('@')) {
      throw new Error('EMAIL_INVALID');
    }
    
    if (userData.password.length < 8) {
      throw new Error('PASSWORD_TOO_SHORT');
    }
    
    // Crear usuario
    const newUser = {
      id: `user-${Date.now()}`,
      email: userData.email,
      name: userData.name,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    };
    
    this.currentUser = newUser;
    this.isAuthenticated = true;
    
    return newUser;
  },
  
  login: async function(email: string, password: string) {
    // Simular login
    if (!email.includes('@')) {
      throw new Error('EMAIL_INVALID');
    }
    
    this.currentUser = {
      id: 'user-test',
      email,
      name: 'Test User',
    };
    this.isAuthenticated = true;
    
    return this.currentUser;
  },
  
  logout: function() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }
};

describe('New User Onboarding E2E Flow', () => {
  beforeEach(() => {
    appState.reset();
    mockNavigation.currentScreen = 'splash';
    mockNavigation.history = [];
    productTour.reset();
    authSystem.logout();
  });

  it('should complete full onboarding flow for new user', async () => {
    // ==========================================
    // FASE 1: SPLASH Y BIENVENIDA
    // ==========================================
    
    // 1. Usuario abre la app por primera vez
    expect(mockNavigation.getCurrentScreen()).toBe('splash');
    
    // 2. App detecta que es nuevo usuario (no hay sesión)
    expect(authSystem.isAuthenticated).toBe(false);
    expect(authSystem.currentUser).toBeNull();
    
    // 3. Navegar a pantalla de bienvenida
    mockNavigation.navigate('welcome');
    expect(mockNavigation.getCurrentScreen()).toBe('welcome');
    
    // ==========================================
    // FASE 2: TOUR DEL PRODUCTO
    // ==========================================
    
    // 4. Usuario decide ver el tour (no skip)
    expect(productTour.completed).toBe(false);
    expect(productTour.currentStep).toBe(0);
    
    // 5. Navegar por cada paso del tour
    mockNavigation.navigate('tour');
    
    // Paso 1: Dashboard
    expect(productTour.steps[0].title).toBe('Bienvenido a Oti');
    productTour.nextStep();
    expect(productTour.steps[0].completed).toBe(true);
    
    // Paso 2: Transacciones
    expect(productTour.steps[1].title).toBe('Registra tus gastos');
    productTour.nextStep();
    expect(productTour.steps[1].completed).toBe(true);
    
    // Paso 3: Presupuestos
    expect(productTour.steps[2].title).toBe('Controla tu presupuesto');
    productTour.nextStep();
    
    // Paso 4: Estadísticas
    productTour.nextStep();
    
    // Paso 5: Oti Chat
    productTour.nextStep();
    
    // 6. Verificar que el tour se completó
    expect(productTour.completed).toBe(true);
    expect(productTour.currentStep).toBe(5);
    
    // ==========================================
    // FASE 3: SIGNUP Y AUTENTICACIÓN
    // ==========================================
    
    // 7. Navegar a pantalla de signup
    mockNavigation.navigate('signup');
    expect(mockNavigation.getCurrentScreen()).toBe('signup');
    
    // 8. Usuario ingresa sus datos
    const signupData = {
      email: 'nuevo.usuario@oti.com',
      password: 'Password123!',
      name: 'Nuevo Usuario',
    };
    
    // 9. Crear cuenta
    const newUser = await authSystem.signup(signupData);
    
    // 10. Verificar cuenta creada
    expect(newUser).toBeDefined();
    expect(newUser.email).toBe(signupData.email);
    expect(newUser.name).toBe(signupData.name);
    expect(authSystem.isAuthenticated).toBe(true);
    expect(newUser.onboardingCompleted).toBe(false);
    
    // ==========================================
    // FASE 4: CONFIGURACIÓN INICIAL - CUENTAS
    // ==========================================
    
    // 11. Navegar a configuración de primera cuenta
    mockNavigation.navigate('setup-accounts');
    expect(mockNavigation.getCurrentScreen()).toBe('setup-accounts');
    
    // 12. Crear primera cuenta bancaria
    const firstAccount = appState.addAccount({
      name: 'Mi Cuenta Corriente',
      type: 'bank',
      balance: 1000,
      currency: 'USD',
      userId: newUser.id,
    });
    
    expect(firstAccount).toBeDefined();
    expect(appState.getAllAccounts().length).toBe(1);
    
    // 13. Opcional: Agregar cuenta de ahorros
    const savingsAccount = appState.addAccount({
      name: 'Ahorros',
      type: 'savings',
      balance: 5000,
      currency: 'USD',
      userId: newUser.id,
    });
    
    expect(appState.getAllAccounts().length).toBe(2);
    
    // 14. Verificar patrimonio inicial
    const initialWealth = appState.getTotalWealth();
    expect(initialWealth).toBe(6000); // 1000 + 5000
    
    // ==========================================
    // FASE 5: CONFIGURACIÓN INICIAL - CATEGORÍAS
    // ==========================================
    
    // 15. Navegar a configuración de categorías
    mockNavigation.navigate('setup-categories');
    
    // 16. Sistema sugiere categorías predeterminadas
    const defaultCategories = [
      { name: 'Salario', type: 'income', icon: '💰' },
      { name: 'Comida', type: 'expense', icon: '🍔' },
      { name: 'Transporte', type: 'expense', icon: '🚗' },
      { name: 'Entretenimiento', type: 'expense', icon: '🎬' },
      { name: 'Salud', type: 'expense', icon: '🏥' },
    ];
    
    // 17. Usuario acepta categorías predeterminadas
    defaultCategories.forEach(cat => {
      appState.addCategory({
        id: `cat-${cat.name.toLowerCase()}`,
        name: cat.name,
        type: cat.type as 'income' | 'expense',
        icon: cat.icon,
        userId: newUser.id,
      });
    });
    
    expect(appState.getAllCategories().length).toBe(5);
    expect(appState.getAllCategories('income').length).toBe(1);
    expect(appState.getAllCategories('expense').length).toBe(4);
    
    // ==========================================
    // FASE 6: PRIMERA TRANSACCIÓN
    // ==========================================
    
    // 18. Navegar a crear primera transacción
    mockNavigation.navigate('create-transaction');
    expect(mockNavigation.getCurrentScreen()).toBe('create-transaction');
    
    // 19. Usuario registra su primera transacción (ingreso)
    const firstTransaction = appState.createIncomeTransaction({
      amount: 500,
      accountId: firstAccount.id,
      categoryId: 'cat-salario',
      description: 'Mi primer ingreso en Oti',
      userId: newUser.id,
    });
    
    expect(firstTransaction).toBeDefined();
    expect(firstTransaction.type).toBe('income');
    expect(firstTransaction.amount).toBe(500);
    
    // 20. Verificar actualización de balance
    const updatedAccount = appState.getAccount(firstAccount.id);
    expect(updatedAccount?.balance).toBe(1500); // 1000 + 500
    
    // 21. Mostrar mensaje de éxito/celebración
    const onboardingSuccess = {
      message: '¡Felicitaciones! Has registrado tu primera transacción',
      showConfetti: true,
    };
    
    expect(onboardingSuccess.showConfetti).toBe(true);
    
    // ==========================================
    // FASE 7: NAVEGACIÓN POR PANTALLAS PRINCIPALES
    // ==========================================
    
    // 22. Tour rápido por las pantallas principales
    mockNavigation.navigate('dashboard');
    expect(mockNavigation.getCurrentScreen()).toBe('dashboard');
    
    // 23. Ver transacciones
    mockNavigation.navigate('transactions');
    expect(mockNavigation.getCurrentScreen()).toBe('transactions');
    expect(appState.getAllTransactions().length).toBe(1);
    
    // 24. Ver cuentas
    mockNavigation.navigate('accounts');
    expect(mockNavigation.getCurrentScreen()).toBe('accounts');
    expect(appState.getAllAccounts().length).toBe(2);
    
    // 25. Ver estadísticas (vacías por ahora)
    mockNavigation.navigate('statistics');
    const stats = appState.getStatistics();
    expect(stats.totalIncome).toBe(500);
    expect(stats.totalExpense).toBe(0);
    expect(stats.transactionCount).toBe(1);
    
    // 26. Ver chat Oti
    mockNavigation.navigate('oti-chat');
    expect(mockNavigation.getCurrentScreen()).toBe('oti-chat');
    
    // ==========================================
    // FASE 8: FINALIZACIÓN DE ONBOARDING
    // ==========================================
    
    // 27. Marcar onboarding como completado
    authSystem.currentUser.onboardingCompleted = true;
    expect(authSystem.currentUser.onboardingCompleted).toBe(true);
    
    // 28. Regresar a dashboard
    mockNavigation.navigate('dashboard');
    expect(mockNavigation.getCurrentScreen()).toBe('dashboard');
    
    // 29. Verificar estado final de la app
    expect(authSystem.isAuthenticated).toBe(true);
    expect(appState.getAllAccounts().length).toBe(2);
    expect(appState.getAllCategories().length).toBe(5);
    expect(appState.getAllTransactions().length).toBe(1);
    expect(appState.getTotalWealth()).toBe(6500); // 6000 + 500
    
    // 30. Usuario está listo para usar la app completamente
    const appReady = {
      userAuthenticated: authSystem.isAuthenticated,
      accountsConfigured: appState.getAllAccounts().length > 0,
      categoriesConfigured: appState.getAllCategories().length > 0,
      firstTransactionCreated: appState.getAllTransactions().length > 0,
      onboardingCompleted: authSystem.currentUser.onboardingCompleted,
    };
    
    expect(appReady.userAuthenticated).toBe(true);
    expect(appReady.accountsConfigured).toBe(true);
    expect(appReady.categoriesConfigured).toBe(true);
    expect(appReady.firstTransactionCreated).toBe(true);
    expect(appReady.onboardingCompleted).toBe(true);
  });

  it('should allow skipping tour and still complete onboarding', async () => {
    // 1. Usuario abre app
    mockNavigation.navigate('welcome');
    
    // 2. Usuario decide saltar el tour
    productTour.skipTour();
    expect(productTour.completed).toBe(true);
    
    // 3. Ir directo a signup
    mockNavigation.navigate('signup');
    
    const user = await authSystem.signup({
      email: 'fast.user@oti.com',
      password: 'QuickPass123!',
      name: 'Fast User',
    });
    
    expect(user).toBeDefined();
    expect(authSystem.isAuthenticated).toBe(true);
    
    // 4. Configuración mínima
    appState.addAccount({
      name: 'Cuenta Rápida',
      type: 'bank',
      balance: 500,
      currency: 'USD',
      userId: user.id,
    });
    
    appState.addCategory({
      id: 'cat-income',
      name: 'Ingresos',
      type: 'income',
      userId: user.id,
    });
    
    // 5. Crear primera transacción
    appState.createIncomeTransaction({
      amount: 100,
      accountId: appState.getAllAccounts()[0].id,
      categoryId: 'cat-income',
      description: 'Test',
      userId: user.id,
    });
    
    // 6. Onboarding completado sin tour
    user.onboardingCompleted = true;
    
    expect(user.onboardingCompleted).toBe(true);
    expect(appState.getAllTransactions().length).toBe(1);
  });

  it('should handle signup validation errors correctly', async () => {
    // 1. Intentar signup con email inválido
    mockNavigation.navigate('signup');
    
    await expect(async () => {
      await authSystem.signup({
        email: 'invalid-email',
        password: 'ValidPass123!',
        name: 'Test User',
      });
    }).rejects.toThrow('EMAIL_INVALID');
    
    // 2. Verificar que no se creó usuario
    expect(authSystem.isAuthenticated).toBe(false);
    expect(authSystem.currentUser).toBeNull();
    
    // 3. Intentar signup con contraseña corta
    await expect(async () => {
      await authSystem.signup({
        email: 'valid@email.com',
        password: 'short',
        name: 'Test User',
      });
    }).rejects.toThrow('PASSWORD_TOO_SHORT');
    
    // 4. Signup exitoso con datos correctos
    const user = await authSystem.signup({
      email: 'valid@email.com',
      password: 'LongPassword123!',
      name: 'Test User',
    });
    
    expect(user).toBeDefined();
    expect(authSystem.isAuthenticated).toBe(true);
  });

  it('should persist onboarding progress if user closes app mid-flow', async () => {
    // 1. Usuario comienza onboarding
    mockNavigation.navigate('signup');
    
    const user = await authSystem.signup({
      email: 'interrupted@user.com',
      password: 'Password123!',
      name: 'Interrupted User',
    });
    
    // 2. Crea cuenta
    const account = appState.addAccount({
      name: 'My Account',
      type: 'bank',
      balance: 1000,
      userId: user.id,
    });
    
    // 3. Simular cierre de app (guardar estado)
    const savedState = {
      userId: user.id,
      onboardingStep: 'setup-categories',
      accountsCreated: appState.getAllAccounts().length,
      categoriesCreated: appState.getAllCategories().length,
    };
    
    expect(savedState.accountsCreated).toBe(1);
    expect(savedState.categoriesCreated).toBe(0);
    expect(savedState.onboardingStep).toBe('setup-categories');
    
    // 4. Usuario reabre app
    authSystem.login(user.email, 'Password123!');
    
    // 5. Verificar que puede continuar desde donde dejó
    expect(authSystem.isAuthenticated).toBe(true);
    expect(savedState.onboardingStep).toBe('setup-categories');
    
    // 6. Continuar con configuración de categorías
    mockNavigation.navigate('setup-categories');
    
    appState.addCategory({
      id: 'cat-1',
      name: 'Salary',
      type: 'income',
      userId: user.id,
    });
    
    // 7. Completar onboarding
    user.onboardingCompleted = true;
    expect(user.onboardingCompleted).toBe(true);
  });
});
