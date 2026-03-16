/**
 * OTI CONTEXT SERVICE
 * 
 * Servicio para obtener contexto financiero del usuario para Oti.
 * Permite que Oti dé respuestas personalizadas basadas en datos reales.
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export interface FinancialContext {
  // Resumen financiero
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  
  // Cuentas
  accountCount: number;
  accounts: Array<{
    name: string;
    type: string;
    balance: number;
  }>;
  
  // Categorías top
  topExpenseCategories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  
  // Presupuestos
  budgetCount: number;
  budgetsOverLimit: number;
  budgets: Array<{
    category: string;
    spent: number;
    limit: number;
    percentage: number;
  }>;
  
  // Estadísticas
  transactionCount: number;
  lastTransactionDate: string | null;
  averageTransactionAmount: number;
  
  // Alertas y insights
  hasOverspending: boolean;
  hasBudgets: boolean;
  hasRecentActivity: boolean;
}

/**
 * Obtiene el contexto financiero del usuario autenticado
 */
export async function fetchFinancialContext(accessToken: string): Promise<FinancialContext | null> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/oti-context`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Error fetching financial context:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.context;
  } catch (error) {
    console.error('Error in fetchFinancialContext:', error);
    return null;
  }
}

/**
 * Genera preguntas sugeridas personalizadas basadas en el contexto
 */
export function generatePersonalizedQuestions(
  context: FinancialContext | null, 
  currentScreen?: string
): string[] {
  // 🆕 Si tenemos el contexto de pantalla, generamos preguntas específicas
  if (currentScreen) {
    return generateScreenContextQuestions(context, currentScreen);
  }

  // Preguntas por defecto si no hay contexto
  const defaultQuestions = [
    '¿Cómo puedo ahorrar más dinero?',
    '¿Qué es un presupuesto y cómo crearlo?',
    '¿Cómo uso la app para registrar gastos?',
    'Dame consejos para reducir deudas',
  ];

  if (!context) {
    return defaultQuestions;
  }

  const questions: string[] = [];

  // Pregunta sobre presupuestos si tiene gastos excesivos
  if (context.hasOverspending && context.budgetsOverLimit > 0) {
    questions.push(`Tengo ${context.budgetsOverLimit} presupuesto(s) excedido(s), ¿qué hago?`);
  }

  // Pregunta sobre ahorro basada en tasa de ahorro
  if (context.savingsRate < 10) {
    questions.push('¿Cómo puedo mejorar mi tasa de ahorro?');
  } else if (context.savingsRate > 20) {
    questions.push('¿Dónde invertir mis ahorros?');
  }

  // Pregunta sobre categoría que más gasta
  if (context.topExpenseCategories.length > 0) {
    const topCategory = context.topExpenseCategories[0];
    questions.push(`¿Cómo reducir gastos en ${topCategory.name}?`);
  }

  // Pregunta sobre presupuestos si no tiene
  if (!context.hasBudgets && context.monthlyExpenses > 0) {
    questions.push('¿Cómo crear mi primer presupuesto?');
  }

  // Pregunta sobre análisis si tiene datos
  if (context.transactionCount > 10) {
    questions.push('Analiza mis finanzas del último mes');
  }

  // Pregunta sobre balance si es negativo
  if (context.totalBalance < 0) {
    questions.push('¿Qué hacer si mi balance es negativo?');
  }

  // Pregunta sobre organización si tiene muchas cuentas
  if (context.accountCount > 3) {
    questions.push('¿Cómo organizar mejor mis cuentas?');
  }

  // Completar con preguntas por defecto si faltan
  while (questions.length < 4) {
    const remaining = defaultQuestions.filter(q => !questions.includes(q));
    if (remaining.length === 0) break;
    questions.push(remaining[0]);
  }

  // Retornar solo 4 preguntas
  return questions.slice(0, 4);
}

/**
 * 🆕 Genera preguntas contextuales según la pantalla actual
 */
function generateScreenContextQuestions(
  context: FinancialContext | null,
  currentScreen: string
): string[] {
  const questions: string[] = [];

  switch (currentScreen) {
    case 'home':
      // PANTALLA INICIO - Enfoque en visión general y acciones rápidas
      
      // 1. Pregunta sobre gastos recientes o registro rápido
      if (context?.hasRecentActivity) {
        questions.push('¿Cómo van mis gastos esta semana?');
      } else {
        questions.push('Registrar un gasto de hoy');
      }
      
      // 2. Pregunta sobre balance y flujo de efectivo
      if (context && context.totalBalance < 0) {
        questions.push('¿Por qué mi balance es negativo?');
      } else {
        questions.push('Muéstrame mi resumen financiero del mes');
      }
      
      // 3. Pregunta sobre ahorro
      if (context && context.savingsRate > 0) {
        questions.push(`Mi tasa de ahorro es ${context.savingsRate.toFixed(1)}%, ¿es buena?`);
      } else {
        questions.push('¿Cómo empiezo a ahorrar dinero?');
      }
      
      // 4. Pregunta sobre categorías problemáticas
      if (context && context.topExpenseCategories.length > 0) {
        const topCategory = context.topExpenseCategories[0];
        questions.push(`¿Por qué gasto tanto en ${topCategory.name}?`);
      } else {
        questions.push('Dame 3 consejos para mejorar mis finanzas');
      }
      break;

    case 'budgets':
      // PANTALLA PRESUPUESTOS - Enfoque en planificación y optimización
      
      // 1. Pregunta sobre crear presupuesto o estado actual
      if (context && context.budgetCount === 0) {
        questions.push('Ayúdame a crear mi primer presupuesto');
      } else if (context && context.budgetsOverLimit > 0) {
        questions.push(`Tengo ${context.budgetsOverLimit} presupuesto(s) excedido(s), ¿qué hago?`);
      } else {
        questions.push('Crear un presupuesto para una nueva categoría');
      }
      
      // 2. Pregunta sobre plan financiero completo
      questions.push('Diseña un plan financiero completo para mí');
      
      // 3. Pregunta sobre distribución óptima
      if (context && context.monthlyIncome > 0) {
        questions.push(`Gano $${context.monthlyIncome.toLocaleString('es-CO')}, ¿cómo distribuyo mi dinero?`);
      } else {
        questions.push('¿Cuál es la regla 50/30/20 de presupuestos?');
      }
      
      // 4. Pregunta sobre análisis de presupuestos
      if (context && context.budgetCount > 0) {
        questions.push('Analiza el rendimiento de mis presupuestos');
      } else {
        questions.push('¿Qué categorías de gasto debería tener?');
      }
      break;

    case 'accounts':
      // PANTALLA CUENTAS - Enfoque en gestión de cuentas y transferencias
      
      // 1. Pregunta sobre crear cuenta o transferencias
      if (context && context.accountCount === 0) {
        questions.push('Ayúdame a crear mi primera cuenta');
      } else if (context && context.accountCount >= 2) {
        questions.push('Transferir dinero entre mis cuentas');
      } else {
        questions.push('Crear una nueva cuenta de ahorros');
      }
      
      // 2. Pregunta sobre balance consolidado
      if (context && context.accountCount > 0) {
        questions.push('¿Cuál es mi balance total en todas mis cuentas?');
      } else {
        questions.push('¿Qué tipos de cuentas debería tener?');
      }
      
      // 3. Pregunta sobre organización de cuentas
      if (context && context.accountCount > 3) {
        questions.push(`Tengo ${context.accountCount} cuentas, ¿cómo las organizo mejor?`);
      } else {
        questions.push('¿Cómo usar múltiples cuentas estratégicamente?');
      }
      
      // 4. Pregunta sobre proyección o análisis
      if (context && context.accounts.length > 0) {
        const lowBalanceAccounts = context.accounts.filter(acc => acc.balance < 10000);
        if (lowBalanceAccounts.length > 0) {
          questions.push(`¿Qué hago con cuentas de bajo balance?`);
        } else {
          questions.push('Proyecta mi flujo de caja del próximo mes');
        }
      } else {
        questions.push('Consejos para administrar mis cuentas');
      }
      break;

    case 'transactions':
      // PANTALLA TRANSACCIONES - Enfoque en registro y análisis de transacciones
      
      questions.push('Registrar un nuevo gasto');
      
      if (context && context.transactionCount > 0) {
        questions.push('Muéstrame mis gastos de esta semana');
      } else {
        questions.push('¿Cómo registrar mis transacciones?');
      }
      
      if (context && context.topExpenseCategories.length > 0) {
        const topCategory = context.topExpenseCategories[0];
        questions.push(`Analiza mis gastos en ${topCategory.name}`);
      } else {
        questions.push('¿En qué categorías debería dividir mis gastos?');
      }
      
      questions.push('Dame consejos para reducir gastos innecesarios');
      break;

    default:
      // FALLBACK - Preguntas generales
      questions.push('¿Cómo puedo mejorar mi situación financiera?');
      questions.push('Explícame cómo usar esta app');
      questions.push('Dame consejos personalizados de ahorro');
      questions.push('Analiza mis finanzas actuales');
      break;
  }

  // Asegurar que siempre haya exactamente 4 preguntas
  while (questions.length < 4) {
    questions.push('¿En qué más puedo ayudarte?');
  }

  return questions.slice(0, 4);
}

/**
 * Formatea el contexto para incluirlo en el prompt del sistema
 */
export function formatContextForPrompt(context: FinancialContext): string {
  return `
