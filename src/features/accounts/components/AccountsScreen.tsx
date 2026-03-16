/**
 * AccountsScreen Component
 * 
 * Main screen for managing accounts
 * 
 * Features:
 * - View all accounts grouped by type
 * - Add/Edit/Delete accounts
 * - View balance summary
 * - Generate test data
 */

import { useState } from 'react';
import { ArrowLeft, GraduationCap, Wallet, Building2, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useLocalization } from '../../../hooks/useLocalization';
import { useApp } from '../../../contexts/AppContext';
import BottomNav from '../../../components/BottomNav';
import SpeedDial from '../../../components/dashboard/SpeedDial'; // ✅ NEW: Import SpeedDial
import { ThemeHeaderEffects } from '../../../components/ThemeHeaderEffects'; // 🎨 Import theme effects
import { OtiSpacerMessage } from '../../../components/OtiSpacerMessage'; // 📱 WhatsApp-style spacer
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
import { AccountStats } from './AccountStats';
import { AccountTypeGroup } from './AccountTypeGroup';
import { AccountForm } from './AccountForm';
import { EmptyState } from './EmptyState';
import { AccountService } from '../services';
import type { Account, AccountsScreenProps, AccountType } from '../types';

// 🎓 NEW: Import AccountsTour
import { AccountsTour, shouldShowAccountsTour } from '../../../components/tours/AccountsTour';

