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
    setIsLoadingTransactions
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

        // ✅ Indicar que estamos cargando transacciones
        setIsLoadingTransactions(true);

        // ✅ CRITICAL FIX: Pasar el token explícitamente a las funciones API
        // para evitar race condition con localStorage
        logger.log('🔑 Passing token explicitly to avoid localStorage race condition');

        // ✅ OPTIMIZACIÓN: Eliminar delay innecesario - Supabase ya maneja la sincronización
        // STEP 1: Load all data from Supabase in parallel (más rápido)
        logger.log('📥 Loading data from Supabase...');
        const [categoriesData, accountsData, transactionsData, budgetsData] = await Promise.all([
          loadCategories(),
          loadAccounts(accessToken), // ← FIX: Pasar token explícitamente
          loadTransactions(),
          loadBudgets(),
        ]);

        logger.log('✅ Data loaded:', {
          categories: categoriesData?.length || 0,
          accounts: accountsData?.length || 0,
          transactions: transactionsData?.length || 0,
          budgets: budgetsData?.length || 0,
        });

        // STEP 2: Handle categories (create defaults if needed)
        if (!categoriesData || categoriesData.length === 0) {
          logger.log('⚠️ No categories found - creating default categories from constants');
          
          // ✅ REFACTORIZADO: Usar DEFAULT_CATEGORIES desde constants
          logger.log(`📦 Using ${DEFAULT_CATEGORIES.length} default categories from /constants/categories.ts`);
          
          // ✅ FIX: Verificar token nuevamente antes de guardar
          const currentToken = localStorage.getItem('accessToken');
          if (!currentToken) {
            logger.warn('⚠️ No access token available - skipping save, using in-memory defaults only');
            setCategories(DEFAULT_CATEGORIES);
          } else {
            // ✅ FIX: Save categories to database immediately and set state
            logger.log('💾 Attempting to save default categories to database...');
            try {
              await saveCategories(DEFAULT_CATEGORIES);
              logger.log('✅ Default categories saved successfully to database');
              setCategories(DEFAULT_CATEGORIES);
              logger.log('✅ Default categories set in state');
            } catch (error) {
              logger.error('❌ ERROR saving default categories:', error);
              // ✅ NO mostrar toast si es error de autenticación
              const errorMessage = error instanceof Error ? error.message : String(error);
              if (!errorMessage.includes('No estás autenticado')) {
                toast.error('Error al guardar categorías por defecto');
              }
              // Set categories in state anyway so the UI isn't broken
              setCategories(DEFAULT_CATEGORIES);
            }
          }
        } else {
          logger.log(`✅ Loaded ${categoriesData.length} categories from database`);
          logger.log('📋 Categories data received:', categoriesData.map(c => ({
            id: c.id,
            name: c.name,
            type: c.type,
            subcategoriesCount: c.subcategories?.length || 0,
            firstSubcategory: c.subcategories?.[0]
          })));
          setCategories(categoriesData);
          logger.log('✅ Categories set in state via setCategories()');
        }

        // STEP 3: Handle accounts - SIMPLIFIED LOGIC
        // REGLA: Solo crear cuentas si el usuario NO tiene NINGUNA (primera vez)
        if (!accountsData || accountsData.length === 0) {
          // ✅ Usuario nuevo - crear 9 cuentas por defecto (7 originales + 2 adicionales)
          logger.log('🆕 New user - creating default accounts (ONLY ONCE)');
          
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
          
          // ✅ CRITICAL FIX: Calculate balances from transactions BEFORE saving accounts
          // This ensures accounts have correct balances immediately after login
          if (transactionsData && transactionsData.length > 0) {
            logger.log(`💰 Calculating balances from ${transactionsData.length} transactions...`);
            
            // Calculate balance for each account
            DEFAULT_ACCOUNTS.forEach(account => {
              const accountTransactions = transactionsData.filter(t => 
                t.account === account.id || t.toAccount === account.id
              );
              
              let balance = 0;
              accountTransactions.forEach(t => {
                if (t.type === 'income' && t.account === account.id) {
                  balance += t.amount;
                } else if (t.type === 'expense' && t.account === account.id) {
                  balance -= t.amount;
                } else if (t.type === 'transfer') {
                  if (t.account === account.id) {
                    balance -= t.amount; // Money leaving this account
                  }
                  if (t.toAccount === account.id) {
                    balance += t.amount; // Money entering this account
                  }
                }
              });
              
              account.balance = balance;
              logger.log(`   💵 ${account.name}: $${balance.toLocaleString()}`);
            });
            
            logger.log('✅ Balances calculated successfully');
          } else {
            logger.log('ℹ️  No transactions found - accounts will have 0 balance');
          }
          
          try {
            await saveAccounts(DEFAULT_ACCOUNTS);
            logger.log('✅ Default accounts saved to database WITH calculated balances');
            setAccounts(DEFAULT_ACCOUNTS);
          } catch (error) {
            logger.error('❌ Error saving default accounts:', error);
            setAccounts(DEFAULT_ACCOUNTS); // Set in memory anyway
          }
        } else {
          // ✅ Usuario existente - usar cuentas de BD (con balances calculados)
          logger.log(`✅ Loaded ${accountsData.length} accounts from backend`);
          logger.log(`   💰 Balances: ${accountsData.map(a => `${a.name}=$${a.balance.toLocaleString()}`).join(', ')}`);
          setAccounts(accountsData);
        }

        // STEP 4: Handle transactions (always use data from Supabase)
        logger.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        logger.log(`📥 [STEP 11] FRONTEND - Loading transactions...`);
        
        if (transactionsData && transactionsData.length > 0) {
          logger.log(`✅ Loaded ${transactionsData.length} transactions`);
          logger.log(`📊 First transaction:`, {
            id: transactionsData[0].id.substring(0, 8) + '...',
            account: transactionsData[0].account || 'MISSING ❌',
            amount: transactionsData[0].amount,
            type: transactionsData[0].type,
          });
        } else {
          logger.log(`⚠️  No transactions found in database`);
        }
        logger.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        
        setTransactions(transactionsData || []);
        logger.log(`✅ Set ${transactionsData?.length || 0} transactions in state`);

        // STEP 5: Handle budgets - NEVER create default budgets
        // Los presupuestos se crean solo cuando el usuario los necesite
        // porque requieren categoryId que debe existir en la base de datos
        setBudgets(budgetsData || []);
        logger.log(`✅ Loaded ${budgetsData?.length || 0} budgets`);

        // STEP 6: Check if user should see product tour
        const tourKey = `hasSeenProductTour_${currentUser.id}`;
        const hasSeenTour = localStorage.getItem(tourKey);
        
        // 🎓 NUEVO: También verificar si el dashboard tour fue completado
        const dashboardTourKey = `oti_dashboard_tour_completed_${currentUser.id}`;
        const hasSeenDashboardTour = localStorage.getItem(dashboardTourKey);
        
        if (!hasSeenTour) {
          logger.log('🎓 New user - will show ProductTour first');
          setShowProductTour(true);
          setCanShowDashboardTour(false); // ← BLOQUEAR dashboard tour hasta completar ProductTour
        } else {
          logger.log('✅ Returning user - ProductTour already completed');
          setShowProductTour(false);
          setCanShowDashboardTour(true); // ← PERMITIR dashboard tour solo si ProductTour ya se completó
          
          // 🎓 Si ProductTour ya fue visto pero Dashboard tour NO, marcamos flag
          if (!hasSeenDashboardTour) {
            logger.log('🎓 Dashboard tour pending - will be shown after transition');
          }
        }

        // STEP 7: Mark initial load as complete
        logger.log('✅ Initial data load complete - auto-save enabled');
        setIsInitialLoadComplete(true);

      } catch (error) {
        logger.error('❌ Error loading data:', error);
        
        // ✅ Solo mostrar error si no es un error de autenticación
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('No estás autenticado') && 
            !errorMessage.includes('No access token')) {
          toast.error('Error al cargar datos');
        }
        
        // Still mark as complete even if there was an error
        setIsInitialLoadComplete(true);
      } finally {
        // ✅ Siempre desactivar el loading al terminar
        setIsLoadingTransactions(false);
      }
    };

    loadAllData();
  }, [isAuthenticated, currentUser, isCheckingAuth, accessToken]); // ✅ Agregar accessToken
}