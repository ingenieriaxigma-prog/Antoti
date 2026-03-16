/**
 * SettingsService - Business Logic for Settings
 * 
 * Handles settings-related operations like data export/import,
 * user preferences, and app configuration
 */

import type { ExportData, SecuritySettings, AppPreferences } from '../types';

export class SettingsService {
  /**
   * Export all user data to JSON
   */
  static exportData(
    userId: string,
    transactions: any[],
    accounts: any[],
    categories: any[],
    budgets: any[]
  ): ExportData {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      userId,
      transactions,
      accounts,
      categories,
      budgets,
    };
  }

  /**
   * Convert data to downloadable JSON file
   */
  static downloadAsJSON(data: ExportData, filename = 'finanzas-backup.json'): void {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Get security settings for a user
   */
  static getSecuritySettings(userId: string): SecuritySettings | null {
    try {
      const stored = localStorage.getItem(`security_${userId}`);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading security settings:', error);
      return null;
    }
  }

  /**
   * Save security settings for a user
   */
  static saveSecuritySettings(userId: string, settings: SecuritySettings): void {
    try {
      localStorage.setItem(`security_${userId}`, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving security settings:', error);
      throw error;
    }
  }

  /**
   * Get app preferences
   */
  static getAppPreferences(): AppPreferences {
    try {
      const language = localStorage.getItem('language') || 'es';
      const currency = localStorage.getItem('currency') || 'COP';
      const darkMode = localStorage.getItem('darkMode') === 'true';
      const theme = localStorage.getItem('colorTheme') || 'blue';
      const notifications = localStorage.getItem('notifications') !== 'false';

      return {
        language,
        currency,
        darkMode,
        theme,
        notifications,
      };
    } catch (error) {
      console.error('Error loading app preferences:', error);
      return {
        language: 'es',
        currency: 'COP',
        darkMode: false,
        theme: 'blue',
        notifications: true,
      };
    }
  }

  /**
   * Save app preferences
   */
  static saveAppPreferences(preferences: Partial<AppPreferences>): void {
    try {
      if (preferences.language !== undefined) {
        localStorage.setItem('language', preferences.language);
      }
      if (preferences.currency !== undefined) {
        localStorage.setItem('currency', preferences.currency);
      }
      if (preferences.darkMode !== undefined) {
        localStorage.setItem('darkMode', String(preferences.darkMode));
      }
      if (preferences.theme !== undefined) {
        localStorage.setItem('colorTheme', preferences.theme);
      }
      if (preferences.notifications !== undefined) {
        localStorage.setItem('notifications', String(preferences.notifications));
      }
    } catch (error) {
      console.error('Error saving app preferences:', error);
      throw error;
    }
  }

  /**
   * Calculate storage usage
   */
  static calculateStorageUsage(): {
    used: number;
    total: number;
    percentage: number;
  } {
    let used = 0;
    
    try {
      // Calculate size of all localStorage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          used += key.length + value.length;
        }
      }

      // Convert to KB
      used = used / 1024;

      // Typical localStorage limit is 5-10MB, we'll assume 5MB
      const total = 5 * 1024; // 5MB in KB
      const percentage = (used / total) * 100;

      return {
        used: Math.round(used),
        total,
        percentage: Math.round(percentage),
      };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return { used: 0, total: 5120, percentage: 0 };
    }
  }

  /**
   * Validate PIN format
   */
  static validatePIN(pin: string): { valid: boolean; error?: string } {
    if (!pin) {
      return { valid: false, error: 'El PIN no puede estar vacío' };
    }

    if (pin.length !== 4) {
      return { valid: false, error: 'El PIN debe tener 4 dígitos' };
    }

    if (!/^\d+$/.test(pin)) {
      return { valid: false, error: 'El PIN solo puede contener números' };
    }

    // Check for weak PINs
    const weakPins = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321'];
    if (weakPins.includes(pin)) {
      return { valid: false, error: 'Este PIN es muy débil. Elige otro' };
    }

    return { valid: true };
  }

  /**
   * Check if user is super user (admin)
   */
  static isSuperUser(email: string | undefined): boolean {
    if (!email) return false;
    
    const SUPER_USERS = [
      'ingenieriaxigma@gmail.com',
    ];
    
    return SUPER_USERS.includes(email.toLowerCase());
  }

  /**
   * Get app version
   */
  static getAppVersion(): string {
    return '1.0.0';
  }

  /**
   * Get app build date
   */
  static getBuildDate(): string {
    return '2024-11-19';
  }

  /**
   * Clear all app data
   */
  static clearAllData(userId: string): void {
    const keysToRemove = [
      `transactions_${userId}`,
      `accounts_${userId}`,
      `categories_${userId}`,
      `budgets_${userId}`,
      `security_${userId}`,
    ];

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing ${key}:`, error);
      }
    });
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Get theme display name
   */
  static getThemeDisplayName(themeKey: string, locale = 'es'): string {
    const names: Record<string, Record<string, string>> = {
      es: {
        blue: 'Azul',
        green: 'Verde',
        purple: 'Morado',
        orange: 'Naranja',
        pink: 'Rosa',
        teal: 'Turquesa',
        christmas: 'Navidad',
        rainbow: 'Unisex',
      },
      en: {
        blue: 'Blue',
        green: 'Green',
        purple: 'Purple',
        orange: 'Orange',
        pink: 'Pink',
        teal: 'Teal',
        christmas: 'Christmas',
        rainbow: 'Rainbow',
      },
    };

    return names[locale]?.[themeKey] || themeKey;
  }
}
