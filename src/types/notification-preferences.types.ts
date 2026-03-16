/**
 * 🔔 NOTIFICATION PREFERENCES TYPES
 * 
 * Tipos para las preferencias de notificaciones del usuario.
 */

export interface NotificationPreferences {
  // 💰 Presupuestos
  budgetAlerts: boolean;
  budgetThresholds: number[]; // Ej: [50, 80, 90, 100]
  
  // 📅 Recordatorios
  dailyReminder: boolean;
  dailyReminderTime: string; // Formato "HH:mm" - Ej: "20:00"
  dailyReminderDays: number[]; // 0=Domingo, 1=Lunes, ... 6=Sábado
  
  // 🏛️ Impuestos
  taxReminders: boolean;
  taxReminderMonths: number[]; // Meses para alertar - Ej: [2, 3] = Febrero, Marzo
  
  // 💳 Cuentas
  lowBalanceAlerts: boolean;
  lowBalanceThreshold: number; // Monto mínimo en COP
  negativeBalanceAlerts: boolean;
  
  // 📊 Insights (Futuro)
  unusualSpendingAlerts: boolean;
  unusualSpendingThreshold: number; // % de incremento - Ej: 50 = 50% más que el promedio
  
  // 📈 Resúmenes (Futuro)
  weeklyDigest: boolean;
  weeklyDigestDay: number; // 0=Domingo, 1=Lunes, etc.
  monthlyDigest: boolean;
  monthlyDigestDay: number; // Día del mes 1-31
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  // Presupuestos
  budgetAlerts: true,
  budgetThresholds: [80, 100], // Alertar al 80% y al 100%
  
  // Recordatorios
  dailyReminder: true,
  dailyReminderTime: '20:00',
  dailyReminderDays: [1, 2, 3, 4, 5], // Lunes a Viernes
  
  // Impuestos
  taxReminders: true,
  taxReminderMonths: [2, 3], // Febrero y Marzo
  
  // Cuentas
  lowBalanceAlerts: true,
  lowBalanceThreshold: 100_000, // 100k COP
  negativeBalanceAlerts: true,
  
  // Insights
  unusualSpendingAlerts: false, // Desactivado por defecto (futuro)
  unusualSpendingThreshold: 50,
  
  // Resúmenes
  weeklyDigest: false, // Desactivado por defecto (futuro)
  weeklyDigestDay: 1, // Lunes
  monthlyDigest: false, // Desactivado por defecto (futuro)
  monthlyDigestDay: 1, // Primer día del mes
};
