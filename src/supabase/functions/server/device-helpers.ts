/**
 * =====================================================
 * DEVICE INFO HELPERS - Production Ready
 * =====================================================
 * 
 * Manejo de información de dispositivos de usuarios.
 * Sin logs sensibles, optimizado para producción.
 * 
 * =====================================================
 */

import { createServiceClient } from './auth-helpers.ts';
import * as devicesDb from './devices-db.ts';

export interface DeviceInfo {
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  userAgent: string;
}

/**
 * Parse user agent string to extract device info
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();
  
  // Detect Browser
  let browser = 'Unknown';
  if (ua.includes('edg/')) browser = 'Edge';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('opera') || ua.includes('opr/')) browser = 'Opera';
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os x')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  // Detect Device Type
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'Tablet';
  }
  
  return {
    browser,
    os,
    deviceType,
    userAgent,
  };
}

/**
 * Save device info to database (non-blocking)
 */
export async function saveDeviceInfo(userId: string, userAgent: string): Promise<DeviceInfo> {
  const deviceInfo = parseUserAgent(userAgent);
  
  try {
    const supabase = createServiceClient();

    const deviceData: devicesDb.DeviceInfo = {
      deviceId: `${deviceInfo.browser}-${deviceInfo.os}-${deviceInfo.deviceType}`.toLowerCase().replace(/\s+/g, '-'),
      deviceName: `${deviceInfo.browser} on ${deviceInfo.os}`,
      platform: deviceInfo.os,
      osVersion: deviceInfo.os,
      appVersion: '1.0.0',
      userAgent: deviceInfo.userAgent,
      lastAccess: new Date().toISOString(),
    };
    
    await devicesDb.upsertDeviceInfo(supabase, userId, deviceData);
    console.log('💾 Device info saved');
    
    return deviceInfo;
  } catch (error) {
    console.error('⚠️ Error saving device info:', error);
    return deviceInfo;
  }
}
