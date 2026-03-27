/**
 * TransactionsScreen Component
 * 
 * Main screen for viewing and managing transactions
 * 
 * Features:
 * - View all transactions grouped by date
 * - Filter by type (income/expense/transfer/all)
 * - Search transactions
 * - Month summary
 * - Edit/Delete transactions
 */

import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { useLocalization } from '../../../hooks/useLocalization';
import { useApp } from '../../../contexts/AppContext';
import BottomNav from '../../../components/BottomNav';
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
import { TransactionService } from '../services';
import type { Transaction, TransactionType, TransactionsScreenProps } from '../types';

// Import existing optimized components temporarily
import TransactionsHeader from '../../../components/transactions/TransactionsHeader';
import TransactionsSearch from '../../../components/transactions/TransactionsSearch';
import MonthSummary from '../../../components/transactions/MonthSummary';
import FilterTabs from '../../../components/transactions/FilterTabs';
import TransactionsList from '../../../components/transactions/TransactionsList';
import FloatingActionButton from '../../../components/transactions/FloatingActionButton';

export function TransactionsScreen({ 
  transactions, 
  accounts, 
  categories, 
  onDeleteTransaction, 
  onEditTransaction, 
  onNavigate 
}: TransactionsScreenProps) {
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  const { t } = useLocalization();
  const { hasMoreTransactions, isLoadingMoreTransactions, loadMoreTransactions } = useApp();

  // ✅ Utility functions
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  const getCategoryName = useCallback((categoryId?: string, subcategoryId?: string) => {
    if (!categoryId) return t('transactions.types.transfer');
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    
    if (subcategoryId) {
      const subcategory = category.subcategories?.find(s => s.id === subcategoryId);
      if (subcategory) {
        return `${category.name} - ${subcategory.name}`;
      }
    }
    
    return category.name;
  }, [categories, t]);

  const getAccountName = useCallback((accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.name || accountId || '';
  }, [accounts]);

  const getCategoryColor = useCallback((categoryId?: string) => {
    if (!categoryId) return '#6b7280';
    return categories.find(c => c.id === categoryId)?.color || '#6b7280';
  }, [categories]);

  const getCategoryEmoji = useCallback((categoryId?: string, type?: TransactionType) => {
    if (!categoryId || type === 'transfer') return '↔️';
    const category = categories.find(c => c.id === categoryId);
    return category?.emoji || '📝';
  }, [categories]);

  // ✅ Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by type
    filtered = TransactionService.filterByType(filtered, filterType);

    // Filter by search query
    filtered = TransactionService.filterBySearch(filtered, searchQuery, categories);

    // Sort by date (newest first)
    filtered = TransactionService.sortByDate(filtered, false);

    return filtered;
  }, [transactions, filterType, searchQuery, categories]);

  // 🆕 Group transactions by date and prepare for TransactionsList
  const { groupedTransactions, sortedDates } = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};
    
    filteredTransactions.forEach(transaction => {
      const date = transaction.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    
    const sorted = Object.keys(grouped).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
    
    return {
      groupedTransactions: grouped,
      sortedDates: sorted
    };
  }, [filteredTransactions]);

  // 🆕 Helper functions for TransactionsList
  const getDayTotal = useCallback((dayTransactions: Transaction[]) => {
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses };
  }, []);

  const parseDate = useCallback((dateString: string) => {
    return new Date(dateString);
  }, []);

  const getSubcategoryName = useCallback((categoryId?: string, subcategoryId?: string) => {
    if (!categoryId || !subcategoryId) return null;
    const category = categories.find(c => c.id === categoryId);
    if (!category) return null;
    const subcategory = category.subcategories?.find(s => s.id === subcategoryId);
    return subcategory?.name || null;
  }, [categories]);

  // ✅ Transaction counts
  const transactionCounts = useMemo(() => {
    return TransactionService.countByType(transactions);
  }, [transactions]);

  // ✅ Handlers
  const handleDeleteTransaction = useCallback(() => {
    if (!deleteTransactionId) return;
    onDeleteTransaction(deleteTransactionId);
    toast.success(t('transactions.deleted'));
    setDeleteTransactionId(null);
  }, [deleteTransactionId, onDeleteTransaction, t]);

  return (
    <div className="flex flex-col mobile-screen-height bg-gray-50 dark:bg-gray-950 prevent-overscroll relative">
      {/* Header */}
      <TransactionsHeader onNavigate={onNavigate} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto content-with-header-sm-and-nav momentum-scroll">
        {/* Search */}
        <div className="px-4 sm:px-6 pt-4">
          <TransactionsSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Month Summary */}
        <MonthSummary
          transactions={transactions}
          formatCurrency={formatCurrency}
        />

        {/* Filter Tabs */}
        <div className="px-4 sm:px-6">
          <FilterTabs
            filterType={filterType}
            onFilterChange={setFilterType}
            transactionCounts={transactionCounts}
          />
        </div>

        {/* Transactions List */}
        <TransactionsList
          transactions={filteredTransactions}
          categories={categories}
          accounts={accounts}
          formatCurrency={formatCurrency}
          getCategoryName={getCategoryName}
          getCategoryColor={getCategoryColor}
          getCategoryEmoji={getCategoryEmoji}
          getAccountName={getAccountName}
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={(id) => setDeleteTransactionId(id)}
          // 🆕 New props for grouping and helper functions
          groupedTransactions={groupedTransactions}
          sortedDates={sortedDates}
          getDayTotal={getDayTotal}
          parseDate={parseDate}
          getSubcategoryName={getSubcategoryName}
          // 🆕 Lazy loading props
          hasMoreTransactions={hasMoreTransactions}
          isLoadingMoreTransactions={isLoadingMoreTransactions}
          onLoadMoreTransactions={loadMoreTransactions}
        />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => onNavigate('new-transaction')} />

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

      {/* Bottom Navigation */}
      <BottomNav currentScreen="transactions" onNavigate={onNavigate} />
    </div>
  );
}