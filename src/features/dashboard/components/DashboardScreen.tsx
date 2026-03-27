/**
 * DashboardScreen Component
 * 
 * Main dashboard screen showing overview of finances
 * 
 * Features:
 * - Account balances summary
 * - Monthly income/expense overview
 * - Recent transactions
 * - Budget alerts
 * - Quick actions (Speed Dial)
 * - Voice recognition
 */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, Bell, Settings, Sun, Moon, Calendar, LayoutGrid, TrendingUp, TrendingDown, ArrowLeftRight, X, HelpCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { parseLocalDate, formatLocalDate, getTodayLocalDate } from '../../../utils/dateUtils'; // ✅ Import getTodayLocalDate
import BottomNav from '../../../components/BottomNav';
import TransactionItem from '../../../components/dashboard/TransactionItem';
import ThemeDecorations from '../../../components/ThemeDecorations';
import VoiceRecognition, { VoiceCommand } from '../../../components/VoiceRecognition';
import { useLocalization } from '../../../hooks/useLocalization';
import { useApp } from '../../../contexts/AppContext'; // ✅ NEW: Import useApp hook
import { useGlobalInvitations } from '../../../contexts/InvitationsContext'; // ✨ Import invitations
import { useUnifiedNotifications } from '../../../hooks/useUnifiedNotifications'; // 🔔 Import unified notifications
import { NotificationsPanel } from '../../../components/notifications/NotificationsPanel'; // 🔔 Import panel
import { OtiLoader } from '../../../components/OtiLoader'; // 🎨 Import Oti Loader
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback'; // ✅ Import ImageWithFallback
import { OtiSpacerMessage } from '../../../components/OtiSpacerMessage'; // 📱 WhatsApp-style spacer
import { OtiLogo } from '../../../components/OtiLogo'; // ✅ Import Oti logo adaptativo
import { ThemeHeaderEffects } from '../../../components/ThemeHeaderEffects'; // 🎨 Import theme effects
import { useAuth } from '../../../contexts/AuthContext'; // 👤 Import useAuth for logout
import { useUI } from '../../../contexts/UIContext'; // 🎓 Import UIContext for tour flags
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
import { DashboardService } from '../services';
import type { DashboardProps } from '../types';

// Import existing optimized dashboard components
import SpeedDial from '../../../components/dashboard/SpeedDial';
// ✨ Import invitations list
import { InvitationsList } from '../../../features/family/components/InvitationsList';
// 📸 Import receipt capture
import { ImageReceiptCapture, type ReceiptData } from '../../../features/family/components/ImageReceiptCapture';
import { supabase } from '../../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { HelpCenter } from '../../../components/help/HelpCenter'; // 📚 Import Help Center
import { OnboardingTourSubtle } from '../../../components/onboarding'; // 🎓 Import Onboarding Tour Sutil
import type { User as SupabaseUser } from '@supabase/supabase-js'; // 👤 Import User type
import { DashboardHeaderSkeleton, DashboardTransactionsSkeleton } from '../../../components/dashboard/DashboardSkeleton'; // 💀 Import skeleton loaders

// 👤 Import ProfileMenu - NEW
import { ProfileMenu } from './ProfileMenu';

