/**
 * 🔔 NOTIFICATION ITEM
 * 
 * Componente individual para cada notificación.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Check, 
  Trash2, 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp, 
  Bell,
  MessageCircle,
  Heart,
  UserPlus,
  Target,
  AlertCircle,
  ChevronRight,
  PieChart,
  Wallet
} from 'lucide-react';
import { NotificationType, NotificationPriority, type UnifiedNotification } from '../../types/notifications.types';
import { otiConfirm } from '../ui/OtiConfirmDialog';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface NotificationItemProps {
  notification: UnifiedNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: UnifiedNotification) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.priority);

  const handleClick = () => {
    console.log('🔔 NotificationItem clicked:', notification);
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (onClick) {
      console.log('🔔 Calling onClick handler');
      onClick(notification);
    } else {
      console.warn('⚠️ No onClick handler provided');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onClick={handleClick}
      className={`relative group cursor-pointer ${
        notification.read ? 'bg-white dark:bg-gray-900' : 'bg-emerald-50 dark:bg-emerald-900/10'
      } hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
    >
      {/* Indicador de no leído */}
      {!notification.read && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${color.bg}`} />
      )}

      <div className="p-4 flex gap-3">
        {/* Icono */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${color.bg} ${color.text} flex items-center justify-center`}>
          {React.createElement(icon, { className: 'w-5 h-5' })}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {formatDistanceToNow(notification.timestamp)}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {notification.message}
          </p>

          {/* Usuario que disparó la notificación (para grupales) */}
          {notification.category === 'group' && notification.triggeredBy && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
              <div className="w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center">
                <span className="text-[10px]">
                  {notification.triggeredBy.userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span>{notification.triggeredBy.userName}</span>
              {notification.category === 'group' && (
                <>
                  <span>•</span>
                  <span>{notification.groupName}</span>
                </>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-2 mt-2">
            {notification.actionUrl && (
              <button
                onClick={handleClick}
                className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                Ver detalles
                <ChevronRight className="w-3 h-3" />
              </button>
            )}

            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="ml-auto text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Marcar leída
              </button>
            )}

            {/* Botón de eliminar - siempre visible en móvil, hover en desktop */}
            <button
              onClick={async (e) => {
                e.stopPropagation();
                const confirmed = await otiConfirm({
                  title: '¿Eliminar notificación?',
                  description: 'Esta acción no se puede deshacer.',
                  variant: 'danger',
                  confirmText: 'Eliminar',
                  cancelText: 'Cancelar'
                });
                
                if (confirmed) {
                  onDelete(notification.id);
                }
              }}
              className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors sm:opacity-0 sm:group-hover:opacity-100 flex items-center gap-1"
              title="Eliminar notificación"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Obtener icono según tipo de notificación
 */
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case NotificationType.GROUP_INVITATION:
      return Users;
    case NotificationType.GROUP_NEW_TRANSACTION:
      return DollarSign;
    case NotificationType.GROUP_COMMENT:
      return MessageCircle;
    case NotificationType.GROUP_REACTION:
      return Heart;
    case NotificationType.GROUP_NEW_MEMBER:
      return UserPlus;
    case NotificationType.GROUP_GOAL_REACHED:
      return Target;
    case NotificationType.GROUP_BUDGET_WARNING:
      return AlertCircle;
    case NotificationType.PERSONAL_BUDGET_WARNING:
    case NotificationType.PERSONAL_BUDGET_EXCEEDED:
      return AlertCircle;
    case NotificationType.PERSONAL_UNUSUAL_SPENDING:
      return TrendingUp;
    case NotificationType.PERSONAL_RECURRING_PAYMENT:
      return Calendar;
    case NotificationType.PERSONAL_WEEKLY_SUMMARY:
    case NotificationType.PERSONAL_MONTHLY_SUMMARY:
      return PieChart;
    case NotificationType.PERSONAL_GOAL_REACHED:
      return Target;
    case NotificationType.PERSONAL_LOW_BALANCE:
      return Wallet;
    default:
      return AlertCircle;
  }
}

/**
 * Obtener color según prioridad
 */
function getNotificationColor(priority: NotificationPriority) {
  switch (priority) {
    case NotificationPriority.URGENT:
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-600 dark:text-red-400',
      };
    case NotificationPriority.HIGH:
      return {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-600 dark:text-orange-400',
      };
    case NotificationPriority.MEDIUM:
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-600 dark:text-emerald-400',
      };
    case NotificationPriority.LOW:
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-600 dark:text-gray-400',
      };
  }
}