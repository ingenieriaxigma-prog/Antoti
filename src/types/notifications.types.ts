/**
 * 🔔 NOTIFICATION TYPES
 * 
 * Tipos y enums para el sistema unificado de notificaciones.
 */

export enum NotificationType {
  // 🔵 Notificaciones Grupales
  GROUP_INVITATION = 'group_invitation',
  GROUP_NEW_TRANSACTION = 'group_new_transaction',
  GROUP_COMMENT = 'group_comment',
  GROUP_REACTION = 'group_reaction',
  GROUP_NEW_MEMBER = 'group_new_member',
  GROUP_GOAL_REACHED = 'group_goal_reached',
  GROUP_BUDGET_WARNING = 'group_budget_warning',
  
  // 🟢 Notificaciones Personales - Presupuestos
  PERSONAL_BUDGET_WARNING = 'personal_budget_warning',
  PERSONAL_BUDGET_EXCEEDED = 'personal_budget_exceeded',
  
  // 🟢 Notificaciones Personales - Recordatorios
  PERSONAL_DAILY_REMINDER = 'personal_daily_reminder', // 🌙 Recordatorio nocturno
  PERSONAL_TAX_REMINDER = 'personal_tax_reminder', // 📅 Declaración de renta
  PERSONAL_RECURRING_PAYMENT = 'personal_recurring_payment',
  
  // 🟢 Notificaciones Personales - Cuentas
  PERSONAL_LOW_BALANCE = 'personal_low_balance', // 💰 Balance bajo
  
  // 🟢 Notificaciones Personales - Insights
  PERSONAL_UNUSUAL_SPENDING = 'personal_unusual_spending',
  PERSONAL_WEEKLY_SUMMARY = 'personal_weekly_summary',
  PERSONAL_MONTHLY_SUMMARY = 'personal_monthly_summary',
  PERSONAL_GOAL_REACHED = 'personal_goal_reached',
}

export enum NotificationCategory {
  GROUP = 'group',
  PERSONAL = 'personal',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface BaseNotification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon?: string; // emoji o nombre de icono
  actionUrl?: string; // Para navegación
  metadata?: Record<string, any>; // Datos adicionales
}

export interface GroupNotification extends BaseNotification {
  category: NotificationCategory.GROUP;
  groupId: string;
  groupName: string;
  triggeredBy?: {
    userId: string;
    userName: string;
    userAvatar?: string;
  };
}

export interface PersonalNotification extends BaseNotification {
  category: NotificationCategory.PERSONAL;
  relatedEntity?: {
    type: 'budget' | 'transaction' | 'account' | 'goal';
    id: string;
    name: string;
  };
}

export type UnifiedNotification = GroupNotification | PersonalNotification;

/**
 * Estado del panel de notificaciones
 */
export interface NotificationsState {
  notifications: UnifiedNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Filtros para notificaciones
 */
export type NotificationFilter = 'all' | 'group' | 'personal' | 'unread';
