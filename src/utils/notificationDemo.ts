/**
 * 🔔 NOTIFICATION DEMO UTILITIES
 * 
 * Utilidades para probar y demostrar el sistema de notificaciones.
 * Solo para desarrollo/testing.
 */

import { Account } from '../features/accounts/types';
import { Transaction } from '../features/transactions/types';
import { Budget } from '../features/budgets/types';

/**
 * Generar datos de prueba para notificaciones de presupuesto
 */
export function generateBudgetTestData(): {
  budgets: any[];
  description: string;
} {
  return {
    description: 'Presupuestos al 50%, 85% y 110%',
    budgets: [
      {
        id: 'demo-budget-1',
        category: 'Alimentos (Demo)',
        categoryId: 'demo-cat-1',
        limit: 1000000,
        spent: 500000, // 50%
        period: 'monthly',
      },
      {
        id: 'demo-budget-2',
        category: 'Transporte (Demo)',
        categoryId: 'demo-cat-2',
        limit: 500000,
        spent: 425000, // 85%
        period: 'monthly',
      },
      {
        id: 'demo-budget-3',
        category: 'Entretenimiento (Demo)',
        categoryId: 'demo-cat-3',
        limit: 300000,
        spent: 330000, // 110%
        period: 'monthly',
      },
    ],
  };
}

/**
 * Generar datos de prueba para balance bajo
 */
export function generateLowBalanceTestData(): {
  accounts: Partial<Account>[];
  description: string;
} {
  return {
    description: 'Cuentas con balance bajo y negativo',
    accounts: [
      {
        id: 'demo-account-1',
        name: 'Cuenta Baja (Demo)',
        balance: 45000, // Bajo
        type: 'cash',
        color: '#f59e0b',
      },
      {
        id: 'demo-account-2',
        name: 'Cuenta Negativa (Demo)',
        balance: -150000, // Negativo
        type: 'creditCard',
        color: '#ef4444',
      },
    ],
  };
}

/**
 * Generar datos de prueba para recordatorio nocturno
 * (Requiere que NO haya transacciones de hoy)
 */
export function shouldShowDailyReminder(transactions: Transaction[]): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTransactions = transactions.filter(t => {
    const txDate = new Date(t.date);
    txDate.setHours(0, 0, 0, 0);
    return txDate.getTime() === today.getTime();
  });

  return todayTransactions.length === 0;
}

/**
 * Generar datos de prueba para declaración de renta
 */
export function generateTaxReminderTestData(): {
  transactions: Partial<Transaction>[];
  description: string;
} {
  const lastYear = new Date().getFullYear() - 1;
  
  return {
    description: `Ingresos ${lastYear} que exceden umbral de renta`,
    transactions: [
      {
        id: 'demo-tx-1',
        type: 'income',
        amount: 4500000,
        date: new Date(lastYear, 0, 15).toISOString(),
        description: 'Salario Enero (Demo)',
        categoryId: 'salary',
      },
      {
        id: 'demo-tx-2',
        type: 'income',
        amount: 4500000,
        date: new Date(lastYear, 1, 15).toISOString(),
        description: 'Salario Febrero (Demo)',
        categoryId: 'salary',
      },
      {
        id: 'demo-tx-3',
        type: 'income',
        amount: 4500000,
        date: new Date(lastYear, 2, 15).toISOString(),
        description: 'Salario Marzo (Demo)',
        categoryId: 'salary',
      },
      {
        id: 'demo-tx-4',
        type: 'income',
        amount: 4500000,
        date: new Date(lastYear, 3, 15).toISOString(),
        description: 'Salario Abril (Demo)',
        categoryId: 'salary',
      },
      {
        id: 'demo-tx-5',
        type: 'income',
        amount: 4500000,
        date: new Date(lastYear, 4, 15).toISOString(),
        description: 'Salario Mayo (Demo)',
        categoryId: 'salary',
      },
      {
        id: 'demo-tx-6',
        type: 'income',
        amount: 4500000,
        date: new Date(lastYear, 5, 15).toISOString(),
        description: 'Salario Junio (Demo)',
        categoryId: 'salary',
      },
      {
        id: 'demo-tx-7',
        type: 'income',
        amount: 4500000,
        date: new Date(lastYear, 6, 15).toISOString(),
        description: 'Salario Julio (Demo)',
        categoryId: 'salary',
      },
      {
        id: 'demo-tx-8',
        type: 'income',
        amount: 4500000,
        date: new Date(lastYear, 7, 15).toISOString(),
        description: 'Salario Agosto (Demo)',
        categoryId: 'salary',
      },
      {
        id: 'demo-tx-9',
        type: 'income',
        amount: 4500000,
        date: new Date(lastYear, 8, 15).toISOString(),
        description: 'Salario Septiembre (Demo)',
        categoryId: 'salary',
      },
      {
        id: 'demo-tx-10',
        type: 'income',
        amount: 4500000,
        date: new Date(lastYear, 9, 15).toISOString(),
        description: 'Salario Octubre (Demo)',
        categoryId: 'salary',
      },
      {
        id: 'demo-tx-11',
        type: 'income',
        amount: 4500000,
        date: new Date(lastYear, 10, 15).toISOString(),
        description: 'Salario Noviembre (Demo)',
        categoryId: 'salary',
      },
      {
        id: 'demo-tx-12',
        type: 'income',
        amount: 4500000,
        date: new Date(lastYear, 11, 15).toISOString(),
        description: 'Salario Diciembre (Demo)',
        categoryId: 'salary',
      },
    ],
  };
}

