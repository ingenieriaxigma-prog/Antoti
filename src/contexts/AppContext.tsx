/**
 * AppContext - Global Application State
 * 
 * Manages the core data of the application:
 * - Transactions, Accounts, Categories, Budgets
 * - Selected Month/Year (shared across screens)
 */

import { createContext, useContext, ReactNode, useState } from 'react';
import { Account, Transaction, Category, Budget } from '../types';
import { getColombiaTime } from '../utils/dateUtils'; // ✅ Import getColombiaTime
import { loadTransactions } from '../utils/api'; // ✅ Import for lazy loading
import { useAuth } from './AuthContext'; // ✅ Import for token access

interface AppContextType {
  // Data State
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  
  // Loading State
  isInitialLoadComplete: boolean;
  isLoadingTransactions: boolean;
  hasMoreTransactions: boolean;
  isLoadingMoreTransactions: boolean;
  
  // Selected Month/Year State (shared across Dashboard, Budgets, Statistics)
  selectedMonth: number;
  selectedYear: number;
  
  // Setters for raw state (used by data loader)
  setTransactions: (transactions: Transaction[]) => void;
  setAccounts: (accounts: Account[]) => void;
  setCategories: (categories: Category[]) => void;
  setBudgets: (budgets: Budget[]) => void;
  setIsInitialLoadComplete: (value: boolean) => void;
  setIsLoadingTransactions: (value: boolean) => void;
  setHasMoreTransactions: (value: boolean) => void;
  
  // Lazy loading functions
  loadMoreTransactions: () => Promise<void>;
  
  // Setters for selected month/year
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { accessToken } = useAuth(); // ✅ Get access token for API calls
  
  // Data State - Managed by hooks in AppContent
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  // CRITICAL: Flag to prevent race conditions between initial load and auto-save
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  
  // Lazy loading state
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [isLoadingMoreTransactions, setIsLoadingMoreTransactions] = useState(false);
  
  // Selected Month/Year - Shared across screens (Dashboard, Budgets, Statistics)
  const colombiaTime = getColombiaTime(); // ✅ FIX: Use Colombia time for initial state
  const [selectedMonth, setSelectedMonth] = useState(colombiaTime.getMonth());
  const [selectedYear, setSelectedYear] = useState(colombiaTime.getFullYear());

  // Lazy loading function
  const loadMoreTransactions = async () => {
    if (!hasMoreTransactions || isLoadingMoreTransactions || !accessToken) return;
    
    setIsLoadingMoreTransactions(true);
    try {
      const currentCount = transactions.length;
      const newTransactions = await loadTransactions({
        limit: 50,
        offset: currentCount,
        orderBy: 'date',
        orderDirection: 'desc'
      });
      
      if (newTransactions.length < 50) {
        setHasMoreTransactions(false); // No more transactions to load
      }
      
      // Append new transactions to existing ones
      setTransactions(prev => [...prev, ...newTransactions]);
    } catch (error) {
      console.error('Error loading more transactions:', error);
      // Keep hasMoreTransactions as true to allow retry
    } finally {
      setIsLoadingMoreTransactions(false);
    }
  };

  const value: AppContextType = {
    // Data
    transactions,
    accounts,
    categories,
    budgets,
    
    // Loading state
    isInitialLoadComplete,
    isLoadingTransactions,
    hasMoreTransactions,
    isLoadingMoreTransactions,
    
    // Selected Month/Year
    selectedMonth,
    selectedYear,
    
    // Setters
    setTransactions,
    setAccounts,
    setCategories,
    setBudgets,
    setIsInitialLoadComplete,
    setIsLoadingTransactions,
    setHasMoreTransactions,
    
    // Lazy loading functions
    loadMoreTransactions,
    
    // Setters for selected month/year
    setSelectedMonth,
    setSelectedYear,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}