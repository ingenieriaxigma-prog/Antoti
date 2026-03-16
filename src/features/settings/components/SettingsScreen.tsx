/**
 * SettingsScreen Component
 * 
 * Main screen for app settings and user preferences
 * 
 * Features:
 * - User profile management
 * - Theme and appearance
 * - Language and currency
 * - Security settings (PIN)
 * - Data management (export/reset)
 * - About and help
 */

import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Palette, 
  Lock, 
  Download, 
  Info, 
  HelpCircle, 
  LogOut, 
  Users, 
  FlaskConical, 
  Sparkles, 
  Calculator, 
  FileUp,
  GraduationCap,
  Edit3,
  Camera
} from 'lucide-react';
import BottomNav from '../../../components/BottomNav';
import { OtiSpacerMessage } from '../../../components/OtiSpacerMessage'; // 📱 WhatsApp-style spacer
import { ThemeHeaderEffects } from '../../../components/ThemeHeaderEffects'; // 🎨 Import theme effects
import { SettingsService } from '../services';
import { useLocalization } from '../../../hooks/useLocalization';
import { getTodayLocalDate } from '../../../utils/dateUtils'; // ✅ Import getTodayLocalDate
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';

// 🎓 Tour System Imports
import { useTour } from '../../onboarding/tours/useTour';
import { PageTour } from '../../onboarding/tours/PageTour';
import { tourConfig } from '../../onboarding/tours/tourConfig';

// Import components
import SecuritySettings from '../../../components/SecuritySettings';
import { ThemeConfirmationAnimation } from '../../../components/ThemeConfirmationAnimation';
import { LanguageSelector } from '../../../components/LanguageSelector';
import { CurrencySelector } from '../../../components/CurrencySelector';

// 🎓 NEW: Import SettingsTour
import { SettingsTour, shouldShowSettingsTour } from '../../../components/tours/SettingsTour';

// Import types
import type { SettingsProps } from '../types';
import type { ThemeKey } from '../../../types/theme';

