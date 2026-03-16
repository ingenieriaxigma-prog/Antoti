/**
 * App.tsx - REFACTORED WITH PHASE 2
 * 
 * ✅ PHASE 1: Business logic extracted to services
 * ✅ PHASE 2: State management with Context API + Custom Hooks
 * ✅ PHASE 3: Performance optimization with lazy loading
 * 
 * Now App.tsx is ~300 lines instead of 1,200!
 * - AuthContext handles authentication
 * - UIContext handles navigation and UI state
 * - AppContext handles data state
 * - Custom hooks handle CRUD operations
 * - useDataLoader consolidates all data loading
 * - Lazy loading for heavy components
 */

// 🔥 META TAGS: Ya están en index.html de forma estática
// No necesitamos importar StaticMetaTags aquí

import { useEffect, lazy, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner@2.0.3';

// ✅ PHASE 2: Import Contexts and Hooks
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UIProvider, useUI } from './contexts/UIContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { LocalizationProvider } from './contexts/LocalizationContext'; // ✅ i18n Context
import { InvitationsProvider } from './contexts/InvitationsContext'; // ✅ Invitations Context
import { 
  useDataLoader, 
  useTransactions, 
  useAccounts, 
  useCategories, 
  useBudgets,
  useResetData 
} from './hooks';

// ✅ FASE 2 RESPONSIVE: Import responsive hooks
import { useBackButton } from './hooks/useBackButton';
import { useKeyboardScroll } from './hooks/useKeyboardScroll';

// ✅ MEJORAS: Error Boundary
import ErrorBoundary from './components/ErrorBoundary';

// ✅ MEJORAS: Logger
import { logger } from './utils/logger';

// 🎨 OTI CONFIRM DIALOG: Provider para diálogos de confirmación con branding
import { useOtiConfirmProvider } from './components/ui/OtiConfirmDialog';

// ✅ AUTO TEST RUNNER: Ejecuta tests automáticamente en background
import { AutoTestRunner } from './components/testing/AutoTestRunner';

// ✅ PHASE 3: Core Components (always loaded - used immediately)
// ✅ MIGRATED: Dashboard now from features
import { DashboardScreen } from './features/dashboard';
// ✅ MIGRATED: TransactionsScreen now from features
import { TransactionsScreen, NewTransactionScreen } from './features/transactions';
import AuthScreen from './components/AuthScreen';
import SplashScreen from './components/SplashScreen';
import MetaTags from './components/MetaTags';
import MetaTagsInjector from './components/MetaTagsInjector';
import LockScreen from './components/LockScreen';
import SkeletonLoader from './components/SkeletonLoader';
import otiIsologoLight from 'figma:asset/769764b6ad1c637a72e4172f3a22f74ce04d9c7b.png'; // ✅ Import Oti Isologo Light para MetaTags

