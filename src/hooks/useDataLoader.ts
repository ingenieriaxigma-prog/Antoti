/**
 * Custom Hooks - Data Loader
 * 
 * ✅ REFACTORIZADO: Usa constantes centralizadas desde /constants/categories.ts
 * Consolidated hook for loading all application data from backend.
 */

import { useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { Account } from '../types';
import { 
  loadAccounts, 
  loadCategories, 
  loadTransactions, 
  loadBudgets,
  saveAccounts,
  saveCategories
} from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useUI } from '../contexts/UIContext';
import { logger } from '../utils/logger';
import { DEFAULT_CATEGORIES } from '../constants/categories';

export function useDataLoader() {
  const { isAuthenticated, currentUser, isCheckingAuth, accessToken } = useAuth();
  const { 
    setCategories, 
    setAccounts, 
    setTransactions, 
    setBudgets,
    setIsInitialLoadComplete,
    setIsLoadingTransactions,
    setHasMoreTransactions
  } = useApp();
  const { setShowProductTour, setCanShowDashboardTour } = useUI(); // ← AGREGAMOS setCanShowDashboardTour

  // ✅ CONSOLIDATED DATA LOADING - Replaces 4+ separate useEffects
  useEffect(() => {
    // ✅ FIX: Esperar a que tengamos un accessToken válido
    // NO confiar solo en isAuthenticated porque puede haber race condition
    
    if (!isAuthenticated || !currentUser || isCheckingAuth || !accessToken) {
      logger.log('⏳ Esperando token válido antes de cargar datos...', {
        isAuthenticated,
        hasUser: !!currentUser,
        isCheckingAuth,
        hasToken: !!accessToken
      });
      // ✅ IMPORTANTE: Limpiar estado si no hay autenticación
      if (!isAuthenticated && !isCheckingAuth) {
        logger.log('❌ No authenticated - clearing app state');
        setCategories([]);
        setAccounts([]);
        setTransactions([]);
        setBudgets([]);
        setIsInitialLoadComplete(false);
        setIsLoadingTransactions(false);
        
        // 🔥 CRITICAL FIX: Clear localStorage data on logout
        localStorage.removeItem('transactions');
        localStorage.removeItem('accounts');
        localStorage.removeItem('categories');
        localStorage.removeItem('budgets');
      }
      return;
    }

    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.log('🔵 [useDataLoader] EJECUTÁNDOSE AHORA');
    logger.log(`🔑 accessToken disponible: ${accessToken.substring(0, 30)}...`);
    logger.log(`👤 Usuario: ${currentUser.email}`);
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const loadAllData = async () => {
      try {
        logger.log('🔄 Starting consolidated data load for user:', currentUser.email);
        logger.log('🔑 Using accessToken from AuthContext:', accessToken.substring(0, 20) + '...');

        // ✅ ULTRA-CRITICAL: setIsInitialLoadComplete(true) MUST BE FIRST
        // Mark complete before anything else - this unblocks UI immediately
        logger.log('✅ Setting isInitialLoadComplete=true RIGHT NOW - UI will render with empty state');
        logger.log(`⏱️ CRITICAL TIMING: setIsInitialLoadComplete(true) at ${new Date().getTime()}`);
        console.log(`🚀 CRITICAL TIMING: setIsInitialLoadComplete(true) at ${new Date().getTime()}`);
        setIsInitialLoadComplete(true);

        // EVERYTHING BELOW IS NON-BLOCKING (background)
        // setIsLoadingTransactions will control skeleton visibility
        setIsLoadingTransactions(true);

        // STEP 1: Load all data in BACKGROUND (non-blocking)
        // These will complete in background while UI renders with empty state
        logger.log('📥 [BACKGROUND] Loading all data (categories, accounts, budgets, transactions)...');
        
        const allDataPromise = Promise.allSettled([
          loadCategories(),
          loadAccounts(accessToken),
          loadBudgets(),
          loadTransactions({ limit: 50, orderBy: 'date', orderDirection: 'desc' })
        ])
          .then((results) => {
            const categoriesData = results[0].status === 'fulfilled' ? results[0].value : [];
            const accountsData = results[1].status === 'fulfilled' ? results[1].value : [];
            const budgetsData = results[2].status === 'fulfilled' ? results[2].value : [];
            const transactionsData = results[3].status === 'fulfilled' ? results[3].value : [];

            logger.log('✅ All data loaded in background:', {
              categories: categoriesData?.length || 0,
              accounts: accountsData?.length || 0,
              budgets: budgetsData?.length || 0,
              transactions: transactionsData?.length || 0,
            });

            // STEP 2: Handle categories
            if (!categoriesData || categoriesData.length === 0) {
              logger.log('📥 [BACKGROUND] Creating default categories...');
              const currentToken = localStorage.getItem('accessToken');
              if (!currentToken) {
                logger.warn('⚠️ No access token available for category save');
                setCategories(DEFAULT_CATEGORIES);
              } else {
                saveCategories(DEFAULT_CATEGORIES)
                  .then(() => {
                    logger.log('✅ Default categories saved successfully');
                    setCategories(DEFAULT_CATEGORIES);
                  })
                  .catch((error) => {
                    logger.error('❌ ERROR saving default categories:', error);
                    setCategories(DEFAULT_CATEGORIES);
                  });
              }
            } else {
              setCategories(categoriesData);
              logger.log('✅ Categories set from backend');
            }

            // STEP 3: Handle accounts
            if (!accountsData || accountsData.length === 0) {
              logger.log('📥 [BACKGROUND] Creating default accounts...');
              const DEFAULT_ACCOUNTS: Account[] = [
                { id: 'ac111111-0000-4000-a000-000000000001', name: 'Efectivo', type: 'cash', balance: 0, icon: 'wallet', color: '#10b981' },
                { id: 'ac111111-0000-4000-a000-000000000002', name: 'Bancolombia', type: 'bank', balance: 0, icon: 'building-2', color: '#FFDE00' },
                { id: 'ac111111-0000-4000-a000-000000000003', name: 'Falabella', type: 'bank', balance: 0, icon: 'building-2', color: '#00A859' },
                { id: 'ac111111-0000-4000-a000-000000000004', name: 'BBVA', type: 'bank', balance: 0, icon: 'building-2', color: '#004481' },
                { id: 'ac111111-0000-4000-a000-000000000005', name: 'Nequi', type: 'digital', balance: 0, icon: 'smartphone', color: '#FF006B' },
                { id: 'ac111111-0000-4000-a000-000000000006', name: 'DaviPlata', type: 'digital', balance: 0, icon: 'smartphone', color: '#EB001B' },
                { id: 'ac111111-0000-4000-a000-000000000007', name: 'Tarjeta de Crédito', type: 'card', balance: 0, icon: 'credit-card', color: '#ef4444' },
                { id: 'ac111111-0000-4000-a000-000000000008', name: 'Deuda', type: 'card', balance: 0, icon: 'credit-card', color: '#dc2626' },
                { id: 'ac111111-0000-4000-a000-000000000009', name: 'Préstamo', type: 'card', balance: 0, icon: 'credit-card', color: '#f97316' },
              ];
              
              setAccounts(DEFAULT_ACCOUNTS);
              saveAccounts(DEFAULT_ACCOUNTS)
                .then(() => {
                  logger.log('✅ Default accounts saved');
                })
                .catch((error) => {
                  logger.error('❌ Error saving default accounts:', error);
                });
            } else {
              setAccounts(accountsData);
              logger.log('✅ Accounts set from backend');
            }

            // STEP 4: Handle budgets
            setBudgets(budgetsData || []);
            logger.log(`✅ Loaded ${budgetsData?.length || 0} budgets`);

            // STEP 5: Handle transactions
            setTransactions(transactionsData || []);
            setHasMoreTransactions((transactionsData?.length || 0) >= 50);
            logger.log(`✅ Set ${transactionsData?.length || 0} transactions in state`);

            // STEP 6: Check product tour
            const tourKey = `hasSeenProductTour_${currentUser.id}`;
            const hasSeenTour = localStorage.getItem(tourKey);
            const dashboardTourKey = `oti_dashboard_tour_completed_${currentUser.id}`;
            const hasSeenDashboardTour = localStorage.getItem(dashboardTourKey);
            
            if (!hasSeenTour) {
              logger.log('🎓 New user - will show ProductTour');
              setShowProductTour(true);
              setCanShowDashboardTour(false);
            } else {
              logger.log('✅ Returning user');
              setShowProductTour(false);
              setCanShowDashboardTour(true);
            }

            // FINAL: Mark transactions as done loading
            logger.log('✅ All background operations complete');
            setIsLoadingTransactions(false);
          })
          .catch((error) => {
            logger.error('❌ Error loading data in background:', error);
            setIsLoadingTransactions(false);
          });

      } catch (error) {
        logger.error('❌ Error in loadAllData:', error);
        setIsInitialLoadComplete(true);
        setIsLoadingTransactions(false);
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('No estás autenticado') && 
            !errorMessage.includes('No access token')) {
          toast.error('Error al cargar datos');
        }
      }
    };

    loadAllData();
  }, [isAuthenticated, currentUser, isCheckingAuth, accessToken]); // ✅ Agregar accessToken
}