/**
 * Tips de testing por tipo de notificación
 */
export const NOTIFICATION_TEST_TIPS = {
  budgets: {
    title: '🎯 Presupuestos',
    tips: [
      'Crea un presupuesto de $500k',
      'Registra gastos hasta alcanzar $400k (80%)',
      'Abre el panel de notificaciones',
      'Verás alerta amarilla de presupuesto cerca del límite',
    ],
  },
  dailyReminder: {
    title: '🌙 Recordatorio Nocturno',
    tips: [
      'Asegúrate de no tener transacciones HOY',
      'Configura hora de recordatorio a la hora actual',
      'Espera a que se actualicen las notificaciones (60s o refresca)',
      'Verás recordatorio para registrar gastos',
    ],
  },
  taxReminder: {
    title: '📅 Declaración de Renta',
    tips: [
      'Solo funciona en Febrero o Marzo',
      'Requiere ingresos del año anterior > $40M',
      'Simula cambiando la fecha del sistema o espera a Febrero',
      'Verás alerta con días restantes hasta abril',
    ],
  },
  lowBalance: {
    title: '💰 Balance Bajo',
    tips: [
      'Crea una cuenta con balance < $100k',
      'O edita una existente para reducir el balance',
      'Abre el panel de notificaciones',
      'Verás alerta de balance bajo',
    ],
  },
};

/**
 * Obtener mensaje de ayuda para testing
 */
export function getTestingHelp() {
  return `
🔔 GUÍA DE TESTING - NOTIFICACIONES PERSONALES

Para probar cada tipo de notificación:

${Object.entries(NOTIFICATION_TEST_TIPS)
  .map(([key, value]) => `
${value.title}
${value.tips.map((tip, i) => `  ${i + 1}. ${tip}`).join('\n')}
`)
  .join('\n')}

⚙️ CONFIGURACIÓN:
- Abre el panel de notificaciones (campana en dashboard)
- Click en el icono de engranaje ⚙️
- Personaliza umbrales, horarios y días
- Las preferencias se guardan automáticamente

📊 ESTADO ACTUAL:
- Presupuestos alertan al: ${JSON.stringify([80, 100])}%
- Recordatorio nocturno: 20:00 (Lun-Vie)
- Alertas de renta: Febrero y Marzo
- Balance bajo: < $100,000 COP

✨ Tips:
- Las notificaciones se actualizan cada 60 segundos
- Puedes forzar actualización refrescando la página
- Los recordatorios nocturnos solo aparecen entre 20:00-06:00
- Las preferencias son por usuario (localStorage)
  `;
}
