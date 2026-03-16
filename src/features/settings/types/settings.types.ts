/**
 * Settings Types
 * 
 * TypeScript type definitions for the settings feature
 */

/**
 * User profile data
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  photoUrl?: string | null;
}

/**
 * Main settings props
 */
export interface SettingsProps {
  darkMode: boolean;
  transactions: any[];
  accounts: any[];
  categories: any[];
  currentUser: UserProfile | null;
  accessToken: string | null;
  onToggleDarkMode: () => void;
  onNavigate: (screen: string) => void;
  onResetData: () => void;
  onRestartTour: () => void;
  onLogout: () => void;
  onUpdateProfile?: (updates: { name?: string; photoUrl?: string | null }) => void;
}

/**
 * Security settings
 */
export interface SecuritySettings {
  pinEnabled: boolean;
  pin?: string;
  biometricEnabled: boolean;
  autoLockTime: number; // in minutes
  requirePinOnLaunch: boolean;
}

/**
 * App preferences
 */
export interface AppPreferences {
  language: string;
  currency: string;
  darkMode: boolean;
  theme: string;
  notifications: boolean;
}

/**
 * Data export format
 */
export interface ExportData {
  version: string;
  exportDate: string;
  userId: string;
  transactions: any[];
  accounts: any[];
  categories: any[];
  budgets: any[];
}

/**
 * Settings section
 */
export interface SettingsSection {
  id: string;
  title: string;
  icon: any;
  items: SettingsItem[];
}

/**
 * Settings item
 */
export interface SettingsItem {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  value?: string;
  badge?: string;
  danger?: boolean;
}
