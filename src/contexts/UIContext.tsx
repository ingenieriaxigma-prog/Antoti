/**
 * UIContext
 * 
 * Context para manejar el estado de la interfaz de usuario
 * - Tema oscuro
 * - Tema de color
 * - Pantalla de bloqueo
 * - Navegación
 * - Tour del producto
 */

import { createContext, useContext, useState, useEffect, ReactNode, startTransition } from 'react';
import { getColombiaTime } from '../utils/dateUtils'; // ✅ Import getColombiaTime
import { useAuth } from './AuthContext';

interface UIContextType {
  // Theme & Dark Mode
  darkMode: boolean;
  colorTheme: string;
  toggleDarkMode: () => void;
  setColorTheme: (theme: string) => void;
  
  // Navigation
  currentScreen: string;
  navigationHistory: string[];
  previousScreen: string; // 🆕 Pantalla anterior
  handleNavigate: (screen: string, params?: Record<string, any>) => void;
  goBack: () => void;
  setCurrentScreen: (screen: string) => void;
  dashboardResetKey: number; // NEW: Key to force Dashboard reset
  navigationParams: Record<string, any>; // 🆕 Parámetros de navegación
  clearNavigationParams: () => void; // 🆕 Limpiar parámetros
  
  // Lock Screen
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  lastActivityTime: number;
  setLastActivityTime: (time: number) => void;
  
  // Product Tour & Splash
  showSplashScreen: boolean;
  setShowSplashScreen: (show: boolean) => void;
  showProductTour: boolean;
  setShowProductTour: (show: boolean) => void;
  handleRestartTour: () => void;
  
  // 🎓 Dashboard Onboarding Tour - NEW
  showDashboardTour: boolean;
  setShowDashboardTour: (show: boolean) => void;
  canShowDashboardTour: boolean; // ← Flag que indica si el ProductTour ya se completó
  setCanShowDashboardTour: (show: boolean) => void; // ← AGREGADO: Faltaba exportar esta función
  
  // Editing & Selection States
  editingTransactionId: string | null;
  setEditingTransactionId: (id: string | null) => void;
  selectedBudgetId: string | null;
  setSelectedBudgetId: (id: string | null) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  selectedCategoryKey: string | null;
  setSelectedCategoryKey: (key: string | null) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
  const { currentUser, isAuthenticated } = useAuth();
  
  // Theme states
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [colorTheme, setColorTheme] = useState(() => {
    const saved = localStorage.getItem('colorTheme');
    return saved || 'green'; // Cambiado default de 'blue' a 'green' para transmitir esperanza
  });
  
  // Navigation states
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [previousScreen, setPreviousScreen] = useState('dashboard'); // 🆕 Pantalla anterior
  const [dashboardResetKey, setDashboardResetKey] = useState(0); // NEW: Key to force Dashboard reset
  const [navigationParams, setNavigationParams] = useState<Record<string, any>>({}); // 🆕 Parámetros de navegación
  
  // Lock screen states
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(getColombiaTime().getTime()); // ✅ Use getColombiaTime
  
  // Splash & Tour states
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [showProductTour, setShowProductTour] = useState(false);
  
  // 🎓 Dashboard Onboarding Tour - NEW
  const [showDashboardTour, setShowDashboardTour] = useState(false);
  const [canShowDashboardTour, setCanShowDashboardTour] = useState(false); // ← Iniciar en FALSE hasta que ProductTour se complete
  