export function AccountsScreen({ 
  accounts, 
  onAddAccount, 
  onUpdateAccount, 
  onDeleteAccount, 
  onNavigate 
}: AccountsScreenProps) {
  // State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<AccountType>('cash');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  // 🎓 NEW: Accounts Tour state
  const [showAccountsTour, setShowAccountsTour] = useState(shouldShowAccountsTour());

  const { t } = useLocalization();

  // Currency formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate totals using AccountService
  const totalBalance = AccountService.calculateTotalBalance(accounts);
  const totalAssets = AccountService.calculateTotalAssets(accounts);
  const totalLiabilities = AccountService.calculateTotalDebt(accounts);

  // Account type configuration
  const accountTypeConfig = {
    cash: { icon: Wallet, label: t('accounts.types.cash'), color: '#10b981' },
    bank: { icon: Building2, label: t('accounts.types.bank'), color: '#3b82f6' },
    card: { icon: CreditCard, label: t('accounts.types.credit'), color: '#ef4444' },
    digital: { icon: Smartphone, label: t('accounts.types.digital'), color: '#8b5cf6' },
  };

  // Handlers
  const handleAddAccount = () => {
    if (!newAccountName.trim()) {
      toast.error(t('errors.required'));
      return;
    }

    const balance = parseFloat(newAccountBalance) || 0;
    const config = accountTypeConfig[newAccountType];

    onAddAccount({
      name: newAccountName.trim(),
      type: newAccountType,
      balance,
      icon: config.icon.name,
      color: config.color,
    });

    toast.success(t('accounts.created'), {
      description: `${newAccountName} - ${formatCurrency(balance)}`,
    });

    handleCloseForm();
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setNewAccountName(account.name);
    setNewAccountType(account.type);
    setNewAccountBalance(account.balance.toString());
    setShowAddForm(true);
  };

  const handleUpdateAccount = () => {
    if (!editingAccount || !newAccountName.trim()) {
      toast.error(t('errors.required'));
      return;
    }

    const balance = parseFloat(newAccountBalance) || 0;
    const config = accountTypeConfig[newAccountType];

    onUpdateAccount(editingAccount.id, {
      name: newAccountName.trim(),
      type: newAccountType,
      balance,
      icon: config.icon.name,
      color: config.color,
    });

    toast.success(t('accounts.updated'), {
      description: newAccountName,
    });

    handleCloseForm();
  };

  const handleDeleteAccount = () => {
    if (!deleteAccountId) return;

    const success = onDeleteAccount(deleteAccountId);
    if (success) {
      toast.success(t('accounts.deleted'));
    } else {
      toast.error(t('accounts.deleteConfirm'));
    }
    setDeleteAccountId(null);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingAccount(null);
    setNewAccountName('');
    setNewAccountBalance('');
    setNewAccountType('cash');
  };

  const handleGenerateTestData = () => {
    const testAccounts = [
      { name: 'Efectivo Principal', type: 'cash' as const, balance: 500000, icon: 'Wallet', color: '#10b981' },
      { name: 'Banco Davivienda', type: 'bank' as const, balance: 2500000, icon: 'Building2', color: '#3b82f6' },
      { name: 'Tarjeta Visa', type: 'card' as const, balance: -450000, icon: 'CreditCard', color: '#ef4444' },
      { name: 'Nequi', type: 'digital' as const, balance: 180000, icon: 'Smartphone', color: '#8b5cf6' },
      { name: 'Banco Bancolombia', type: 'bank' as const, balance: 1800000, icon: 'Building2', color: '#3b82f6' },
      { name: 'Daviplata', type: 'digital' as const, balance: 75000, icon: 'Smartphone', color: '#8b5cf6' },
    ];

    testAccounts.forEach((account, index) => {
      setTimeout(() => {
        onAddAccount(account);
      }, index * 100);
    });

    toast.success(t('accounts.created'), {
      description: `${testAccounts.length} cuentas de ejemplo`,
    });
  };

  // Group accounts by type
  const groupedAccounts = AccountService.groupByType(accounts);
  
  // Get current theme from localStorage
  const theme = localStorage.getItem('colorTheme') || 'blue';

  return (
    <div className="flex flex-col mobile-screen-height bg-gray-50 dark:bg-gray-950 prevent-overscroll relative">
      {/* ✅ HEADER: Same style as Budgets */}
      <div className="fixed-top-header bg-white dark:bg-gray-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm z-10 safe-area-top relative overflow-hidden">
        {/* 🎨 Efectos temáticos del header */}
        <ThemeHeaderEffects theme={theme} />
        
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
            {t('accounts.title')}
          </h1>
          
          {/* Right: Tour Button */}
          <button
            onClick={() => setShowAccountsTour(true)}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors touch-target-md tap-scale shrink-0"
            aria-label="Tour de cuentas"
          >
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto content-with-fixed-header-and-nav momentum-scroll">
        {/* Balance Summary */}
        <div className="px-4 sm:px-6 pt-6 pb-4">
          <AccountStats
            totalBalance={totalBalance}
            totalAssets={totalAssets}
            totalLiabilities={totalLiabilities}
            formatCurrency={formatCurrency}
          />
        </div>

        {/* Accounts List */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-24">
          {/* Empty State */}
          {accounts.length === 0 && (
            <EmptyState
              onAddAccount={() => setShowAddForm(true)}
              onGenerateTestData={handleGenerateTestData}
            />
          )}
          
          {/* Accounts by Type */}
          {Object.entries(groupedAccounts).map(([type, typeAccounts]) => {
            if (typeAccounts.length === 0) return null;
            
            const config = accountTypeConfig[type as keyof typeof accountTypeConfig];
            const typeTotal = AccountService.calculateBalanceByType(accounts, type as AccountType);

            return (
              <AccountTypeGroup
                key={type}
                type={type}
                accounts={typeAccounts}
                config={config}
                typeTotal={typeTotal}
                formatCurrency={formatCurrency}
                onEdit={handleEditAccount}
                onDelete={(id) => setDeleteAccountId(id)}
              />
            );
          })}

          {/* WhatsApp-style Spacer - Evita que el FAB tape contenido */}
          <OtiSpacerMessage
            message="Has visto todas tus cuentas. Pregúntale a Oti sobre tu balance"
            show={accounts.length > 0}
          />
        </div>
      </div>

      {/* Add/Edit Account Form */}
      <AccountForm
        show={showAddForm}
        editingAccount={editingAccount}
        accountName={newAccountName}
        accountType={newAccountType}
        accountBalance={newAccountBalance}
        onAccountNameChange={setNewAccountName}
        onAccountTypeChange={setNewAccountType}
        onAccountBalanceChange={setNewAccountBalance}
        onSubmit={editingAccount ? handleUpdateAccount : handleAddAccount}
        onClose={handleCloseForm}
        accountTypeConfig={accountTypeConfig}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteAccountId !== null} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('accounts.deleteAccount')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('accounts.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDeleteAccountId(null);
            }}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteAccount();
              }} 
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Oti FAB - Asistente Inteligente (Derecha) */}
      {/* En móvil y desktop: absolute para mantenerse dentro del contenedor centrado */}
      <div className="absolute bottom-20 right-6 z-40">
        <SpeedDial
          context="accounts"
          onChatClick={() => onNavigate('oti-chat')}
          onManualClick={() => setShowAddForm(true)}
          theme={theme}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="accounts" onNavigate={onNavigate} />

      {/* 🎓 Tour System */}
      {showAccountsTour && (
        <AccountsTour onComplete={() => setShowAccountsTour(false)} />
      )}
    </div>
  );
}