DATOS FINANCIEROS ACTUALES DEL USUARIO:

📊 Resumen General:
- Balance total: $${context.totalBalance.toLocaleString('es-CO')}
- Ingresos mensuales: $${context.monthlyIncome.toLocaleString('es-CO')}
- Gastos mensuales: $${context.monthlyExpenses.toLocaleString('es-CO')}
- Tasa de ahorro: ${context.savingsRate.toFixed(1)}%

💰 Cuentas (${context.accountCount} total):
${context.accounts.map(acc => `- ${acc.name} (${acc.type}): $${acc.balance.toLocaleString('es-CO')}`).join('\n')}

📈 Categorías con más gastos:
${context.topExpenseCategories.map((cat, i) => `${i + 1}. ${cat.name}: $${cat.amount.toLocaleString('es-CO')} (${cat.percentage.toFixed(1)}%)`).join('\n')}

🎯 Presupuestos (${context.budgetCount} total, ${context.budgetsOverLimit} excedidos):
${context.budgets.map(b => `- ${b.category}: $${b.spent.toLocaleString('es-CO')} / $${b.limit.toLocaleString('es-CO')} (${b.percentage.toFixed(1)}%)`).join('\n')}

📝 Estadísticas:
- Total de transacciones: ${context.transactionCount}
- Última transacción: ${context.lastTransactionDate || 'N/A'}
- Promedio por transacción: $${context.averageTransactionAmount.toLocaleString('es-CO')}

⚠️ Alertas:
${context.hasOverspending ? '- ⚠️ Hay gastos excesivos detectados' : '- ✅ Gastos dentro de límites'}
${context.hasBudgets ? '- ✅ Tiene presupuestos configurados' : '- ⚠️ No tiene presupuestos configurados'}
${context.hasRecentActivity ? '- ✅ Actividad reciente detectada' : '- ⚠️ Sin actividad reciente'}

IMPORTANTE: Usa estos datos REALES para dar respuestas personalizadas y precisas. Menciona números específicos cuando sea relevante.
`;
}