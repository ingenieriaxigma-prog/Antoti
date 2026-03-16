/**
 * 🔔 USE UNIFIED NOTIFICATIONS HOOK
 * 
 * Hook para gestionar todas las notificaciones (grupales y personales) en un solo lugar.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  UnifiedNotification, 
  NotificationType, 
  NotificationCategory,
  NotificationPriority,
  PersonalNotification
} from '../types/notifications.types';
import { useBudgets } from './useBudgets';
import { useTransactions } from './useTransactions';
import { useAccounts } from './useAccounts';
import { useNotificationPreferences } from './useNotificationPreferences';
import { toast } from 'sonner@2.0.3';
import { BudgetService } from '../features/budgets/services/budget.service';
import { useCategories } from './useCategories';

export function useUnifiedNotifications() {
  const { accessToken, isAuthenticated, user } = useAuth();
  const { budgets } = useBudgets();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { preferences } = useNotificationPreferences();
  
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado persistido de notificaciones personales (leídas/eliminadas)
  const [personalNotificationState, setPersonalNotificationState] = useState<{
    [id: string]: { read: boolean; dismissed: boolean; timestamp: string };
  }>(() => {
    try {
      const saved = localStorage.getItem(`personalNotifications_${user?.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Guardar estado en localStorage cuando cambia
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`personalNotifications_${user.id}`, JSON.stringify(personalNotificationState));
    }
  }, [personalNotificationState, user?.id]);

  /**
   * Cargar notificaciones grupales desde el servidor
   */
  const loadGroupNotifications = useCallback(async () => {
    if (!accessToken || !isAuthenticated) return [];

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/family/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        // Silenciosamente retornar array vacío para errores 401, 404, 500
        if (response.status === 401 || response.status === 404 || response.status === 500) {
          return [];
        }
        throw new Error('Error al cargar notificaciones grupales');
      }

      const data = await response.json();
      
      // Transformar notificaciones del servidor al formato unificado
      // Filtrar notificaciones creadas por el usuario actual (no notificarte de tus propias acciones)
      const allNotifications = data.notifications || [];
      const filteredNotifications = allNotifications.filter((n: any) => n.triggered_by_user_id !== user?.id);
      
      return filteredNotifications.map((n: any) => ({
          id: n.id,
          type: mapBackendTypeToFrontend(n.notification_type),
          category: NotificationCategory.GROUP,
          priority: getPriorityFromType(n.notification_type),
          title: getTitleFromType(n.notification_type),
          message: n.message,
          timestamp: n.created_at,
          read: n.read_by?.[user?.id || ''] || false,
          groupId: n.group_id,
          groupName: n.group_name || 'Grupo',
          triggeredBy: n.triggered_by_user_id ? {
            userId: n.triggered_by_user_id,
            userName: n.triggered_by_name || 'Usuario',
          } : undefined,
          metadata: {
            ...n.metadata,
            transactionId: n.group_transaction_id, // IMPORTANTE: Guardar el ID de la transacción
          },
        }));
    } catch (err) {
      // Solo loguear errores que no sean esperados (401, 404, 500, network errors)
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        // Error de red - silenciosamente retornar vacío
        return [];
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      if (!errorMessage.includes('401') && !errorMessage.includes('404') && !errorMessage.includes('500')) {
        console.error('Error loading group notifications:', err);
      }
      return [];
    }
  }, [accessToken, isAuthenticated, user?.id]);

  /**
   * Generar notificaciones personales basadas en presupuestos, transacciones y cuentas
   */
  const generatePersonalNotifications = useCallback((): PersonalNotification[] => {
    const personalNotifications: PersonalNotification[] = [];
    const now = new Date();
    const nowISO = now.toISOString();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();

    // ========================================
    // 1️⃣ PRESUPUESTOS - Alertas de límites
    // ========================================
    if (preferences.budgetAlerts) {
      budgets.forEach(budget => {
        // 🔧 FIX: Calcular spent dinámicamente usando BudgetService
        const spent = BudgetService.calculateCategoryExpense(
          budget.categoryId,
          transactions,
          currentMonth,
          currentYear
        );
        
        // 🔧 FIX: budget.amount es el límite (no budget.limit)
        const spentPercentage = (spent / budget.amount) * 100;
        
        // 🔧 FIX: Usar el alertThreshold del budget (o el de preferences como fallback)
        const budgetThreshold = budget.alertThreshold || 80;
        
        // Verificar si el porcentaje actual alcanzó o superó el umbral configurado
        // Solo generar alerta si está en la ventana: threshold <= spent < threshold + 20
        if (spentPercentage >= budgetThreshold && spentPercentage < (budgetThreshold + 20)) {
          const isExceeded = budgetThreshold >= 100 || spentPercentage >= 100;
          
          // Obtener nombre de categoría
          const category = categories.find(c => c.id === budget.categoryId);
          const categoryName = category?.name || 'Categoría';
          
          personalNotifications.push({
            id: `budget-${isExceeded ? 'exceeded' : 'warning'}-${budget.id}-${budgetThreshold}`,
            type: isExceeded ? NotificationType.PERSONAL_BUDGET_EXCEEDED : NotificationType.PERSONAL_BUDGET_WARNING,
            category: NotificationCategory.PERSONAL,
            priority: budgetThreshold >= 100 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
            title: isExceeded ? '🚨 Presupuesto excedido' : '⚠️ Presupuesto cerca del límite',
            message: isExceeded 
              ? `Has superado tu presupuesto de "${categoryName}" en ${((spentPercentage - 100).toFixed(0))}%`
              : `Tu presupuesto "${categoryName}" está al ${spentPercentage.toFixed(0)}% (${spent.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })} de ${budget.amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })})`,
            timestamp: nowISO,
            read: false,
            relatedEntity: {
              type: 'budget',
              id: budget.id,
              name: categoryName,
            },
          });
        }
      });
    }

    // ========================================
    // 2️⃣ RECORDATORIO NOCTURNO - ¿Registraste tus gastos?
    // ========================================
    if (preferences.dailyReminder) {
      const currentHour = now.getHours();
      const currentDay = now.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
      const [reminderHour, reminderMinute] = preferences.dailyReminderTime.split(':').map(Number);
      
      // Verificar si es el día configurado y la hora configurada
      const isDayEnabled = preferences.dailyReminderDays.includes(currentDay);
      const isReminderTime = currentHour === reminderHour;
      
      if (isDayEnabled && isReminderTime) {
        // Verificar si hay transacciones de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayTransactions = transactions.filter(t => {
          const txDate = new Date(t.date);
          txDate.setHours(0, 0, 0, 0);
          return txDate.getTime() === today.getTime();
        });

        // Si no hay transacciones hoy, recordar al usuario
        if (todayTransactions.length === 0) {
          personalNotifications.push({
            id: `daily-reminder-${today.toISOString().split('T')[0]}`,
            type: NotificationType.PERSONAL_DAILY_REMINDER,
            category: NotificationCategory.PERSONAL,
            priority: NotificationPriority.MEDIUM,
            title: '🌙 Recordatorio nocturno',
            message: '¿Ya registraste todos los gastos de hoy? No olvides mantener tus finanzas al día.',
            timestamp: nowISO,
            read: false,
          });
        }
      }
    }

    // ========================================
    // 3️⃣ DECLARACIÓN DE RENTA - Alertas Colombia
    // ========================================
    if (preferences.taxReminders) {
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentYear = now.getFullYear();
      
      // Verificar si estamos en uno de los meses configurados para alertar
      const shouldShowTaxReminder = preferences.taxReminderMonths.includes(currentMonth);
      
      if (shouldShowTaxReminder) {
        // Calcular ingresos del año anterior
        const lastYear = currentYear - 1;
        const lastYearStart = new Date(lastYear, 0, 1);
        const lastYearEnd = new Date(lastYear, 11, 31);
        
        const yearlyIncome = transactions
          .filter(t => {
            const txDate = new Date(t.date);
            return t.type === 'income' && txDate >= lastYearStart && txDate <= lastYearEnd;
          })
          .reduce((sum, t) => sum + t.amount, 0);
        
        // Umbral aproximado: 50M COP (esto puede variar, pero es referencia)
        const taxThreshold = 50_000_000;
        
        if (yearlyIncome >= taxThreshold * 0.8) { // Alertar si está cerca o supera
          const daysUntilApril = currentMonth === 2 ? 45 : currentMonth === 3 ? 15 : 0;
          
          personalNotifications.push({
            id: `tax-reminder-${currentYear}`,
            type: NotificationType.PERSONAL_TAX_REMINDER,
            category: NotificationCategory.PERSONAL,
            priority: NotificationPriority.HIGH,
            title: '📅 Declaración de Renta',
            message: `La temporada de declaración está cerca${daysUntilApril > 0 ? ` (${daysUntilApril} días)` : ''}. Tus ingresos ${lastYear}: ${yearlyIncome.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}. ${yearlyIncome >= taxThreshold ? '¡Debes declarar!' : 'Estás cerca del umbral.'}`,
            timestamp: nowISO,
            read: false,
            metadata: {
              year: lastYear,
              income: yearlyIncome,
              threshold: taxThreshold,
              mustDeclare: yearlyIncome >= taxThreshold,
            },
          });
        }
      }
    }

    // ========================================
    // 4️⃣ BALANCE BAJO - Alertas por cuenta
    // ========================================
    if (preferences.lowBalanceAlerts || preferences.negativeBalanceAlerts) {
      accounts.forEach(account => {
        // Usar el umbral configurado por el usuario
        const lowBalanceThreshold = preferences.lowBalanceThreshold;
        
        // Alerta de balance bajo
        if (preferences.lowBalanceAlerts && account.balance < lowBalanceThreshold && account.balance > 0) {
          personalNotifications.push({
            id: `low-balance-${account.id}`,
            type: NotificationType.PERSONAL_LOW_BALANCE,
            category: NotificationCategory.PERSONAL,
            priority: NotificationPriority.HIGH,
            title: '💰 Balance bajo en cuenta',
            message: `Tu cuenta "${account.name}" tiene un balance bajo: ${account.balance.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}`,
            timestamp: nowISO,
            read: false,
            relatedEntity: {
              type: 'account',
              id: account.id,
              name: account.name,
            },
          });
        }
        
        // Alerta crítica si el balance es negativo
        if (preferences.negativeBalanceAlerts && account.balance < 0) {
          personalNotifications.push({
            id: `negative-balance-${account.id}`,
            type: NotificationType.PERSONAL_LOW_BALANCE,
            category: NotificationCategory.PERSONAL,
            priority: NotificationPriority.URGENT,
            title: '🚨 Cuenta en sobregiro',
            message: `¡Atención! Tu cuenta "${account.name}" está en negativo: ${account.balance.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}`,
            timestamp: nowISO,
            read: false,
            relatedEntity: {
              type: 'account',
              id: account.id,
              name: account.name,
            },
          });
        }
      });
    }

    // Aplicar estado persistido (leído/eliminado) y filtrar eliminadas
    return personalNotifications
      .map(notif => {
        const state = personalNotificationState[notif.id];
        if (state?.dismissed) return null; // Filtrar eliminadas
        
        return {
          ...notif,
          read: state?.read || notif.read,
          timestamp: state?.timestamp || notif.timestamp, // Mantener timestamp original si existe
        };
      })
      .filter((n): n is PersonalNotification => n !== null);
  }, [budgets, transactions, accounts, preferences, personalNotificationState, categories]);

  /**
   * Cargar todas las notificaciones
   */
  const loadAllNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Cargar notificaciones grupales
      const groupNotifications = await loadGroupNotifications();
      
      // Generar notificaciones personales
      const personalNotifications = generatePersonalNotifications();
      
      // Combinar y ordenar por fecha (más reciente primero)
      const allNotifications = [...groupNotifications, ...personalNotifications].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setNotifications(allNotifications);
      setError(null); // Limpiar error previo si la carga fue exitosa
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar notificaciones';
      // No mostrar errores de autenticación ya que son esperados
      if (!errorMessage.includes('401') && !errorMessage.includes('404')) {
        setError(errorMessage);
        console.error('❌ Error loading notifications:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadGroupNotifications, generatePersonalNotifications]);

  /**
   * Marcar notificación como leída
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    // Actualizar localmente
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );

    // Verificar si es personal o grupal
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification?.category === NotificationCategory.PERSONAL) {
      // Persistir estado para notificaciones personales
      setPersonalNotificationState(prev => ({
        ...prev,
        [notificationId]: {
          read: true,
          dismissed: prev[notificationId]?.dismissed || false,
          timestamp: prev[notificationId]?.timestamp || new Date().toISOString(),
        },
      }));
    } else if (notification?.category === NotificationCategory.GROUP && accessToken) {
      // Si es notificación grupal, actualizar en el servidor
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/family/notifications/${notificationId}/read`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
  }, [notifications, accessToken]);

  /**
   * Marcar todas como leídas
   */
  const markAllAsRead = useCallback(() => {
    // Actualizar notificaciones en estado
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    // Persistir estado para notificaciones personales
    const updates: typeof personalNotificationState = {};
    notifications
      .filter(n => n.category === NotificationCategory.PERSONAL)
      .forEach(n => {
        updates[n.id] = {
          read: true,
          dismissed: personalNotificationState[n.id]?.dismissed || false,
          timestamp: personalNotificationState[n.id]?.timestamp || new Date().toISOString(),
        };
      });
    
    setPersonalNotificationState(prev => ({ ...prev, ...updates }));
    toast.success('Todas las notificaciones marcadas como leídas');
  }, [notifications, personalNotificationState]);

  /**
   * Eliminar notificación
   */
  const deleteNotification = useCallback((notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    
    // Remover de la lista
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // Si es personal, marcar como eliminada en el estado persistido
    if (notification?.category === NotificationCategory.PERSONAL) {
      setPersonalNotificationState(prev => ({
        ...prev,
        [notificationId]: {
          read: prev[notificationId]?.read || false,
          dismissed: true, // Marcar como eliminada
          timestamp: prev[notificationId]?.timestamp || new Date().toISOString(),
        },
      }));
    }
    
    toast.success('Notificación eliminada');
  }, [notifications]);

  /**
   * Refrescar notificaciones
   */
  const refresh = useCallback(() => {
    loadAllNotifications();
  }, [loadAllNotifications]);

  // Limpiar notificaciones antiguas del estado persistido
  useEffect(() => {
    if (!user?.id) return;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    setPersonalNotificationState(prev => {
      const cleaned: typeof prev = {};
      Object.entries(prev).forEach(([id, state]) => {
        // Mantener solo si no está eliminada O si es reciente
        if (!state.dismissed || state.timestamp > sevenDaysAgo) {
          cleaned[id] = state;
        }
      });
      return cleaned;
    });
  }, [user?.id]);

  // Cargar notificaciones al montar, cuando cambia la autenticación,
  // o cuando cambian los datos que generan notificaciones personales
  useEffect(() => {
    if (isAuthenticated) {
      loadAllNotifications();
    }
  }, [isAuthenticated, loadAllNotifications]);

  // Polling cada 15 segundos para notificaciones de grupo en tiempo casi real
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadAllNotifications();
    }, 15000); // 15 segundos para actualizaciones más rápidas

    return () => clearInterval(interval);
  }, [isAuthenticated, loadAllNotifications]);

  // Calcular contador de no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}