// ✅ PHASE 3: Lazy-loaded Components (loaded on demand)
// ✅ MIGRATED: Accounts feature now using new architecture
import { AccountsScreen } from './features/accounts';
// ✅ MIGRATED: Categories feature now using new architecture
import { CategoriesScreen } from './features/categories';
// ✅ MIGRATED: Budgets feature now using new architecture
import { BudgetsScreen } from './features/budgets';
// ✅ MIGRATED: Statistics feature now using new architecture
import { StatisticsScreen } from './features/statistics';
// ✅ MIGRATED: Settings feature now using new architecture
import { SettingsScreen } from './features/settings';
// ✅ NEW: Family feature for finanzas familiares
import { FamilyScreen } from './features/family/components/FamilyScreen';
const SubcategoryManager = lazy(() => import('./components/SubcategoryManager'));
const BudgetDetail = lazy(() => import('./components/BudgetDetail'));
const ColorTheme = lazy(() => import('./components/ColorTheme'));
const BankStatementUpload = lazy(() => import('./components/BankStatementUpload'));
const ProductTour = lazy(() => import('./components/ProductTourClean'));
const TourTransitionMessage = lazy(() => import('./components/TourTransitionMessage'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const CategoryTransactions = lazy(() => import('./components/CategoryTransactions'));
const FinancialAdvisor = lazy(() => import('./components/FinancialAdvisor'));
const OtiChat = lazy(() => import('./components/OtiChatV3')); // ✨ FASE 3: Historial persistente con BD
const AboutScreen = lazy(() => import('./components/AboutScreen'));
const ResetPasswordScreen = lazy(() => import('./components/ResetPasswordScreen'));
const TaxModule = lazy(() => import('./components/TaxModule'));
const SchemaTestingPage = lazy(() => import('./components/SchemaTestingPage'));
const AutoTranslatePanel = lazy(() => import('./components/AutoTranslatePanel'));
const TestingDashboard = lazy(() => import('./components/testing/TestingDashboard').then(m => ({ default: m.TestingDashboard })));

/**
 * AppContent - The actual app logic
 * Separated so it can use all the contexts
 */
function AppContent() {
  // ✅ PHASE 2: Use contexts instead of local state
  const {
    isAuthenticated,
    currentUser,
    accessToken,
    isCheckingAuth,
    isResettingPassword,
    resetToken,
    handleAuthSuccess,
    handleLogout,
    handleUpdateProfile,
  } = useAuth();

  const {
    darkMode,
    colorTheme,
    toggleDarkMode,
    setColorTheme,
    currentScreen,
    handleNavigate,
    goBack,
    setCurrentScreen,
    previousScreen, // 🆕 Pantalla anterior (para contexto de Oti)
    dashboardResetKey, // NEW: For forcing Dashboard reset
    isLocked,
    setIsLocked,
    lastActivityTime,
    setLastActivityTime,
    showSplashScreen,
    setShowSplashScreen,
    showProductTour,
    setShowProductTour,
    handleRestartTour,
    setCanShowDashboardTour, // 🎓 NUEVO: Importar para habilitar dashboard tour
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
  } = useUI();

  const { transactions, accounts, categories, budgets, isLoadingTransactions } = useApp();

  // ✅ PHASE 2: Use custom hooks for operations
  const { addTransaction, addMultipleTransactions, updateTransaction, deleteTransaction } = useTransactions();
  const { addAccount, updateAccount, deleteAccount } = useAccounts();
  const { addCategory, updateCategory, deleteCategory } = useCategories();
  const { addBudget, updateBudget, deleteBudget } = useBudgets();
  const { resetData } = useResetData();

  // ✅ PHASE 2: Consolidated data loading in one hook
  useDataLoader();

  // 🎓 Estado para controlar la transición entre Product Tour y Onboarding Tour
  const [showTourTransition, setShowTourTransition] = useState(false);

  // 🎨 OTI CONFIRM DIALOG: Hook para habilitar diálogos de confirmación con branding
  const OtiConfirmProvider = useOtiConfirmProvider();

  // ✅ FIX CRÍTICO CHROME: Configurar idioma ANTES que cualquier otro useEffect
  useEffect(() => {
    // Configurar idioma INMEDIATAMENTE
    const html = document.documentElement;
    html.lang = 'es';
    html.setAttribute('xml:lang', 'es');
    html.setAttribute('translate', 'no'); // ← CRUCIAL para Chrome
    
    // Agregar atributo translate="no" al body
    document.body.setAttribute('translate', 'no');
    
    // Crear meta tags INMEDIATAMENTE
    const addMetaTag = (name: string, content: string, useHttpEquiv = false) => {
      const attr = useHttpEquiv ? 'http-equiv' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (useHttpEquiv) {
          meta.httpEquiv = name;
        } else {
          meta.name = name;
        }
        // Insertar al INICIO del head para máxima prioridad
        document.head.insertBefore(meta, document.head.firstChild);
      }
      meta.content = content;
    };
    
    // Meta tags críticos en orden de importancia
    addMetaTag('google', 'notranslate'); // ← El más importante
    addMetaTag('content-language', 'es', true); // http-equiv
    addMetaTag('language', 'Spanish');
  }, []); // ← Solo al montar, antes que todo

  // ✅ FASE 2 RESPONSIVE: Android back button handler
  useBackButton({
    onBack: () => {
      // Si estamos en dashboard, permitir salir de la app
      if (currentScreen === 'dashboard') {
        return false; // Permite salir
      }
      
      // En cualquier otra pantalla, navegar hacia atrás
      goBack();
      return true; // Previene salir de la app
    },
  });

  // ✅ FASE 2 RESPONSIVE: Scroll to input when keyboard appears (iOS principalmente)
  useKeyboardScroll({
    delay: 300,
    behavior: 'smooth',
    block: 'center',
  });

  // Prevent zoom on mobile devices
  useEffect(() => {
    const setViewport = () => {
      let viewport = document.querySelector('meta[name="viewport"]');
      
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        document.head.appendChild(viewport);
      }
      
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    };

    setViewport();

    const handleOrientationChange = () => {
      setTimeout(setViewport, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Check if PIN is enabled and lock screen on mount
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const checkPinEnabled = () => {
      try {
        const settings = localStorage.getItem(`security_${currentUser.id}`);
        if (settings) {
          const parsed = JSON.parse(settings);
          if (parsed.pinEnabled) {
            setIsLocked(true);
          }
        }
      } catch (error) {
        logger.error('Error checking PIN settings:', error);
      }
    };

    checkPinEnabled();
  }, [isAuthenticated, currentUser, setIsLocked]);

  // Monitor user activity for auto-lock
  useEffect(() => {
    if (!isAuthenticated || !currentUser || isLocked) return;

    let lastActiveTimestamp = Date.now();
    let inactivityTimer: NodeJS.Timeout | null = null;

    const checkInactivity = () => {
      try {
        const settings = localStorage.getItem(`security_${currentUser.id}`);
        if (settings) {
          const parsed = JSON.parse(settings);
          if (parsed.pinEnabled) {
            const autoLockTime = (parsed.autoLockTime || 5) * 60 * 1000;
            const timeAway = Date.now() - lastActiveTimestamp;
            
            if (timeAway >= autoLockTime) {
              setIsLocked(true);
            }
          }
        }
      } catch (error) {
        logger.error('Error checking inactivity:', error);
      }
    };

    const resetInactivityTimer = () => {
      lastActiveTimestamp = Date.now();
      
      // Clear existing timer
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      // Get auto-lock time from settings
      try {
        const settings = localStorage.getItem(`security_${currentUser.id}`);
        if (settings) {
          const parsed = JSON.parse(settings);
          if (parsed.pinEnabled) {
            const autoLockTime = (parsed.autoLockTime || 5) * 60 * 1000;
            
            // Set new timer to check inactivity
            inactivityTimer = setTimeout(() => {
              checkInactivity();
            }, autoLockTime);
          }
        }
      } catch (error) {
        logger.error('Error setting inactivity timer:', error);
      }
    };

    // Handle visibility change (user switches tabs/apps)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastActiveTimestamp = Date.now();
        
        // Clear timer when user leaves
        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
        }
      } else {
        checkInactivity();
        
        // Restart timer when user returns (if not locked)
        if (!isLocked) {
          resetInactivityTimer();
        }
      }
    };

    // Track user activity (touch, mouse, keyboard)
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // Start the inactivity timer on mount
    resetInactivityTimer();

    // Listen to visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen to user activity events
    document.addEventListener('touchstart', handleUserActivity, { passive: true });
    document.addEventListener('mousedown', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity, { passive: true });

    return () => {
      // Cleanup
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('touchstart', handleUserActivity);
      document.removeEventListener('mousedown', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
    };
  }, [isAuthenticated, currentUser, isLocked, setIsLocked]);

  // ✅ PHASE 2: Routing logic (much cleaner now)
  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardScreen
            key={dashboardResetKey} // NEW: Force remount when key changes
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            budgets={budgets}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
            isLoadingTransactions={isLoadingTransactions}
            onNavigate={(screen) => {
              // Clear editing state when creating a new transaction
              if (screen === 'new-transaction') {
                setEditingTransactionId(null);
              }
              handleNavigate(screen);
            }}
            onSelectBudget={(budgetId) => {
              setSelectedBudgetId(budgetId);
              handleNavigate('budget-detail');
            }}
            onDeleteTransaction={deleteTransaction}
            onEditTransaction={(transactionId) => {
              setEditingTransactionId(transactionId);
              handleNavigate('new-transaction');
            }}
            onAddTransaction={addTransaction}
            theme={colorTheme}
            currentScreen={currentScreen} // NEW: Pass currentScreen for reset detection
          />
        );
      case 'transactions':
        return (
          <TransactionsScreen
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            onDeleteTransaction={deleteTransaction}
            onEditTransaction={(transactionId) => {
              setEditingTransactionId(transactionId);
              handleNavigate('new-transaction');
            }}
            onNavigate={(screen) => {
              // Clear editing state when creating a new transaction
              if (screen === 'new-transaction') {
                setEditingTransactionId(null);
              }
              handleNavigate(screen);
            }}
          />
        );
      case 'new-transaction':
        return (
          <NewTransactionScreen
            accounts={accounts}
            categories={categories}
            transactions={transactions}
            editingTransactionId={editingTransactionId}
            onAddTransaction={addTransaction}
            onUpdateTransaction={updateTransaction}
            onNavigate={handleNavigate}
            onGoBack={goBack} // NEW: Pass goBack function for proper navigation
            onClearEditing={() => setEditingTransactionId(null)}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
          />
        );
      case 'accounts':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <AccountsScreen
              accounts={accounts}
              onAddAccount={addAccount}
              onUpdateAccount={updateAccount}
              onDeleteAccount={deleteAccount}
              onNavigate={handleNavigate}
            />
          </Suspense>
        );
      case 'categories':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <CategoriesScreen
              categories={categories}
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
              onNavigate={handleNavigate}
              onSelectCategory={(categoryId) => {
                setSelectedCategoryId(categoryId);
                handleNavigate('subcategory-manager');
              }}
            />
          </Suspense>
        );
      case 'subcategory-manager':
        const selectedCategory = categories.find(c => c.id === selectedCategoryId);
        if (!selectedCategory) return null;
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <SubcategoryManager
              category={selectedCategory}
              onUpdateCategory={updateCategory}
              onNavigate={handleNavigate}
            />
          </Suspense>
        );
      case 'statistics':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <StatisticsScreen
              transactions={transactions}
              categories={categories}
              budgets={budgets}
              onNavigate={handleNavigate}
              onSelectBudget={(budgetId) => {
                setSelectedBudgetId(budgetId);
                handleNavigate('budget-detail');
              }}
              onSelectCategory={(categoryKey, month, year) => {
                setSelectedCategoryKey(categoryKey);
                setSelectedMonth(month);
                setSelectedYear(year);
                handleNavigate('category-transactions');
              }}
              onGoBack={goBack}
            />
          </Suspense>
        );
      case 'budgets':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <BudgetsScreen
              budgets={budgets}
              categories={categories}
              transactions={transactions}
              onAddBudget={addBudget}
              onUpdateBudget={updateBudget}
              onDeleteBudget={deleteBudget}
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
              onNavigate={handleNavigate}
              onSelectBudget={(budgetId) => {
                setSelectedBudgetId(budgetId);
                handleNavigate('budget-detail');
              }}
            />
          </Suspense>
        );
      case 'budget-detail':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <BudgetDetail
              budgetId={selectedBudgetId}
              budgets={budgets}
              categories={categories}
              transactions={transactions}
              onUpdateBudget={updateBudget}
              onDeleteBudget={deleteBudget}
              onNavigate={handleNavigate}
              onGoBack={goBack}
            />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <SettingsScreen
              darkMode={darkMode}
              transactions={transactions}
              accounts={accounts}
              categories={categories}
              currentUser={currentUser}
              accessToken={accessToken}
              onToggleDarkMode={toggleDarkMode}
              onNavigate={setCurrentScreen}
              onResetData={resetData}
              onRestartTour={handleRestartTour}
              onLogout={handleLogout}
              onUpdateProfile={handleUpdateProfile}
            />
          </Suspense>
        );
      case 'color-theme':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <ColorTheme
              currentTheme={colorTheme}
              onSelectTheme={setColorTheme}
              onNavigate={handleNavigate}
            />
          </Suspense>
        );
      case 'bank-statement':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <BankStatementUpload
              accounts={accounts}
              categories={categories}
              onNavigate={handleNavigate}
              onAddTransaction={addTransaction}
              onAddMultipleTransactions={addMultipleTransactions}
              onGoBack={goBack}
            />
          </Suspense>
        );
      case 'product-tour':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <ProductTour
              onNavigate={handleNavigate}
            />
          </Suspense>
        );
      case 'category-transactions':
        if (!selectedCategoryKey) return null;
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <CategoryTransactions
              categoryKey={selectedCategoryKey}
              month={selectedMonth}
              year={selectedYear}
              transactions={transactions}
              categories={categories}
              accounts={accounts}
              onNavigate={handleNavigate}
              onEditTransaction={(transaction) => {
                setEditingTransactionId(transaction.id);
                handleNavigate('new-transaction');
              }}
            />
          </Suspense>
        );
      case 'financial-advisor':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <FinancialAdvisor
              transactions={transactions}
              accounts={accounts}
              categories={categories}
              budgets={budgets}
              onNavigate={handleNavigate}
              onGoBack={goBack}
            />
          </Suspense>
        );
      case 'oti-chat':
        // 🆕 Mapear previousScreen al contexto de Oti
        const otiContextMap: Record<string, 'home' | 'budgets' | 'accounts' | 'transactions'> = {
          'dashboard': 'home',
          'budgets': 'budgets',
          'accounts': 'accounts',
          'transactions': 'transactions',
        };
        const otiContext = otiContextMap[previousScreen as keyof typeof otiContextMap] || 'home';
        
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <OtiChat
              onNavigate={handleNavigate}
              currentScreen={otiContext}
              theme={colorTheme}
            />
          </Suspense>
        );
      case 'about':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <AboutScreen
              onGoBack={goBack}
            />
          </Suspense>
        );
      case 'admin-panel':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <AdminPanel
              accessToken={accessToken}
              onGoBack={goBack}
              darkMode={darkMode}
            />
          </Suspense>
        );
      case 'schema-testing':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <SchemaTestingPage onGoBack={goBack} />
          </Suspense>
        );
      case 'testing-dashboard':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <TestingDashboard onGoBack={goBack} />
          </Suspense>
        );
      case 'auto-translate':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <AutoTranslatePanel />
          </Suspense>
        );
      case 'tax':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <TaxModule
              onBack={goBack}
              onNavigate={handleNavigate}
              transactions={transactions}
              accounts={accounts}
              darkMode={darkMode}
            />
          </Suspense>
        );
      case 'family':
        return (
          <Suspense fallback={<SkeletonLoader />}>
            <FamilyScreen 
              onNavigate={handleNavigate}
            />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''} translate="no">
      <MetaTags 
        title="Oti - Tu Asistente Financiero Personal con IA"
        description="Controla tus finanzas con inteligencia artificial: registra gastos, crea presupuestos, analiza tus hábitos y recibe asesoría financiera personalizada."
        url="https://www.finanzapersonal.com"
        image={otiIsologoLight}
      />
      <MetaTagsInjector />

      {/* Show auth screen if not authenticated */}
      {!isAuthenticated && !isCheckingAuth && !isResettingPassword && (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      )}

      {/* Show password reset screen if coming from email link */}
      {!isAuthenticated && !isCheckingAuth && isResettingPassword && resetToken && (
        <ResetPasswordScreen 
          accessToken={resetToken}
          onSuccess={() => {
            // These setters are in AuthContext, need to expose them
            // For now, we can just reload the page
            window.location.href = '/';
          }}
        />
      )}
      
      {/* Show auth check loading screen - Oti Splash Screen */}
      {isCheckingAuth && (
        <SplashScreen isLoading={true} />
      )}

      {/* Show app if authenticated */}
      {isAuthenticated && !isCheckingAuth && (
        <>
          {/* Lock Screen */}
          {isLocked && currentUser && (
            <LockScreen
              darkMode={darkMode}
              userId={currentUser.id}
              onUnlock={() => {
                setIsLocked(false);
                setLastActivityTime(Date.now());
              }}
            />
          )}

          {/* Main App Content - Always render when not showing splash/lock */}
          {!isLocked && (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
              <div className="mx-auto max-w-md h-screen relative z-10">
                {renderScreen()}
              </div>
            </div>
          )}

          {/* Product Tour - Overlay on top of content */}
          {!isLocked && showProductTour && currentUser && (
            <ProductTour
              onComplete={() => {
                setShowProductTour(false);
                const tourKey = `hasSeenProductTour_${currentUser.id}`;
                localStorage.setItem(tourKey, 'true');
                setCanShowDashboardTour(true); // 🎓 HABILITAR dashboard tour
                handleNavigate('dashboard');
                // 🎓 Activar mensaje de transición
                setShowTourTransition(true);
              }}
              onSkip={() => {
                setShowProductTour(false);
                const tourKey = `hasSeenProductTour_${currentUser.id}`;
                localStorage.setItem(tourKey, 'true');
                setCanShowDashboardTour(true); // 🎓 HABILITAR dashboard tour incluso si se salta
              }}
            />
          )}

          {/* 🎉 Tour Transition Message - Muestra el dashboard antes del Onboarding Tour */}
          {!isLocked && showTourTransition && currentUser && (
            <Suspense fallback={null}>
              <TourTransitionMessage
                onComplete={() => {
                  setShowTourTransition(false);
                  // El OnboardingTour se activa automáticamente en DashboardScreen
                  // cuando detecta que es la primera vez del usuario
                }}
                duration={4000} // 4 segundos: 3s ver dashboard + 1s fade out
              />
            </Suspense>
          )}
        </>
      )}
      
      <Toaster />
      
      {/* 🎨 OTI CONFIRM DIALOG: Provider para diálogos de confirmación imperativa */}
      {OtiConfirmProvider}
      
      {/* ✅ AUTO TEST RUNNER: DESHABILITADO para evitar broken pipe errors */}
      {/* <AutoTestRunner /> */}
    </div>
  );
}

/**
 * App - Root component with all providers
 */
export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <UIProvider>
          <LocalizationProvider>
            <InvitationsProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </InvitationsProvider>
          </LocalizationProvider>
        </UIProvider>
      </AppProvider>
    </AuthProvider>
  );
}