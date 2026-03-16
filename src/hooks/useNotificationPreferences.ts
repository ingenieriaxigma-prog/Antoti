/**
 * 🔔 USE NOTIFICATION PREFERENCES HOOK
 * 
 * Hook para gestionar las preferencias de notificaciones del usuario.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  NotificationPreferences, 
  DEFAULT_NOTIFICATION_PREFERENCES 
} from '../types/notification-preferences.types';

const STORAGE_KEY_PREFIX = 'oti_notification_preferences_';

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener la clave de almacenamiento del usuario actual
  const getStorageKey = useCallback(() => {
    return user ? `${STORAGE_KEY_PREFIX}${user.id}` : STORAGE_KEY_PREFIX + 'guest';
  }, [user]);

  // Cargar preferencias del usuario desde localStorage
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem(getStorageKey());
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...parsed });
        } else {
          setPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
        }
      } catch (err) {
        console.error('Error loading notification preferences:', err);
        setPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [getStorageKey]);

  // Guardar preferencias en localStorage
  const savePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving notification preferences:', err);
    }
  }, [preferences, getStorageKey]);

  // Resetear a valores por defecto
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(DEFAULT_NOTIFICATION_PREFERENCES));
    } catch (err) {
      console.error('Error resetting notification preferences:', err);
    }
  }, [getStorageKey]);

  // Actualizar una preferencia específica
  const updatePreference = useCallback(<K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    savePreferences({ [key]: value });
  }, [savePreferences]);

  return {
    preferences,
    isLoading,
    savePreferences,
    resetPreferences,
    updatePreference,
  };
}
