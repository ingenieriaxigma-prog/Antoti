/**
 * 🔔 NOTIFICATIONS - DATABASE HELPER
 * 
 * Funciones para interactuar con la tabla notifications_727b50c3
 * Sistema de notificaciones unificado para toda la aplicación
 * 
 * Migración: KV store (family_notification:*) → SQL (notifications_727b50c3)
 */

import { createClient } from "npm:@supabase/supabase-js@2";

// =====================
// TYPES
// =====================

export type NotificationType =
  | 'invitation_received'
  | 'invitation_accepted'
  | 'member_joined'
  | 'member_left'
  | 'transaction_shared'
  | 'transaction_comment'
  | 'transaction_reaction'
  | 'budget_alert'
  | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any> | null;
  priority: NotificationPriority;
  read: boolean;
  created_by: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
  read_at: string | null;
}

// =====================
// CREATE
// =====================

/**
 * Crear notificación
 */
export async function createNotification(
  supabase: ReturnType<typeof createClient>,
  data: {
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    priority?: NotificationPriority;
    created_by?: string;
    related_entity_type?: string;
    related_entity_id?: string;
  }
): Promise<Notification> {
  const { data: notification, error } = await supabase
    .from('notifications_727b50c3')
    .insert({
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || null,
      priority: data.priority || 'normal',
      read: false,
      created_by: data.created_by || null,
      related_entity_type: data.related_entity_type || null,
      related_entity_id: data.related_entity_id || null,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating notification:', error);
    throw new Error(`Error al crear notificación: ${error.message}`);
  }

  return notification;
}

/**
 * Crear notificaciones para múltiples usuarios (batch)
 */
export async function createNotificationsForUsers(
  supabase: ReturnType<typeof createClient>,
  userIds: string[],
  data: {
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    priority?: NotificationPriority;
    created_by?: string;
    related_entity_type?: string;
    related_entity_id?: string;
  }
): Promise<Notification[]> {
  const notifications = userIds.map(userId => ({
    user_id: userId,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data || null,
    priority: data.priority || 'normal',
    read: false,
    created_by: data.created_by || null,
    related_entity_type: data.related_entity_type || null,
    related_entity_id: data.related_entity_id || null,
  }));

  const { data: created, error } = await supabase
    .from('notifications_727b50c3')
    .insert(notifications)
    .select();

  if (error) {
    console.error('❌ Error creating bulk notifications:', error);
    throw new Error(`Error al crear notificaciones: ${error.message}`);
  }

  return created || [];
}

// =====================
// READ
// =====================

/**
 * Obtener notificación por ID
 */
export async function getNotificationById(
  supabase: ReturnType<typeof createClient>,
  notificationId: string
): Promise<Notification | null> {
  const { data, error } = await supabase
    .from('notifications_727b50c3')
    .select('*')
    .eq('id', notificationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('❌ Error getting notification:', error);
    throw new Error(`Error al obtener notificación: ${error.message}`);
  }

  return data;
}

/**
 * Obtener notificaciones de un usuario
 */
export async function getUserNotifications(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
    type?: NotificationType;
  }
): Promise<Notification[]> {
  let query = supabase
    .from('notifications_727b50c3')
    .select('*')
    .eq('user_id', userId);

  if (options?.unreadOnly) {
    query = query.eq('read', false);
  }

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  query = query.order('created_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Error getting user notifications:', error);
    throw new Error(`Error al obtener notificaciones: ${error.message}`);
  }

  return data || [];
}

/**
 * Contar notificaciones no leídas
 */
