/**
 * E2E TESTS - OTI ASSISTANT
 * 
 * Tests end-to-end para el asistente de IA "Oti".
 * Simula interacciones completas con el chat y aplicación de sugerencias.
 * 
 * Cobertura:
 * - Apertura del chat Oti
 * - Preguntas sobre finanzas personales
 * - Recepción de sugerencias y consejos
 * - Aplicación de recomendaciones
 * - Historial de conversación
 * - Contexto de la conversación
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestAppState, testFixtures } from '../utils/integrationHelpers';

const appState = createTestAppState();

// Mock del asistente Oti
const otiAssistant = {
  conversationHistory: [] as any[],
  context: {
    userId: '',
    currentBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    budgets: [] as any[],
    recentTransactions: [] as any[],
  },
  
  // Actualizar contexto con datos del usuario
  updateContext: function(userId: string) {
    this.context.userId = userId;
    this.context.currentBalance = appState.getTotalWealth();
    
    const stats = appState.getStatistics();
    this.context.monthlyExpense = stats.totalExpense;
    this.context.monthlyIncome = stats.totalIncome;
    
    this.context.budgets = appState.getAllBudgets();
    this.context.recentTransactions = appState.getAllTransactions()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  },
  
  // Enviar mensaje al asistente
  sendMessage: async function(message: string) {
    // Guardar mensaje del usuario
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    this.conversationHistory.push(userMessage);
    
    // Simular procesamiento de IA
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Generar respuesta basada en el mensaje
    const response = this.generateResponse(message);
    
    // Guardar respuesta del asistente
    const assistantMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: response.text,
      suggestions: response.suggestions || [],
      actions: response.actions || [],
      timestamp: new Date().toISOString(),
    };
    
    this.conversationHistory.push(assistantMessage);
    
    return assistantMessage;
  },
  
  // Generar respuesta basada en el contexto
  generateResponse: function(message: string) {
    const messageLower = message.toLowerCase();
    
    // Análisis de presupuesto
    if (messageLower.includes('presupuesto') || messageLower.includes('budget')) {
      const totalBudget = this.context.budgets.reduce((sum, b) => sum + b.amount, 0);
      const totalSpent = this.context.budgets.reduce((sum, b) => sum + b.spent, 0);
      const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
      
      return {
        text: `Tu presupuesto mensual total es de $${totalBudget}. Has gastado $${totalSpent} (${percentUsed.toFixed(1)}%). ${
          percentUsed > 80 
            ? '⚠️ Estás cerca del límite. Te recomiendo revisar tus gastos.' 
            : '✅ Vas bien con tus gastos este mes.'
        }`,
        suggestions: [
          { text: 'Ver detalles de presupuestos', action: 'navigate-budgets' },
          { text: '¿Cómo puedo ahorrar más?', action: 'savings-tips' },
        ]
      };
    }
    
    // Consejos de ahorro
    if (messageLower.includes('ahorro') || messageLower.includes('ahorrar')) {
      const savingsRate = this.context.monthlyIncome > 0 
        ? ((this.context.monthlyIncome - this.context.monthlyExpense) / this.context.monthlyIncome) * 100
        : 0;
      
      return {
        text: `Actualmente estás ahorrando el ${savingsRate.toFixed(1)}% de tus ingresos. Lo ideal es ahorrar al menos el 20%. Aquí hay algunas sugerencias:\n\n1. 🔍 Revisa tus gastos recurrentes\n2. 🎯 Establece un presupuesto más estricto\n3. 💰 Automatiza tus ahorros\n4. 📊 Reduce gastos no esenciales`,
        suggestions: [
          { text: 'Crear meta de ahorro', action: 'create-savings-goal' },
          { text: 'Ver gastos mayores', action: 'show-top-expenses' },
        ],
        actions: [
          { type: 'create-budget', label: 'Crear presupuesto de ahorros' }
        ]
      };
    }
    
    // Análisis de gastos
    if (messageLower.includes('gasto') || messageLower.includes('gastando')) {
      const topCategory = this.getTopExpenseCategory();
      
      return {
        text: `Este mes has gastado $${this.context.monthlyExpense}. Tu categoría con más gastos es "${topCategory.name}" con $${topCategory.amount}. ¿Te gustaría establecer un presupuesto para controlar estos gastos?`,
        suggestions: [
          { text: 'Establecer presupuesto', action: 'create-budget' },
          { text: 'Ver estadísticas detalladas', action: 'show-stats' },
        ]
      };
    }
    
    // Balance y patrimonio
    if (messageLower.includes('balance') || messageLower.includes('dinero') || messageLower.includes('tengo')) {
      return {
        text: `Tu patrimonio total actual es de $${this.context.currentBalance}. ${
          this.context.currentBalance < 1000 
            ? '⚠️ Te recomiendo aumentar tu colchón de emergencia.' 
            : '✅ Mantienes un balance saludable.'
        }`,
        suggestions: [
          { text: 'Ver detalle de cuentas', action: 'navigate-accounts' },
          { text: '¿Cómo mejorar mi balance?', action: 'balance-tips' },
        ]
      };
    }
    
    // Respuesta genérica
    return {
      text: 'Hola, soy Oti, tu asistente financiero personal. Puedo ayudarte con:\n\n💰 Análisis de presupuestos\n📊 Estadísticas de gastos\n💡 Consejos de ahorro\n🎯 Metas financieras\n\n¿En qué puedo ayudarte hoy?',
      suggestions: [
        { text: '¿Cómo va mi presupuesto?', action: 'budget-analysis' },
        { text: '¿Cuánto he gastado?', action: 'expense-analysis' },
        { text: 'Consejos de ahorro', action: 'savings-tips' },
      ]
    };
  },
  
  // Obtener categoría con más gastos
  getTopExpenseCategory: function() {
    const stats = appState.getStatistics();
    let topCategory = { name: 'Sin categoría', amount: 0 };
    
    Object.keys(stats.byCategory).forEach(catId => {
      const expense = stats.byCategory[catId].expense;
      if (expense > topCategory.amount) {
        const category = appState.getCategory(catId);
        topCategory = {
          name: category?.name || 'Desconocida',
          amount: expense
        };
      }
    });
    
    return topCategory;
  },
  
  // Aplicar una sugerencia/acción
  applyAction: function(action: string) {
    switch (action) {
      case 'create-budget':
        return { success: true, message: 'Navegar a crear presupuesto' };
      case 'create-savings-goal':
        return { success: true, message: 'Navegar a crear meta de ahorro' };
      case 'navigate-budgets':
        return { success: true, message: 'Navegar a pantalla de presupuestos' };
      case 'show-stats':
        return { success: true, message: 'Navegar a estadísticas' };
      default:
        return { success: false, message: 'Acción no reconocida' };
    }
  },
  
  // Limpiar historial
  clearHistory: function() {
    this.conversationHistory = [];
  },
  
  // Obtener historial
  getHistory: function() {
    return this.conversationHistory;
  }
};

describe('Oti Assistant E2E Flow', () => {
  beforeEach(() => {
    appState.reset();
    otiAssistant.clearHistory();
    
    // Setup: usuario con datos
    appState.addAccount(testFixtures.accounts.checking);
    appState.addAccount(testFixtures.accounts.savings);
    appState.addCategory(testFixtures.categories.salary);
    appState.addCategory(testFixtures.categories.food);
    appState.addCategory(testFixtures.categories.transport);
    appState.addBudget(testFixtures.budgets.food);
    appState.addBudget(testFixtures.budgets.transport);
    
    // Transacciones de ejemplo
    appState.createIncomeTransaction({
      amount: 2000,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.salary.id,
      description: 'Salario',
      userId: testFixtures.user.id,
    });
    
    appState.createExpenseTransaction({
      amount: 300,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.food.id,
      description: 'Supermercado',
      userId: testFixtures.user.id,
    });
    
    appState.createExpenseTransaction({
      amount: 100,
      accountId: testFixtures.accounts.checking.id,
      categoryId: testFixtures.categories.transport.id,
      description: 'Gasolina',
      userId: testFixtures.user.id,
    });
  });

  it('should have complete conversation about budget analysis', async () => {
    // ==========================================
    // FASE 1: ABRIR CHAT Y ACTUALIZAR CONTEXTO
    // ==========================================
    
    // 1. Usuario abre el chat de Oti
    otiAssistant.updateContext(testFixtures.user.id);
    
    // 2. Verificar que el contexto se cargó correctamente
    expect(otiAssistant.context.userId).toBe(testFixtures.user.id);
    expect(otiAssistant.context.currentBalance).toBe(7600); // 1000+2000-300-100 + 5000
    expect(otiAssistant.context.monthlyExpense).toBe(400); // 300 + 100
    expect(otiAssistant.context.monthlyIncome).toBe(2000);
    expect(otiAssistant.context.budgets.length).toBe(2);
    
    // ==========================================
    // FASE 2: CONSULTA SOBRE PRESUPUESTO
    // ==========================================
    
    // 3. Usuario pregunta sobre su presupuesto
    const response1 = await otiAssistant.sendMessage('¿Cómo va mi presupuesto este mes?');
    
    // 4. Verificar respuesta del asistente
    expect(response1.role).toBe('assistant');
    expect(response1.content).toContain('presupuesto mensual');
    expect(response1.content).toContain('$700'); // 500 + 200
    expect(response1.content).toContain('$400'); // gastado
    expect(response1.suggestions.length).toBeGreaterThan(0);
    
    // 5. Verificar que se guardó en el historial
    expect(otiAssistant.getHistory().length).toBe(2); // pregunta + respuesta
    
    // ==========================================
    // FASE 3: APLICAR SUGERENCIA
    // ==========================================
    
    // 6. Usuario hace click en una sugerencia
    const suggestion = response1.suggestions.find(s => s.text.includes('presupuestos'));
    expect(suggestion).toBeDefined();
    
    // 7. Aplicar la acción de la sugerencia
    const actionResult = otiAssistant.applyAction(suggestion.action);
    expect(actionResult.success).toBe(true);
    expect(actionResult.message).toContain('presupuestos');
    
    // ==========================================
    // FASE 4: SEGUIMIENTO DE LA CONVERSACIÓN
    // ==========================================
    
    // 8. Usuario hace otra pregunta (seguimiento)
    const response2 = await otiAssistant.sendMessage('¿Cómo puedo ahorrar más?');
    
    expect(response2.content).toContain('ahorro');
    expect(response2.suggestions).toBeDefined();
    expect(otiAssistant.getHistory().length).toBe(4); // 2 preguntas + 2 respuestas
    
    // 9. Verificar que Oti recuerda el contexto
    expect(response2.content).toContain('%'); // porcentaje de ahorro
    
    // ==========================================
    // FASE 5: RECOMENDACIÓN ACCIONABLE
    // ==========================================
    
    // 10. Usuario pregunta sobre gastos específicos
    const response3 = await otiAssistant.sendMessage('¿En qué estoy gastando más?');
    
    expect(response3.content).toContain('Comida'); // categoría con más gastos
    expect(response3.content).toContain('$300');
    expect(response3.suggestions.length).toBeGreaterThan(0);
    
    // 11. Verificar que hay acciones disponibles
    const createBudgetSuggestion = response3.suggestions.find(s => 
      s.action === 'create-budget'
    );
    expect(createBudgetSuggestion).toBeDefined();
    
    // ==========================================
    // FASE 6: HISTORIAL COMPLETO
    // ==========================================
    
    // 12. Verificar historial completo de conversación
    const fullHistory = otiAssistant.getHistory();
    expect(fullHistory.length).toBe(6); // 3 preguntas + 3 respuestas
    
    // 13. Verificar orden cronológico
    expect(fullHistory[0].role).toBe('user');
    expect(fullHistory[1].role).toBe('assistant');
    expect(fullHistory[2].role).toBe('user');
    expect(fullHistory[3].role).toBe('assistant');
    
    // 14. Verificar timestamps
    expect(fullHistory[0].timestamp).toBeDefined();
    expect(new Date(fullHistory[1].timestamp).getTime())
      .toBeGreaterThan(new Date(fullHistory[0].timestamp).getTime());
  });

  it('should provide personalized savings advice', async () => {
    // 1. Actualizar contexto
    otiAssistant.updateContext(testFixtures.user.id);
    
    // 2. Usuario pregunta sobre ahorro
    const response = await otiAssistant.sendMessage('Dame consejos para ahorrar');
    
    // 3. Verificar que la respuesta es personalizada
    expect(response.content).toContain('ahorro');
    expect(response.content).toContain('%'); // tasa de ahorro actual
    
    // 4. Verificar que incluye consejos específicos
    expect(response.content).toContain('1.');
    expect(response.content).toContain('2.');
    expect(response.content).toContain('3.');
    
    // 5. Verificar sugerencias accionables
    expect(response.suggestions.length).toBeGreaterThan(0);
    expect(response.actions).toBeDefined();
    
    // 6. Calcular tasa de ahorro esperada
    const savingsRate = ((2000 - 400) / 2000) * 100; // 80%
    expect(response.content).toContain(savingsRate.toFixed(1));
  });

  it('should analyze spending patterns', async () => {
    // 1. Crear más transacciones para tener patrón
    for (let i = 0; i < 5; i++) {
      appState.createExpenseTransaction({
        amount: 50,
        accountId: testFixtures.accounts.checking.id,
        categoryId: testFixtures.categories.food.id,
        description: `Comida ${i + 1}`,
        userId: testFixtures.user.id,
      });
    }
    
    // 2. Actualizar contexto
    otiAssistant.updateContext(testFixtures.user.id);
    
    // 3. Usuario pregunta sobre sus gastos
    const response = await otiAssistant.sendMessage('¿Cuánto he gastado este mes?');
    
    // 4. Verificar análisis de gastos
    const totalExpense = 400 + (50 * 5); // 650
    expect(response.content).toContain(`$${totalExpense}`);
    
    // 5. Verificar identificación de categoría principal
    expect(response.content).toContain('Comida'); // categoría con más gasto
    
    // 6. Verificar sugerencias para controlar gastos
    const budgetSuggestion = response.suggestions.find(s => 
      s.text.toLowerCase().includes('presupuesto')
    );
    expect(budgetSuggestion).toBeDefined();
  });

  it('should provide balance and wealth information', async () => {
    // 1. Actualizar contexto
    otiAssistant.updateContext(testFixtures.user.id);
    
    // 2. Usuario pregunta sobre su balance
    const response = await otiAssistant.sendMessage('¿Cuánto dinero tengo?');
    
    // 3. Verificar información de patrimonio
    const expectedBalance = 7600;
    expect(response.content).toContain(`$${expectedBalance}`);
    expect(response.content).toContain('patrimonio');
    
    // 4. Verificar evaluación del balance
    if (expectedBalance >= 1000) {
      expect(response.content).toContain('✅');
    }
    
    // 5. Verificar sugerencias relacionadas
    expect(response.suggestions.length).toBeGreaterThan(0);
  });

  it('should handle multiple conversations and maintain context', async () => {
    // 1. Primera conversación sobre presupuesto
    otiAssistant.updateContext(testFixtures.user.id);
    
    const conv1 = await otiAssistant.sendMessage('¿Cómo va mi presupuesto?');
    expect(conv1.content).toContain('presupuesto');
    
    // 2. Segunda conversación sobre ahorro
    const conv2 = await otiAssistant.sendMessage('¿Cuánto estoy ahorrando?');
    expect(conv2.content).toContain('ahorro');
    
    // 3. Tercera conversación sobre gastos
    const conv3 = await otiAssistant.sendMessage('¿En qué gasto más?');
    expect(conv3.content).toContain('Comida');
    
    // 4. Verificar que todas las conversaciones están en el historial
    const history = otiAssistant.getHistory();
    expect(history.length).toBe(6); // 3 preguntas + 3 respuestas
    
    // 5. Verificar que el contexto se mantiene
    expect(otiAssistant.context.userId).toBe(testFixtures.user.id);
    expect(otiAssistant.context.currentBalance).toBeGreaterThan(0);
  });

  it('should provide actionable suggestions that can be applied', async () => {
    // 1. Iniciar conversación
    otiAssistant.updateContext(testFixtures.user.id);
    
    const response = await otiAssistant.sendMessage('Ayúdame a mejorar mis finanzas');
    
    // 2. Verificar que hay sugerencias
    expect(response.suggestions.length).toBeGreaterThan(0);
    
    // 3. Verificar que hay acciones
    if (response.actions && response.actions.length > 0) {
      const action = response.actions[0];
      expect(action.type).toBeDefined();
      expect(action.label).toBeDefined();
    }
    
    // 4. Aplicar cada sugerencia
    response.suggestions.forEach(suggestion => {
      const result = otiAssistant.applyAction(suggestion.action);
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });

  it('should handle initial greeting appropriately', async () => {
    // 1. Usuario abre el chat por primera vez
    otiAssistant.updateContext(testFixtures.user.id);
    
    // 2. Mensaje genérico/saludo
    const response = await otiAssistant.sendMessage('Hola');
    
    // 3. Verificar respuesta de bienvenida
    expect(response.content).toContain('Oti');
    expect(response.content).toContain('asistente');
    
    // 4. Verificar que ofrece opciones
    expect(response.suggestions.length).toBeGreaterThan(2);
    
    // 5. Verificar que las sugerencias son variadas
    const suggestionTexts = response.suggestions.map(s => s.text.toLowerCase());
    expect(suggestionTexts.some(t => t.includes('presupuesto'))).toBe(true);
    expect(suggestionTexts.some(t => t.includes('ahorro') || t.includes('gastado'))).toBe(true);
  });
});
