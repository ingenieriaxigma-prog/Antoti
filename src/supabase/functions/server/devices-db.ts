/**
 * 📱 USER DEVICES - DATABASE HELPER
 * 
 * Funciones para interactuar con la tabla user_devices_727b50c3
 * Reemplaza el uso del KV store para información de dispositivos
 * 
 * Migración: KV store (user:{userId}:device) → SQL (user_devices_727b50c3)
 */

import { createClient } from "npm:@supabase/supabase-js@2";

// =====================
// TYPES
// =====================

export interface UserDevice {
  id: string;
  user_id: string;
  device_id: string;
  device_name?: string;
  device_model?: string;
  device_brand?: string;
  os_name?: string;
  os_version?: string;
  app_version?: string;
  ip_address?: string;
  country?: string;
  city?: string;
  is_active: boolean;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName?: string;
  platform?: string;
  osVersion?: string;
  appVersion?: string;
  ipAddress?: string;
  userAgent?: string;
  screenSize?: string;
  language?: string;
  timezone?: string;
  lastAccess?: string;
}

// =====================
// CREATE / UPDATE
// =====================

/**
 * Guardar o actualizar información del dispositivo
 * Si el dispositivo ya existe, actualiza last_seen_at
 * Si no existe, crea un nuevo registro
 */
export async function upsertDeviceInfo(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  deviceInfo: DeviceInfo
): Promise<UserDevice> {
  // Preparar datos para insertar/actualizar
  const deviceData = {
    user_id: userId,
    device_id: deviceInfo.deviceId,
    device_name: deviceInfo.deviceName || null,
    os_name: deviceInfo.platform || null,
    os_version: deviceInfo.osVersion || null,
    app_version: deviceInfo.appVersion || null,
    ip_address: deviceInfo.ipAddress || null,
    is_active: true,
    last_seen_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // UPSERT: Insert si no existe, update si existe (basado en unique constraint user_id + device_id)
  const { data, error } = await supabase
    .from('user_devices_727b50c3')
    .upsert(deviceData, {
      onConflict: 'user_id,device_id',
      ignoreDuplicates: false, // Actualizar si existe
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error upserting device info:', error);
    throw new Error(`Error al guardar info del dispositivo: ${error.message}`);
  }

  console.log(`✅ Device info saved for user ${userId.substring(0, 8)}, device ${deviceInfo.deviceId.substring(0, 8)}`);
  
  return data;
}

// =====================
// READ
// =====================

/**
 * Obtener información del dispositivo actual de un usuario
 * Devuelve el dispositivo más reciente (last_seen_at)
 */
export async function getUserDeviceInfo(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<DeviceInfo | null> {
  const { data, error } = await supabase
    .from('user_devices_727b50c3')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_seen_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('❌ Error getting device info:', error);
    // No lanzar error, devolver null para compatibilidad
    return null;
  }

  if (!data) {
    return null;
  }

  // Mapear de formato DB a formato DeviceInfo (compatibilidad con código existente)
  return {
    deviceId: data.device_id,
    deviceName: data.device_name || undefined,
    platform: data.os_name || undefined,
    osVersion: data.os_version || undefined,
    appVersion: data.app_version || undefined,
    ipAddress: data.ip_address || undefined,
    lastAccess: data.last_seen_at,
  };
}

/**
 * Obtener todos los dispositivos de un usuario
 */
export async function getUserDevices(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  options?: {
    activeOnly?: boolean;
    limit?: number;
  }
): Promise<UserDevice[]> {
  let query = supabase
    .from('user_devices_727b50c3')
    .select('*')
    .eq('user_id', userId)
    .order('last_seen_at', { ascending: false });

  if (options?.activeOnly) {
    query = query.eq('is_active', true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Error getting user devices:', error);
    throw new Error(`Error al obtener dispositivos: ${error.message}`);
  }

  return data || [];
}

// =====================
// DELETE
// =====================

/**
 * Desactivar un dispositivo (soft delete)
 */
export async function deactivateDevice(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  deviceId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_devices_727b50c3')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('device_id', deviceId);

  if (error) {
    console.error('❌ Error deactivating device:', error);
    throw new Error(`Error al desactivar dispositivo: ${error.message}`);
  }

  console.log(`✅ Device ${deviceId.substring(0, 8)} deactivated for user ${userId.substring(0, 8)}`);
}

/**
 * Eliminar todos los dispositivos de un usuario (hard delete)
 * Se usa cuando se elimina el usuario completamente
 */
export async function deleteUserDevices(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<number> {
  const { data, error } = await supabase
    .from('user_devices_727b50c3')
    .delete()
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('❌ Error deleting user devices:', error);
    throw new Error(`Error al eliminar dispositivos: ${error.message}`);
  }

  const deletedCount = data?.length || 0;
  console.log(`✅ Deleted ${deletedCount} devices for user ${userId.substring(0, 8)}`);
  
  return deletedCount;
}

// =====================
// STATS
// =====================

/**
 * Obtener estadísticas de dispositivos del usuario
 */
export async function getUserDeviceStats(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<{
  total: number;
  active: number;
  platforms: Record<string, number>;
  lastSeen: string | null;
}> {
  const devices = await getUserDevices(supabase, userId);

  const stats = {
    total: devices.length,
    active: devices.filter(d => d.is_active).length,
    platforms: {} as Record<string, number>,
    lastSeen: devices[0]?.last_seen_at || null,
  };

  // Contar por plataforma
  devices.forEach(device => {
    const platform = device.os_name || 'Unknown';
    stats.platforms[platform] = (stats.platforms[platform] || 0) + 1;
  });

  return stats;
}