/**
 * Helpers
 */

/**
 * Mapear tipo de notificación del backend al enum del frontend
 */
function mapBackendTypeToFrontend(backendType: string): NotificationType {
  const typeMap: Record<string, NotificationType> = {
    'new_transaction': NotificationType.GROUP_NEW_TRANSACTION,
    'comment': NotificationType.GROUP_COMMENT,
    'reaction': NotificationType.GROUP_REACTION,
    'new_member': NotificationType.GROUP_NEW_MEMBER,
    'member_joined': NotificationType.GROUP_NEW_MEMBER,
    'member_left': NotificationType.GROUP_NEW_MEMBER,
    'group_invitation': NotificationType.GROUP_INVITATION,
    'goal_reached': NotificationType.GROUP_GOAL_REACHED,
    'budget_warning': NotificationType.GROUP_BUDGET_WARNING,
  };
  
  return typeMap[backendType] || NotificationType.GROUP_NEW_TRANSACTION;
}

function getPriorityFromType(type: string): NotificationPriority {
  if (type.includes('invitation')) return NotificationPriority.URGENT;
  if (type.includes('exceeded') || type.includes('warning')) return NotificationPriority.HIGH;
  if (type.includes('comment') || type.includes('reaction')) return NotificationPriority.LOW;
  return NotificationPriority.MEDIUM;
}

function getTitleFromType(type: string): string {
  const titles: Record<string, string> = {
    'group_invitation': '📨 Invitación a grupo',
    'new_transaction': '💰 Nueva transacción',
    'comment': '💬 Nuevo comentario',
    'new_comment': '💬 Nuevo comentario', // Compatibilidad
    'reaction': '❤️ Nueva reacción',
    'new_reaction': '❤️ Nueva reacción', // Compatibilidad
    'new_member': '👋 Nuevo miembro',
    'member_joined': '👋 Miembro unido',
    'member_left': '👋 Miembro salió',
    'goal_reached': '🎉 Meta alcanzada',
    'budget_warning': '⚠️ Alerta de presupuesto',
  };
  
  return titles[type] || '🔔 Notificación';
}