export function DashboardScreen({ 
  transactions, 
  accounts, 
  categories, 
  darkMode,
  onToggleDarkMode,
  budgets,
  onNavigate,
  onSelectBudget,
  onDeleteTransaction,
  onEditTransaction,
  onAddTransaction,
  theme,
  currentScreen
}: DashboardProps) {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);
  const [showVoiceRecognition, setShowVoiceRecognition] = useState(false);
  const [showImageCapture, setShowImageCapture] = useState(false); // 📸 NUEVO: Modal de captura de imagen
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false); // 🔔 Cambio: Panel de notificaciones unificado
  const [showHelpCenter, setShowHelpCenter] = useState(false); // 📚 NUEVO: Help Center modal
  const [showOtiChat, setShowOtiChat] = useState(false); // 📚 NUEVO: Oti Chat modal
  const [showOnboarding, setShowOnboarding] = useState(false); // 🎓 NUEVO: Onboarding tour
  
  // ✅ Ref for search input auto-focus
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // ✅ NEW: Use shared month/year from AppContext instead of local state
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, isLoadingTransactions } = useApp();
  
  // 🔔 Hook de notificaciones unificadas
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: refreshNotifications,
  } = useUnifiedNotifications();
  
  // ✨ Obtener contador de invitaciones pendientes (solo para el badge del nav)
  const { pendingCount, refreshInvitations } = useGlobalInvitations();

  const { t } = useLocalization();

  // 👤 Get auth context for currentUser and logout
  const { handleLogout, currentUser } = useAuth();
  
  // 🎓 NUEVO: Obtener flag de coordinación de tours desde UIContext
  const { canShowDashboardTour } = useUI();

  // ✅ Auto-focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // ✅ Close search on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchExpanded) {
        setIsSearchExpanded(false);
        if (!searchQuery) {
          setSearchQuery('');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchExpanded, searchQuery]);

  // 🎓 Check if onboarding tour should be shown
  // 🔐 COORDINACIÓN DE TOURS: Solo mostrar si ProductTour ya se completó
  useEffect(() => {
    // ✅ VERIFICAR: No mostrar si ya está activo
    if (showOnboarding) {
      return;
    }
    
    // ✅ VERIFICAR: Solo continuar si ProductTour ya terminó
    if (!canShowDashboardTour) {
      console.log('🎓 Dashboard tour bloqueado - ProductTour aún no se ha completado');
      return;
    }
    
    // ✅ VERIFICAR: Usar storage key por usuario
    if (!currentUser) {
      console.log('🎓 Dashboard tour bloqueado - esperando currentUser');
      return;
    }
    
    const dashboardTourKey = `oti_dashboard_tour_completed_${currentUser.id}`;
    const tourCompleted = localStorage.getItem(dashboardTourKey);
    
    if (!tourCompleted) {
      console.log('🎓 Dashboard tour habilitado - mostrando después de delay');
      
      // Delay tour for 1 second to let the UI settle
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      console.log('🎓 Dashboard tour ya completado para este usuario');
    }
  }, [canShowDashboardTour, currentUser]); // ← REMOVED showOnboarding from dependencies

  // ✅ Utility functions
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  // ✅ Format date helper
  const formatDate = useCallback((date: string) => {
    return formatLocalDate(parseLocalDate(date));
  }, []);

  const getCategoryName = useCallback((categoryId?: string) => {
    if (!categoryId) return t('transactions.types.transfer');
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    return category.name;
  }, [categories, t]);

  const getSubcategoryName = useCallback((categoryId?: string, subcategoryId?: string) => {
    if (!categoryId || !subcategoryId) return undefined;
    const category = categories.find(c => c.id === categoryId);
    if (!category) return undefined;
    const subcategory = category.subcategories?.find(s => s.id === subcategoryId);
    return subcategory?.name;
  }, [categories]);

  const getAccountName = useCallback((accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || '';
  }, [accounts]);

  const getCategoryColor = useCallback((categoryId?: string) => {
    if (!categoryId) return '#6b7280';
    return categories.find(c => c.id === categoryId)?.color || '#6b7280';
  }, [categories]);

  const getCategoryEmoji = useCallback((categoryId?: string, subcategoryId?: string) => {
    if (!categoryId) return '💸';
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '💸';
    
    if (subcategoryId) {
      const subcategory = category.subcategories?.find(s => s.id === subcategoryId);
      if (subcategory?.emoji) return subcategory.emoji;
    }
    
    return category.emoji || '💸';
  }, [categories]);

  // ✅ Voice command handler
  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    try {
      console.log('🎤 Dashboard: Processing voice command', command);
      
      if (!onAddTransaction) {
        console.error('❌ onAddTransaction is not available');
        toast.error(t('errors.generic'));
        return;
      }
      
      if (accounts.length === 0) {
        console.error('❌ No accounts available');
        toast.error(t('accounts.noAccounts'));
        return;
      }
      
      const newTransaction = {
        type: command.type,
        amount: command.amount,
        category: command.category || '',
        subcategory: command.subcategory || '',
        account: command.account || accounts[0]?.id || '',
        toAccount: command.toAccount || '',
        date: getTodayLocalDate(), // ✅ Use getTodayLocalDate instead of UTC
        note: command.note || '',
      };
      
      console.log('🎤 Creating transaction:', newTransaction);
      onAddTransaction(newTransaction);
      // ✅ REMOVED: toast.success - now handled by useTransactions hook with month info
      
    } catch (error) {
      console.error('❌ Error in handleVoiceCommand:', error);
      toast.error(t('errors.generic'));
    } finally {
      setShowVoiceRecognition(false);
    }
  }, [onAddTransaction, accounts, t]);

  // 📸 Receipt image handler - Procesa recibo y crea transacción personal
  const handleReceiptProcessed = useCallback(async (receiptData: ReceiptData) => {
    try {
      console.log('📸 Dashboard: Processing receipt data', receiptData);
      
      if (!onAddTransaction) {
        console.error('❌ onAddTransaction is not available');
        toast.error(t('errors.generic'));
        return;
      }
      
      if (accounts.length === 0) {
        console.error('❌ No accounts available');
        toast.error(t('accounts.noAccounts'));
        return;
      }

      // Subir imagen al servidor (maneja RLS y storage correctamente)
      const fileName = `receipt_personal_${Date.now()}.${receiptData.imageFile.type.split('/')[1]}`;
      
      console.log('📤 Uploading receipt image via server:', fileName);
      
      // Obtener token de sesión actual (si existe)
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const accessToken = currentSession?.access_token || publicAnonKey;
      
      console.log('🔑 Using token for upload:', currentSession?.access_token ? 'User token' : 'Public anon key');
      
      const uploadResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/upload-receipt-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            imageBase64: receiptData.imageBase64,
            fileName,
            contentType: receiptData.imageFile.type,
          }),
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error('❌ Error uploading receipt image:', errorData);
        
        // Dar mensaje más específico si es problema de autenticación
        if (uploadResponse.status === 401) {
          throw new Error('Tu sesión ha expirado. Por favor cierra sesión y vuelve a iniciar sesión.');
        }
        
        throw new Error(errorData.error || 'Error al subir el comprobante');
      }

      const uploadData = await uploadResponse.json();
      console.log('✅ Receipt image uploaded:', uploadData.path);
      
      const receiptUrl = uploadData.signedUrl;
      console.log('✅ Receipt URL:', receiptUrl);

      // Crear transacción con comprobante adjunto
      const newTransaction = {
        type: receiptData.type,
        amount: receiptData.amount,
        category: receiptData.category || '',
        subcategory: receiptData.subcategory || '',
        account: accounts[0]?.id || '',
        toAccount: '',
        date: receiptData.date || getTodayLocalDate(), // ✅ Use getTodayLocalDate instead of UTC
        note: receiptData.description || '',
        receiptUrl, // ✨ Comprobante adjunto
      };
      
      console.log('📸 Creating transaction from receipt:', newTransaction);
      onAddTransaction(newTransaction);
      
      const typeEmoji = receiptData.type === 'expense' ? '💸' : '💰';
      toast.success(`${typeEmoji} Recibo procesado con IA`, {
        description: `${receiptData.description || 'Transacción'} por $${receiptData.amount.toLocaleString()}`,
      });
      
    } catch (error) {
      console.error('❌ Error in handleReceiptProcessed:', error);
      toast.error('Error al procesar recibo', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setShowImageCapture(false);
    }
  }, [onAddTransaction, accounts, t]);

  // ✅ Navigation handler - Cierra notificaciones cuando se navega
  const handleNavigation = useCallback((screen: string) => {
    // Si se navega al dashboard (toca "Inicio") y el panel está abierto, cerrarlo
    if (screen === 'dashboard' && showNotifications) {
      setShowNotifications(false);
    } else {
      // Para cualquier otra navegación, cerrar panel y navegar
      if (showNotifications) {
        setShowNotifications(false);
      }
      onNavigate(screen);
    }
  }, [showNotifications, onNavigate]);

  // ✅ Filter transactions by month
  const monthFilteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = parseLocalDate(t.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // ✅ Filter and search
  const filteredTransactions = useMemo(() => {
    let filtered = DashboardService.filterTransactionsByType(monthFilteredTransactions, filterType);
    filtered = DashboardService.filterTransactionsBySearch(filtered, searchQuery, categories);
    return filtered;
  }, [monthFilteredTransactions, filterType, searchQuery, categories]);

  // ✅ Group by date - MAINTAINS ORIGINAL ARRAY ORDER (newest first)
  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, any[]>);
  }, [filteredTransactions]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));
  }, [groupedTransactions]);

  // ✅ Calculate stats
  const dashboardStats = useMemo(() => {
    return DashboardService.calculateDashboardStats(
      transactions,
      accounts,
      selectedMonth,
      selectedYear
    );
  }, [transactions, accounts, selectedMonth, selectedYear]);

  // ✅ Memoize getDayTotal to prevent recreation on every render
  const getDayTotal = useCallback((dayTransactions: any[]) => {
    const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return income - expense;
  }, []);

  const handleDeleteTransaction = useCallback(() => {
    if (!deleteTransactionId) return;
    onDeleteTransaction(deleteTransactionId);
    toast.success(t('transactions.deleted'));
    setDeleteTransactionId(null);
  }, [deleteTransactionId, onDeleteTransaction, t]);

  const handleEditTransaction = useCallback((transactionId: string) => {
    onEditTransaction(transactionId);
  }, [onEditTransaction]);

  return (
    <div className="flex flex-col mobile-screen-height bg-gray-50 dark:bg-gray-950 prevent-overscroll relative">
      {/* ✅ Header con logo Oti y efectos temáticos */}
      <div className={`fixed-top-header bg-white dark:bg-gray-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm safe-area-top relative overflow-visible ${showOnboarding ? 'z-[5]' : 'z-20'}`}>
        {/* 🎨 Efectos temáticos del header */}
        <ThemeHeaderEffects theme={theme || 'blue'} />
        
        <div className={`flex items-center justify-between relative ${showOnboarding ? 'z-[10]' : 'z-10'}`}>
          {/* Left: Logo Oti Oficial */}
          <div className="flex items-center" data-tour="oti-logo">
            <OtiLogo 
              variant="isologo"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </div>
          
          {/* Right: Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2" data-tour="header-actions">
            {/* Search Button */}
            <div data-tour="search-button">
              <button
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all touch-target-md tap-scale hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Buscar transacciones"
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-[#004D2C] dark:text-emerald-400" />
              </button>
            </div>
            
            {/* Notifications Bell - Always visible (toggle) */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              data-tour="notifications-button"
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all touch-target-md tap-scale hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={unreadCount > 0 ? `${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} pendiente${unreadCount !== 1 ? 's' : ''}` : 'Notificaciones'}
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#004D2C] dark:text-emerald-400" />
              {unreadCount > 0 && (
                <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg border-2 border-white dark:border-gray-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>
            
            {/* 👤 Profile Menu - Reemplaza dark mode, help y settings */}
            <ProfileMenu
              user={currentUser}
              darkMode={darkMode}
              onToggleDarkMode={onToggleDarkMode}
              onHelpClick={() => setShowHelpCenter(true)}
              onSettingsClick={() => handleNavigation('settings')}
              onTutorialClick={() => {
                localStorage.removeItem('oti_tour_completed');
                setShowOnboarding(true);
                toast.success('¡Iniciando tutorial! 🎓', { 
                  description: 'Te guiaremos por todas las funciones de Oti',
                  icon: '✨' 
                });
              }}
              onLogout={handleLogout}
            />
          </div>
        </div>

        {/* Collapsible Search Bar */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-out ${
            isSearchExpanded ? 'max-h-20 opacity-100 mt-3' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                if (!searchQuery.trim()) {
                  setTimeout(() => setIsSearchExpanded(false), 150);
                }
              }}
              className="w-full h-11 sm:h-12 pl-10 pr-10 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-emerald-500"
            />
            {(searchQuery || isSearchExpanded) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchExpanded(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Cerrar búsqueda"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto content-with-fixed-header-and-nav momentum-scroll">
        {/* Show skeleton while loading */}
        {isLoadingTransactions ? (
          <>
            <DashboardHeaderSkeleton />
            <DashboardTransactionsSkeleton />
          </>
        ) : (
          <>
            {/* Transactions Header - Only show when loaded */}
        <div className="bg-white dark:bg-gray-900 px-4 sm:px-6 pt-3 sm:pt-3 pb-4 sm:pb-5 border-b border-gray-200 dark:border-gray-800">
          <div className="mb-3">
            {/* Month Selector */}
            <div className="flex items-center justify-between gap-3 mb-4" data-tour="month-selector">
              <button
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(selectedYear - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }}
                className="p-2.5 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-target tap-scale"
              >
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="flex-1 text-center">
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {new Date(selectedYear, selectedMonth).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              
              <button
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(selectedYear + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }}
                className="p-2.5 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-target tap-scale"
              >
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Summary Card - Diseño sólido y profesional */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-4 p-4 sm:p-5" data-tour="balance-summary">
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {/* Income */}
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 font-medium uppercase tracking-wide">
                    {t('dashboard.income')}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-[#10B981] dark:text-green-400 break-words leading-tight">
                    {formatCurrency(dashboardStats.monthlyIncome)}
                  </p>
                </div>

                {/* Expenses */}
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 font-medium uppercase tracking-wide">
                    {t('dashboard.expenses')}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-red-600 dark:text-red-400 break-words leading-tight">
                    {formatCurrency(dashboardStats.monthlyExpenses)}
                  </p>
                </div>

                {/* Balance */}
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 font-medium uppercase tracking-wide">
                    {t('dashboard.balance')}
                  </p>
                  <p className={`text-sm sm:text-base font-bold break-words leading-tight ${
                    dashboardStats.netBalance >= 0 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {formatCurrency(dashboardStats.netBalance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto hide-scrollbar" data-tour="transaction-filters">
              {/* All Filter */}
              <button
                onClick={() => setFilterType('all')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all shadow-sm ${
                  filterType === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200 dark:shadow-blue-900/50'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('transactions.types.all')}</span>
              </button>

              {/* Income Filter */}
              <button
                onClick={() => setFilterType('income')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all shadow-sm ${
                  filterType === 'income'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-200 dark:shadow-green-900/50'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('transactions.types.income')}</span>
              </button>

              {/* Expense Filter */}
              <button
                onClick={() => setFilterType('expense')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all shadow-sm ${
                  filterType === 'expense'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-200 dark:shadow-red-900/50'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
              >
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('transactions.types.expense')}</span>
              </button>

              {/* Transfer Filter */}
              <button
                onClick={() => setFilterType('transfer')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all shadow-sm ${
                  filterType === 'transfer'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-200 dark:shadow-purple-900/50'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('transactions.types.transfer')}</span>
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="p-4 sm:p-6 space-y-4 pb-24" data-tour="transactions-list">
            {/* 🎨 Show loader when loading transactions */}
            {isLoadingTransactions ? (
              <OtiLoader 
                message="Cargando tus finanzas..." 
                size="md" 
              />
            ) : sortedDates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{t('transactions.empty')}</p>
              </div>
            ) : (
              sortedDates.map(date => {
                const dayTransactions = groupedTransactions[date];
                const dayTotal = getDayTotal(dayTransactions);
                const isPositive = dayTotal >= 0;
                
                return (
                  <div key={date} className="space-y-3">
                    {/* Day Header with Balance */}
                    <div className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 ${
                      isPositive 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'
                    }`}>
                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-8 sm:h-10 rounded-full ${
                          isPositive ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <p className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                          {formatDate(date)}
                        </p>
                      </div>
                      
                      {/* Balance Badge */}
                      <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg ${
                        isPositive 
                          ? 'bg-green-100 dark:bg-green-900/40' 
                          : 'bg-red-100 dark:bg-red-900/40'
                      }`}>
                        <div className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
                          isPositive ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          ) : (
                            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          )}
                        </div>
                        <p className={`text-base sm:text-lg font-bold ${
                          isPositive 
                            ? 'text-green-700 dark:text-green-400' 
                            : 'text-red-700 dark:text-red-400'
                        }`}>
                          {formatCurrency(dayTotal)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Transactions */}
                    <div className="space-y-2">
                      {dayTransactions.map((transaction, index) => (
                        <TransactionItem
                          key={transaction.id}
                          transaction={transaction}
                          categoryName={getCategoryName(transaction.category)}
                          subcategoryName={getSubcategoryName(transaction.category, transaction.subcategory)}
                          categoryColor={getCategoryColor(transaction.category)}
                          categoryEmoji={getCategoryEmoji(transaction.category, transaction.subcategory)}
                          accountName={getAccountName(transaction.account)}
                          toAccountName={transaction.toAccount ? getAccountName(transaction.toAccount) : undefined}
                          formatCurrency={formatCurrency}
                          formatDate={formatDate}
                          onEdit={handleEditTransaction}
                          onDelete={(id) => setDeleteTransactionId(id)}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            {/* WhatsApp-style Spacer - Evita que el FAB tape contenido */}
            <OtiSpacerMessage
              message="Has llegado al final. Usa Oti para crear transacciones o chatear"
              show={filteredTransactions.length > 0}
            />
          </div>
        </div>
          </>
        )}
      </div>

      {/* Oti FAB - Asistente Inteligente Unificado (Derecha, estilo WhatsApp) */}
      {/* En móvil y desktop: absolute para mantenerse dentro del contenedor centrado */}
      <div className="absolute bottom-20 right-6 z-50" data-tour="quick-actions">
        <SpeedDial
          context="dashboard"
          onChatClick={() => handleNavigation('oti-chat')}
          onVoiceClick={() => {
            // ✅ FIX: Validate data before opening voice recognition
            if (!accounts || accounts.length === 0) {
              toast.error('No hay cuentas disponibles. Por favor crea una cuenta primero.');
              return;
            }
            if (!categories || categories.length === 0) {
              toast.error('Cargando categorías... Por favor intenta de nuevo en un momento.');
              return;
            }
            setShowVoiceRecognition(true);
          }}
          onImageClick={() => {
            // ✅ Validate data before opening image capture
            if (!accounts || accounts.length === 0) {
              toast.error('No hay cuentas disponibles. Por favor crea una cuenta primero.');
              return;
            }
            if (!categories || categories.length === 0) {
              toast.error('Cargando categorías... Por favor intenta de nuevo en un momento.');
              return;
            }
            setShowImageCapture(true);
          }}
          onManualClick={() => handleNavigation('new-transaction')}
          theme={theme}
        />
      </div>

      {/* Voice Recognition */}
      {showVoiceRecognition && (
        <VoiceRecognition
          accounts={accounts}
          categories={categories}
          onVoiceCommand={handleVoiceCommand}
          onClose={() => setShowVoiceRecognition(false)}
        />
      )}

      {/* 📸 Receipt Image Capture */}
      {showImageCapture && (
        <ImageReceiptCapture
          categories={categories}
          onReceiptProcessed={handleReceiptProcessed}
          onClose={() => setShowImageCapture(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteTransactionId !== null} onOpenChange={() => setDeleteTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('transactions.deleteTransaction')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('transactions.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTransactionId(null)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTransaction}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 🔔 Modal de Notificaciones */}
      {showNotifications && (
        <NotificationsPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onRefresh={refreshNotifications}
          onNotificationClick={(notification) => {
            console.log('📱 Notification clicked:', notification);
            console.log('📱 Notification metadata:', notification.metadata);
            console.log('📱 Notification groupId:', notification.groupId);
            console.log('📱 Notification category:', notification.category);
            
            // Navegar a grupos si es una notificación grupal con transacción
            if (notification.category === 'group' && notification.groupId) {
              const transactionId = notification.metadata?.transactionId;
              
              if (transactionId) {
                // Navegar al grupo específico con la transacción destacada
                console.log(`🎯 Navigating to group ${notification.groupId} with transaction ${transactionId}`);
                const params = { 
                  groupId: notification.groupId,
                  highlightTransactionId: transactionId 
                };
                console.log('🎯 Navigation params:', params);
                onNavigate('family', params);
              } else {
                // Navegar solo al grupo
                console.log(`🎯 Navigating to group ${notification.groupId}`);
                onNavigate('family', { groupId: notification.groupId });
              }
            } else if (notification.actionUrl) {
              console.log('Navigate to:', notification.actionUrl);
              // TODO: Implementar navegación según actionUrl
            }
            
            setShowNotifications(false);
          }}
        />
      )}

      {/* 📚 Help Center Modal */}
      {showHelpCenter && (
        <HelpCenter
          isOpen={showHelpCenter}
          onClose={() => setShowHelpCenter(false)}
        />
      )}

      {/* 🎓 Onboarding Tour */}
      {showOnboarding && currentUser && (
        <OnboardingTourSubtle 
          onComplete={() => setShowOnboarding(false)}
          darkMode={darkMode}
          userId={currentUser.id} // 👤 Pass user ID to save tour completion
        />
      )}
      
      {/* Bottom Navigation */}
      <BottomNav 
        currentScreen="dashboard" 
        onNavigate={handleNavigation} 
        showOnboarding={showOnboarding}
      />
    </div>
  );
}