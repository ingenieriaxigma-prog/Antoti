/**
 * 🔔 NOTIFICATIONS PANEL
 * 
 * Panel unificado de notificaciones con tabs para Todas/Grupos/Personales.
 * Sistema híbrido inteligente de notificaciones.
 */

import React, { useState, useEffect } from 'react';
import { X, Bell, Users, User, Check, Trash2, Filter, Settings, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UnifiedNotification, NotificationCategory, NotificationFilter } from '../../types/notifications.types';
import { NotificationItem } from './NotificationItem';
import { NotificationSettings } from './NotificationSettings';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: UnifiedNotification[];
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (notificationId: string) => void;
  onNotificationClick?: (notification: UnifiedNotification) => void;
  onRefresh?: () => void;
}

export function NotificationsPanel({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNotificationClick,
  onRefresh,
}: NotificationsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debug: Log cuando cambia showSettings
  useEffect(() => {
    console.log('🔧 Settings modal:', showSettings ? 'ABIERTO' : 'CERRADO');
  }, [showSettings]);

  // Filtrar notificaciones según el tab activo
  const filteredNotifications = notifications.filter(notification => {
    // Filtro por categoría
    if (activeFilter === 'group' && notification.category !== NotificationCategory.GROUP) {
      return false;
    }
    if (activeFilter === 'personal' && notification.category !== NotificationCategory.PERSONAL) {
      return false;
    }
    
    // Filtro por leídas/no leídas
    if (showOnlyUnread && notification.read) {
      return false;
    }
    
    return true;
  });

  // Contar notificaciones por categoría
  const groupCount = notifications.filter(n => n.category === NotificationCategory.GROUP && !n.read).length;
  const personalCount = notifications.filter(n => n.category === NotificationCategory.PERSONAL && !n.read).length;

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="notifications-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              key="notifications-panel"
              initial={{ opacity: 0, x: 320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
            >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Notificaciones</h2>
                    <p className="text-xs text-white/80">
                      {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {onRefresh && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        setIsRefreshing(true);
                        try {
                          await onRefresh();
                        } finally {
                          setIsRefreshing(false);
                        }
                      }}
                      disabled={isRefreshing}
                      className={`w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        isRefreshing ? 'cursor-not-allowed opacity-70' : 'hover:scale-110 active:scale-95'
                      }`}
                      aria-label="Actualizar"
                      title="Actualizar notificaciones"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('🔧 Abriendo configuración...');
                      setShowSettings(true);
                    }}
                    className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
                    aria-label="Configuración"
                    title="Configurar notificaciones"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <TabButton
                  label="Todas"
                  count={unreadCount}
                  isActive={activeFilter === 'all'}
                  onClick={() => setActiveFilter('all')}
                  icon={Bell}
                />
                <TabButton
                  label="Grupos"
                  count={groupCount}
                  isActive={activeFilter === 'group'}
                  onClick={() => setActiveFilter('group')}
                  icon={Users}
                />
                <TabButton
                  label="Personal"
                  count={personalCount}
                  isActive={activeFilter === 'personal'}
                  onClick={() => setActiveFilter('personal')}
                  icon={User}
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
              {filteredNotifications.length > 0 ? (
                <>
                  <button
                    onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      showOnlyUnread
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    No leídas
                  </button>
                </>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {activeFilter === 'all' && 'Todas las notificaciones'}
                  {activeFilter === 'group' && 'Notificaciones de grupos'}
                  {activeFilter === 'personal' && 'Notificaciones personales'}
                </div>
              )}
              
              {/* Botón de Configuración siempre visible */}
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Configurar notificaciones"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Configurar</span>
              </button>
            </div>

            {/* Actions secundarias */}
            {filteredNotifications.length > 0 && unreadCount > 0 && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                  onClick={onMarkAllAsRead}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Marcar todas como leídas
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <EmptyState filter={activeFilter} showOnlyUnread={showOnlyUnread} />
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                      onDelete={onDelete}
                      onClick={onNotificationClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
        )}
      </AnimatePresence>
      
      {/* Modal de Configuración - Fuera de AnimatePresence principal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              key="settings-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <NotificationSettings onClose={() => {
                console.log('🔧 Cerrando configuración...');
                setShowSettings(false);
              }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Botón de Tab
 */
interface TabButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  icon: React.ElementType;
}

function TabButton({ label, count, isActive, onClick, icon: Icon }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? 'bg-white/20 text-white shadow-lg'
          : 'text-white/70 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
        {count > 0 && (
          <span className={`px-1.5 py-0.5 text-xs rounded-full ${
            isActive ? 'bg-white/30' : 'bg-white/20'
          }`}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
    </button>
  );
}

/**
 * Estado vacío
 */
function EmptyState({ filter, showOnlyUnread }: { filter: NotificationFilter; showOnlyUnread: boolean }) {
  const getMessage = () => {
    if (showOnlyUnread) {
      return '¡Genial! No tienes notificaciones sin leer.';
    }
    
    switch (filter) {
      case 'group':
        return 'No tienes notificaciones de grupos.';
      case 'personal':
        return 'No tienes notificaciones personales.';
      default:
        return 'No tienes notificaciones.';
    }
  };

  const getEmoji = () => {
    if (showOnlyUnread) return '✨';
    return filter === 'group' ? '👥' : filter === 'personal' ? '👤' : '🔔';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full px-4 py-16 text-center"
    >
      <div className="text-6xl mb-4">{getEmoji()}</div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        {getMessage()}
      </p>
    </motion.div>
  );
}