export async function countUnreadNotifications(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('notifications_727b50c3')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('❌ Error counting unread notifications:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Obtener notificaciones relacionadas con una entidad
 */
export async function getRelatedNotifications(
  supabase: ReturnType<typeof createClient>,
  entityType: string,
  entityId: string
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications_727b50c3')
    .select('*')
    .eq('related_entity_type', entityType)
    .eq('related_entity_id', entityId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error getting related notifications:', error);
    throw new Error(`Error al obtener notificaciones relacionadas: ${error.message}`);
  }

  return data || [];
}

// =====================
// UPDATE
// =====================

/**
 * Marcar notificación como leída
 */
export async function markAsRead(
  supabase: ReturnType<typeof createClient>,
  notificationId: string
): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications_727b50c3')
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error marking notification as read:', error);
    throw new Error(`Error al marcar como leída: ${error.message}`);
  }

  return data;
}

/**
 * Marcar todas las notificaciones de un usuario como leídas
 */
export async function markAllAsRead(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<number> {
  const { data, error } = await supabase
    .from('notifications_727b50c3')
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('read', false)
    .select('id');

  if (error) {
    console.error('❌ Error marking all as read:', error);
    throw new Error(`Error al marcar todas como leídas: ${error.message}`);
  }

  return data?.length || 0;
}

/**
 * Marcar notificación como no leída
 */
export async function markAsUnread(
  supabase: ReturnType<typeof createClient>,
  notificationId: string
): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications_727b50c3')
    .update({
      read: false,
      read_at: null,
    })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error marking notification as unread:', error);
    throw new Error(`Error al marcar como no leída: ${error.message}`);
  }

  return data;
}

// =====================
// DELETE
// =====================

/**
 * Eliminar notificación
 */
export async function deleteNotification(
  supabase: ReturnType<typeof createClient>,
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from('notifications_727b50c3')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('❌ Error deleting notification:', error);
    throw new Error(`Error al eliminar notificación: ${error.message}`);
  }
}

/**
 * Eliminar todas las notificaciones de un usuario
 */
export async function deleteUserNotifications(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  readOnly: boolean = false
): Promise<number> {
  let query = supabase
    .from('notifications_727b50c3')
    .delete()
    .eq('user_id', userId);

  if (readOnly) {
    query = query.eq('read', true);
  }

  const { data, error } = await query.select('id');

  if (error) {
    console.error('❌ Error deleting user notifications:', error);
    throw new Error(`Error al eliminar notificaciones: ${error.message}`);
  }

  return data?.length || 0;
}

/**
 * Eliminar notificaciones relacionadas con una entidad
 */
export async function deleteRelatedNotifications(
  supabase: ReturnType<typeof createClient>,
  entityType: string,
  entityId: string
): Promise<number> {
  const { data, error } = await supabase
    .from('notifications_727b50c3')
    .delete()
    .eq('related_entity_type', entityType)
    .eq('related_entity_id', entityId)
    .select('id');

  if (error) {
    console.error('❌ Error deleting related notifications:', error);
    throw new Error(`Error al eliminar notificaciones relacionadas: ${error.message}`);
  }

  return data?.length || 0;
}

// =====================
// ANALYTICS (usando funciones de DB)
// =====================

/**
 * Obtener estadísticas de notificaciones de un usuario
 */
export async function getUserNotificationStats(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<{
  total: number;
  unread: number;
  by_type: Record<NotificationType, number>;
  by_priority: Record<NotificationPriority, number>;
} | null> {
  // Obtener todas las notificaciones
  const { data: notifications, error } = await supabase
    .from('notifications_727b50c3')
    .select('type, priority, read')
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Error getting notification stats:', error);
    return null;
  }

  if (!notifications || notifications.length === 0) {
    return {
      total: 0,
      unread: 0,
      by_type: {} as Record<NotificationType, number>,
      by_priority: {} as Record<NotificationPriority, number>,
    };
  }

  // Calcular estadísticas
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    by_type: {} as Record<NotificationType, number>,
    by_priority: {} as Record<NotificationPriority, number>,
  };

  notifications.forEach(n => {
    stats.by_type[n.type] = (stats.by_type[n.type] || 0) + 1;
    stats.by_priority[n.priority] = (stats.by_priority[n.priority] || 0) + 1;
  });

  return stats;
}
