/**
 * 👥 FAMILY GROUPS - HOOK: useNotifications
 * 
 * Hook personalizado para gestionar notificaciones de grupos familiares.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import * as notificationService from '../services/notification.service';
import type { GroupNotification } from '../types/family.types';

interface UseNotificationsReturn {
  notifications: GroupNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

/**
 * Hook para gestionar notificaciones
 */
export function useNotifications(): UseNotificationsReturn {
  const { accessToken, currentUser } = useAuth();
  
  const [notifications, setNotifications] = useState<GroupNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar notificaciones
   */
  const loadNotifications = useCallback(async (groupId?: string, limit: number = 50) => {
    if (!accessToken) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await notificationService.getNotifications(accessToken, groupId, limit);
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter(n => !n.read).length);
      setError(null);
    } catch (err) {
      // Manejar errores de red (Failed to fetch)
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        // Error de red - silenciosamente establecer lista vacía
        setNotifications([]);
        setUnreadCount(0);
        setError(null);
        return;
      }
      
      // Solo mostrar error si no es 401, 404, o 500
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar notificaciones';
      const is401or404or500 = errorMessage.includes('401') || 
                              errorMessage.includes('404') || 
                              errorMessage.includes('500');
      
      if (!is401or404or500) {
        setError(errorMessage);
        console.error('❌ Error loading notifications:', err);
      } else {
        setNotifications([]);
        setUnreadCount(0);
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  /**
   * Marcar notificación como leída
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!accessToken || !currentUser?.id) {
      return;
    }

    try {
      await notificationService.markAsRead(accessToken, notificationId);

      // Actualizar localmente
      setNotifications(prev => prev.map(n => {
        if (n.id === notificationId) {
          return {
            ...n,
            readBy: {
              ...n.readBy,
              [currentUser.id]: new Date().toISOString(),
            },
          };
        }
        return n;
      }));

      // Decrementar contador de no leídas
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [accessToken, currentUser?.id]);

  /**
   * Marcar todas las notificaciones como leídas
   */
  const markAllAsRead = useCallback(async () => {
    if (!accessToken || !currentUser?.id) {
      return;
    }

    try {
      await notificationService.markAllAsRead(accessToken);

      // Actualizar localmente
      const now = new Date().toISOString();
      setNotifications(prev => prev.map(n => ({
        ...n,
        readBy: {
          ...n.readBy,
          [currentUser.id]: now,
        },
      })));

      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [accessToken, currentUser?.id]);

  /**
   * Refrescar notificaciones
   */
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  /**
   * Cargar notificaciones al montar
   */
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /**
   * Polling cada 30 segundos para nuevas notificaciones
   */
  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [accessToken, loadNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  };
}