  // Editing & Selection states
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  
  // ✅ FIX: Use Colombia time for initial state
  const colombiaTime = getColombiaTime();
  const [selectedMonth, setSelectedMonth] = useState<number>(colombiaTime.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(colombiaTime.getFullYear());

  // ✅ FIX: Reset to dashboard when user logs in
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      startTransition(() => {
        setCurrentScreen('dashboard');
        setNavigationHistory([]);
      });
    }
  }, [isAuthenticated, currentUser]);

  // Persist dark mode to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Persist color theme to localStorage and apply CSS variables
  useEffect(() => {
    localStorage.setItem('colorTheme', colorTheme);
    
    // Apply theme colors to CSS variables
    const themeColors: Record<string, { primary: string; secondary: string; primaryDark: string; secondaryDark: string }> = {
      blue: { primary: '#3b82f6', secondary: '#60a5fa', primaryDark: '#2563eb', secondaryDark: '#3b82f6' },
      green: { primary: '#10b981', secondary: '#34d399', primaryDark: '#059669', secondaryDark: '#10b981' },
      purple: { primary: '#8b5cf6', secondary: '#a78bfa', primaryDark: '#7c3aed', secondaryDark: '#8b5cf6' },
      orange: { primary: '#f97316', secondary: '#fb923c', primaryDark: '#ea580c', secondaryDark: '#f97316' },
      pink: { primary: '#ec4899', secondary: '#f472b6', primaryDark: '#db2777', secondaryDark: '#ec4899' },
      teal: { primary: '#14b8a6', secondary: '#2dd4bf', primaryDark: '#0d9488', secondaryDark: '#14b8a6' },
      christmas: { primary: '#dc2626', secondary: '#16a34a', primaryDark: '#b91c1c', secondaryDark: '#15803d' },
      rainbow: { primary: '#ec4899', secondary: '#8b5cf6', primaryDark: '#db2777', secondaryDark: '#7c3aed' },
    };
    
    const colors = themeColors[colorTheme] || themeColors.blue;
    document.documentElement.style.setProperty('--theme-primary', colors.primary);
    document.documentElement.style.setProperty('--theme-secondary', colors.secondary);
    document.documentElement.style.setProperty('--theme-primary-dark', colors.primaryDark);
    document.documentElement.style.setProperty('--theme-secondary-dark', colors.secondaryDark);
  }, [colorTheme]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Navigation with history
  const handleNavigate = (screen: string, params?: Record<string, any>) => {
    startTransition(() => {
      setNavigationHistory(prev => [...prev, currentScreen]);
      setCurrentScreen(screen);
      setPreviousScreen(currentScreen); // 🆕 Guardar la pantalla anterior
      setNavigationParams(params || {}); // 🆕 Guardar parámetros de navegación
      
      // NEW: Force Dashboard reset when navigating TO dashboard from another screen
      if (screen === 'dashboard' && currentScreen !== 'dashboard') {
        setDashboardResetKey(prev => prev + 1);
      }
    });
  };

  const goBack = () => {
    startTransition(() => {
      if (navigationHistory.length > 0) {
        const previousScreen = navigationHistory[navigationHistory.length - 1];
        setNavigationHistory(prev => prev.slice(0, -1));
        setCurrentScreen(previousScreen);
        
        // NEW: Force Dashboard reset when going BACK to dashboard
        if (previousScreen === 'dashboard') {
          setDashboardResetKey(prev => prev + 1);
        }
      } else {
        setCurrentScreen('dashboard');
        // Also reset when defaulting back to dashboard
        setDashboardResetKey(prev => prev + 1);
      }
    });
  };

  // Restart tour
  const handleRestartTour = () => {
    if (currentUser) {
      const tourKey = `hasSeenProductTour_${currentUser.id}`;
      localStorage.removeItem(tourKey);
      // 🎓 También limpiar el tour del dashboard para usuario actual
      const dashboardTourKey = `oti_dashboard_tour_completed_${currentUser.id}`;
      localStorage.removeItem(dashboardTourKey);
    }
    // Also remove the old global key for backwards compatibility
    localStorage.removeItem('hasSeenProductTour');
    localStorage.removeItem('oti_tour_completed'); // ← Limpiar key global antigua
    startTransition(() => {
      setCurrentScreen('dashboard');
      setNavigationHistory([]);
      setShowProductTour(true);
      setCanShowDashboardTour(false); // ← Bloquear dashboard tour hasta completar ProductTour
      setShowDashboardTour(false); // ← Asegurar que no esté activo
    });
  };

  // Wrap setCurrentScreen with startTransition
  const wrappedSetCurrentScreen = (screen: string) => {
    startTransition(() => {
      setCurrentScreen(screen);
    });
  };

  // Clear navigation params
  const clearNavigationParams = () => {
    setNavigationParams({});
  };

  const value: UIContextType = {
    darkMode,
    colorTheme,
    toggleDarkMode,
    setColorTheme,
    currentScreen,
    navigationHistory,
    handleNavigate,
    goBack,
    setCurrentScreen: wrappedSetCurrentScreen, // Use wrapped version
    dashboardResetKey, // NEW: Key to force Dashboard reset
    navigationParams, // 🆕 Parámetros de navegación
    clearNavigationParams, // 🆕 Limpiar parámetros
    isLocked,
    setIsLocked,
    lastActivityTime,
    setLastActivityTime,
    showSplashScreen,
    setShowSplashScreen,
    showProductTour,
    setShowProductTour,
    handleRestartTour,
    // 🎓 Dashboard Onboarding Tour - NEW
    showDashboardTour,
    setShowDashboardTour,
    canShowDashboardTour,
    setCanShowDashboardTour, // ← AGREGADO: Faltaba exportar esta función
    editingTransactionId,
    setEditingTransactionId,
    selectedBudgetId,
    setSelectedBudgetId,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedCategoryKey,
    setSelectedCategoryKey,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    previousScreen, // 🆕 Pantalla anterior
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextType {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}