export function SettingsScreen({ 
  darkMode, 
  transactions, 
  accounts, 
  categories, 
  currentUser, 
  accessToken, 
  onToggleDarkMode, 
  onNavigate, 
  onResetData, 
  onRestartTour, 
  onLogout, 
  onUpdateProfile 
}: SettingsProps) {
  const { t } = useLocalization();
  
  // 🎓 NEW: Settings Tour state
  const [showSettingsTour, setShowSettingsTour] = useState(shouldShowSettingsTour());
  
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showThemeAnimation, setShowThemeAnimation] = useState(false);
  
  // Check if user is super user
  const isSuperUser = SettingsService.isSuperUser(currentUser?.email);
  
  // Get current theme
  const currentTheme = localStorage.getItem('colorTheme') || 'blue';
  
  // Storage usage
  const storageUsage = SettingsService.calculateStorageUsage();

  // Handle data export
  const handleExportData = () => {
    if (!currentUser) return;

    try {
      const exportData = SettingsService.exportData(
        currentUser.id,
        transactions,
        accounts,
        categories,
        [] // budgets would come from props
      );

      const filename = `finanzas-backup-${getTodayLocalDate()}.json`;
      SettingsService.downloadAsJSON(exportData, filename);
      
      toast.success(t('settings.exportSuccess'));
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error(t('settings.exportError'));
    }
  };

  // Handle data reset
  const handleResetData = () => {
    onResetData();
    setShowResetDialog(false);
    toast.success(t('settings.resetSuccess'));
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!onUpdateProfile || !currentUser) return;

    setIsUpdatingProfile(true);
    try {
      const updates: { name?: string; photoUrl?: string | null } = {};
      
      if (editName && editName !== currentUser.name) {
        updates.name = editName;
      }

      if (editPhotoFile) {
        // In a real app, you'd upload the file to storage and get a URL
        // For now, we'll use the preview URL
        updates.photoUrl = editPhotoPreview;
      }

      if (Object.keys(updates).length > 0) {
        await onUpdateProfile(updates);
        toast.success(t('settings.profileUpdated'));
      }

      setShowEditProfileDialog(false);
      setEditName('');
      setEditPhotoFile(null);
      setEditPhotoPreview(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('settings.profileUpdateError'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    setEditPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col mobile-screen-height bg-gray-50 dark:bg-gray-950">
      {/* ✅ HEADER: Same style as Budgets, Accounts and Statistics */}
      <div className="fixed-top-header bg-white dark:bg-gray-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm z-10 safe-area-top relative overflow-hidden">
        {/* 🎨 Efectos temáticos del header */}
        <ThemeHeaderEffects theme={currentTheme} />
        
        <div className="flex items-center justify-between gap-3 relative z-10">
          {/* Left: Back button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors touch-target-md tap-scale shrink-0"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
          </button>
          
          {/* Center: Title */}
          <h1 className="flex-1 text-center text-base sm:text-lg text-gray-900 dark:text-white">
            {t('settings.title')}
          </h1>
          
          {/* Right: Tour button (discreto) */}
          <button
            onClick={() => {
              console.log('🎓 Starting Settings Tour');
              setShowSettingsTour(true);
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors touch-target-md tap-scale shrink-0"
            aria-label="Start Settings tour"
          >
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto content-with-fixed-header-and-nav momentum-scroll">
        <div className="p-4 sm:p-6 space-y-6">
          {/* User Profile Card - Grande y Verde */}
          {currentUser && (
            <div 
              className="rounded-3xl p-6 shadow-lg relative overflow-hidden"
              style={{ backgroundColor: 'var(--theme-primary)' }}
              data-tour="settings-profile"
            >
              {/* Edit Button - Absolute positioned */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditName(currentUser.name);
                  setShowEditProfileDialog(true);
                }}
                className="absolute top-4 right-4 p-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-colors border border-white/30 z-50"
              >
                <Edit3 className="w-5 h-5 text-white" />
              </button>

              <div className="flex items-center gap-4 relative z-10 pr-12">
                <div className="w-20 h-20 aspect-square rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white overflow-hidden border-4 border-white/30 flex-shrink-0">
                  {currentUser.photoUrl ? (
                    <img src={currentUser.photoUrl} alt={currentUser.name} className="w-full h-full aspect-square object-cover" />
                  ) : (
                    <span className="text-3xl">{currentUser.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl text-white mb-1 truncate">{currentUser.name}</h2>
                  <p className="text-white/90 truncate">{currentUser.email}</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            </div>
          )}

          {/* FINANZAS Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 uppercase tracking-wider">
              {t('settings.finance')}
            </h2>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <button
                onClick={() => onNavigate('financial-advisor')}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800"
                data-tour="financial-advisor"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-white">Asesor Financiero IA</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Análisis y consejos personalizados</div>
                </div>
                <span className="text-gray-400">›</span>
              </button>

              <button
                onClick={() => onNavigate('tax')}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                data-tour="tax-declaration"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-white">Declaración de Renta</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Gestión tributaria y educación fiscal</div>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            </div>
          </div>

          {/* APARIENCIA Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 uppercase tracking-wider">
              {t('settings.appearance')}
            </h2>
            
            <div 
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
              data-tour="theme-selector"
            >
              <button
                onClick={onToggleDarkMode}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800"
              >
                <div className="w-12 h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  {darkMode ? <Moon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" /> : <Sun className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-white">{t('settings.darkMode')}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {darkMode ? 'Activado' : 'Desactivado'}
                  </div>
                </div>
                <span className="text-gray-400">›</span>
              </button>

              <button
                onClick={() => {
                  setShowThemeAnimation(true);
                  onNavigate('color-theme');
                }}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-white">{t('settings.colorTheme')}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {SettingsService.getThemeDisplayName(currentTheme)}
                  </div>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            </div>
          </div>

          {/* DATOS Y SEGURIDAD Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 uppercase tracking-wider">
              {t('settings.dataAndSecurity')}
            </h2>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <button
                onClick={() => onNavigate('bank-statement')}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800"
                data-tour="notifications-settings"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <FileUp className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-white">Cargar Extracto Bancario</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Importar transacciones desde extracto</div>
                </div>
                <span className="text-gray-400">›</span>
              </button>

              <button
                onClick={() => setShowSecuritySettings(true)}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                data-tour="security-settings"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-white">Seguridad</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">PIN/Huella</div>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            </div>
          </div>

          {/* LOCALIZACIÓN Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 uppercase tracking-wider">
              {t('settings.localization')}
            </h2>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <LanguageSelector />
              </div>
              <div className="px-5 py-4">
                <CurrencySelector />
              </div>
            </div>
          </div>

          {/* EXPORTAR Section */}
          <div className="space-y-3">
            <div 
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
              data-tour="settings-data"
            >
              <button
                onClick={handleExportData}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                data-tour="export-csv"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Download className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-white">Exportar a CSV</div>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            </div>
          </div>

          {/* INFORMACIÓN Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 uppercase tracking-wider">
              {t('settings.information')}
            </h2>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <button
                onClick={() => onNavigate('about')}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-white">Acerca de</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Versión {SettingsService.getAppVersion()}</div>
                </div>
                <span className="text-gray-400">›</span>
              </button>

              <button
                onClick={onRestartTour}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-white">Ver Tour de Producto</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Volver a ver el tutorial</div>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            </div>
          </div>

          {/* Admin Section (Super Users Only) */}
          {isSuperUser && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 uppercase tracking-wider">Admin</h2>
              
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <button
                  onClick={() => onNavigate('admin-panel')}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Panel de Administración</div>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>

                <button
                  onClick={() => onNavigate('testing-dashboard')}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-white">🧪 Testing Dashboard</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Panel completo de tests</div>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
              </div>
            </div>
          )}

          {/* Logout Button - Grande y Rojo */}
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-md"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('settings.logout')}</span>
          </button>

          {/* Version Info */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 pb-4">
            <p>© 2026 Xigma Ing. Todos los derechos reservados - Ing. Fabian S.M.S. </p>
          </div>
          
          {/* WhatsApp-style Spacer */}
          <OtiSpacerMessage
            message="Has llegado al final de configuración. Pregúntale a Oti sobre cómo usar la app"
            show={true}
          />
        </div>
      </div>

      {/* Security Settings Modal */}
      {showSecuritySettings && currentUser && (
        <SecuritySettings
          isOpen={showSecuritySettings}
          onClose={() => setShowSecuritySettings(false)}
          darkMode={darkMode}
          userId={currentUser.id}
        />
      )}

      {/* Theme Animation */}
      {showThemeAnimation && (
        <ThemeConfirmationAnimation
          theme={currentTheme as ThemeKey}
          onComplete={() => setShowThemeAnimation(false)}
        />
      )}

      {/* Reset Data Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.resetDataTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.resetDataConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowResetDialog(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetData}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.logoutTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.logoutConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLogoutDialog(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('settings.logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Profile Dialog */}
      <AlertDialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Editar Perfil</AlertDialogTitle>
            <AlertDialogDescription>
              Actualiza tu información personal
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-24 h-24 aspect-square rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {editPhotoPreview ? (
                    <img src={editPhotoPreview} alt="Preview" className="w-full h-full aspect-square object-cover" />
                  ) : currentUser?.photoUrl ? (
                    <img src={currentUser.photoUrl} alt="Profile" className="w-full h-full aspect-square object-cover" />
                  ) : (
                    <span className="text-4xl">{editName.charAt(0).toUpperCase() || '👤'}</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-blue-500 hover:bg-blue-600 rounded-full cursor-pointer shadow-lg transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Tu nombre"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={currentUser?.email || ''}
                disabled
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowEditProfileDialog(false);
                setEditName('');
                setEditPhotoFile(null);
                setEditPhotoPreview(null);
              }}
              disabled={isUpdatingProfile}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUpdateProfile}
              disabled={isUpdatingProfile || !editName.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdatingProfile ? 'Guardando...' : 'Guardar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="settings" onNavigate={onNavigate} />
      
      {/* 🎓 Tour System */}
      {showSettingsTour && (
        <SettingsTour onComplete={() => setShowSettingsTour(false)} />
      )}
    </div>
  );
}