/**
 * NewTransactionScreen Component
 * 
 * Screen for creating and editing transactions
 * 
 * Features:
 * - Create income/expense/transfer transactions
 * - Edit existing transactions
 * - Select category, account, date
 * - Voice recognition support
 * - Category management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, Calendar, Mic, Paperclip, X, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useLocalization } from '../../../hooks/useLocalization';
import { TransactionService } from '../services';
import { getTodayLocalDate, parseLocalDate } from '../../../utils/dateUtils'; // ✅ Import getTodayLocalDate

// Import types
import type { 
  NewTransactionScreenProps, 
  TransactionType,
  ActiveField,
} from '../types/transaction.types';

// Import individual components directly
import TransactionHeader from '../../../components/new-transaction/TransactionHeader';
import TransactionTypeTabs from '../../../components/new-transaction/TransactionTypeTabs';
import QuickOverviewFields from '../../../components/new-transaction/QuickOverviewFields';
import FieldEditorPanel from '../../../components/new-transaction/FieldEditorPanel';
import FloatingActionButton from '../../../components/new-transaction/FloatingActionButton';

// Import modal components
import CategoryManagementModal from '../../../components/CategoryManagementModal';
import VoiceRecognition, { type VoiceCommand } from '../../../components/VoiceRecognition';

export function NewTransactionScreen({
  accounts,
  categories,
  transactions,
  editingTransactionId,
  onAddTransaction,
  onUpdateTransaction,
  onNavigate,
  onGoBack,
  onClearEditing,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: NewTransactionScreenProps) {
  // State management
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || '');
  const [selectedToAccount, setSelectedToAccount] = useState(accounts[1]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [date, setDate] = useState(getTodayLocalDate()); // ✅ Use getTodayLocalDate
  const [note, setNote] = useState('');
  const [activeField, setActiveField] = useState<ActiveField>('amount');
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [showVoiceRecognition, setShowVoiceRecognition] = useState(false);

  // ✅ Utility functions
  const formatCurrency = useCallback((value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(num);
  }, []);

  // ✅ Format number for display (with thousands separators)
  const formatNumberDisplay = useCallback((num: string) => {
    if (!num || num === '0' || num === '') return '0';
    
    // Split by comma (Colombian decimal separator) to handle integer and decimal parts separately
    const parts = num.split(',');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Format integer part with thousands separators (.) - Colombian format
    const formattedInteger = new Intl.NumberFormat('es-CO').format(parseInt(integerPart) || 0);
    
    // Return with decimal part if exists
    if (decimalPart !== undefined) {
      return `${formattedInteger},${decimalPart}`;
    }
    
    return formattedInteger;
  }, []);

  // ✅ Get category name
  const getCategoryName = useCallback((categoryId: string) => {
    if (!categoryId) return '';
    return categories.find(c => c.id === categoryId)?.name || '';
  }, [categories]);

  // ✅ Get subcategory name
  const getSubcategoryName = useCallback((subcategoryId: string) => {
    if (!subcategoryId) return '';
    for (const category of categories) {
      const subcategory = category.subcategories?.find(s => s.id === subcategoryId);
      if (subcategory) return subcategory.name;
    }
    return '';
  }, [categories]);

  // ✅ Get account name
  const getAccountName = useCallback((accountId: string) => {
    if (!accountId) return '';
    return accounts.find(a => a.id === accountId)?.name || '';
  }, [accounts]);

  // ✅ Load transaction for editing
  useEffect(() => {
    if (editingTransactionId) {
      const transaction = transactions.find(t => t.id === editingTransactionId);
      if (transaction) {
        setTransactionType(transaction.type);
        setAmount(transaction.amount.toString());
        setSelectedAccount(transaction.account);
        setSelectedToAccount(transaction.toAccount || accounts[1]?.id || '');
        setSelectedCategory(transaction.category || '');
        setSelectedSubcategory(transaction.subcategory || '');
        setDate(transaction.date);
        setNote(transaction.note || '');
      }
    }
  }, [editingTransactionId, transactions, accounts]);

  // ✅ Filter categories by type
  const filteredCategories = useMemo(() => {
    if (transactionType === 'transfer') return [];
    return categories.filter(c => c.type === transactionType);
  }, [categories, transactionType]);

  // ✅ Available subcategories
  const availableSubcategories = useMemo(() => {
    const category = categories.find(c => c.id === selectedCategory);
    return category?.subcategories || [];
  }, [categories, selectedCategory]);

  // ✅ Handle save transaction
  const handleSave = useCallback(() => {
    // Convert Colombian format (1.000,50) to JavaScript format (1000.50) for parseFloat
    const normalizedAmount = amount.replace(/\./g, '').replace(',', '.');
    
    if (!amount || parseFloat(normalizedAmount) <= 0) {
      toast.error('Por favor ingresa un monto válido');
      return;
    }

    if (!selectedAccount) {
      toast.error('Por favor selecciona una cuenta');
      return;
    }

    if (transactionType === 'transfer' && !selectedToAccount) {
      toast.error('Por favor selecciona una cuenta destino');
      return;
    }

    if (transactionType !== 'transfer' && !selectedCategory) {
      toast.error('Por favor selecciona una categoría');
      return;
    }

    const transactionData = {
      type: transactionType,
      amount: parseFloat(normalizedAmount),
      category: transactionType === 'transfer' ? undefined : selectedCategory,
      subcategory: transactionType === 'transfer' ? undefined : (selectedSubcategory || undefined),
      account: selectedAccount,
      toAccount: transactionType === 'transfer' ? selectedToAccount : undefined,
      date,
      note: note || undefined,
    };

    if (editingTransactionId) {
      onUpdateTransaction(editingTransactionId, transactionData);
      toast.success('Transacción actualizada');
      onClearEditing();
    } else {
      onAddTransaction(transactionData);
      toast.success('Transacción creada');
    }

    // Navigate back
    if (onGoBack) {
      onGoBack();
    } else {
      onNavigate('transactions');
    }
  }, [
    amount,
    selectedAccount,
    selectedToAccount,
    selectedCategory,
    selectedSubcategory,
    transactionType,
    date,
    note,
    editingTransactionId,
    onAddTransaction,
    onUpdateTransaction,
    onClearEditing,
    onNavigate,
    onGoBack,
  ]);

  // ✅ Handle voice command
  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    setAmount(command.amount.toString());
    if (command.category) setSelectedCategory(command.category);
    if (command.subcategory) setSelectedSubcategory(command.subcategory);
    if (command.type) setTransactionType(command.type as TransactionType);
    if (command.note) setNote(command.note);
    setShowVoiceRecognition(false);
    toast.success('Comando de voz procesado');
  }, []);

  // ✅ Handle cancel
  const handleCancel = useCallback(() => {
    if (editingTransactionId) {
      onClearEditing();
    }
    if (onGoBack) {
      onGoBack();
    } else {
      onNavigate('transactions');
    }
  }, [editingTransactionId, onClearEditing, onGoBack, onNavigate]);

  return (
    <div className="flex flex-col mobile-screen-height bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <TransactionHeader
        isEditing={!!editingTransactionId}
        onCancel={handleCancel}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto content-with-header-sm pb-safe momentum-scroll">
        {/* Transaction Type Tabs */}
        <TransactionTypeTabs
          transactionType={transactionType}
          onTypeChange={(type) => {
            setTransactionType(type);
            setSelectedCategory('');
            setSelectedSubcategory('');
          }}
        />

        {/* Quick Overview Fields */}
        <QuickOverviewFields
          transactionType={transactionType}
          date={date}
          amount={amount}
          activeField={activeField}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          selectedAccount={selectedAccount}
          selectedToAccount={selectedToAccount}
          note={note}
          hasSubcategories={availableSubcategories.length > 0}
          parseLocalDate={parseLocalDate}
          formatNumberDisplay={formatNumberDisplay}
          getCategoryName={getCategoryName}
          getSubcategoryName={getSubcategoryName}
          getAccountName={getAccountName}
          onFieldClick={setActiveField}
          onAmountChange={setAmount} // ✅ NEW: Direct amount change handler
        />

        {/* Field Editor Panel */}
        <FieldEditorPanel
          activeField={activeField}
          transactionType={transactionType}
          amount={amount}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          selectedAccount={selectedAccount}
          selectedToAccount={selectedToAccount}
          date={date}
          note={note}
          filteredCategories={filteredCategories}
          availableSubcategories={availableSubcategories}
          accounts={accounts}
          onAmountChange={setAmount}
          onCategorySelect={(categoryId) => {  // ✅ CORREGIDO: onCategorySelect en vez de onCategoryChange
            setSelectedCategory(categoryId);
            setSelectedSubcategory('');
            
            // ✅ NEW: Auto-open subcategories if the selected category has them
            const category = categories.find(c => c.id === categoryId);
            if (category?.subcategories && category.subcategories.length > 0) {
              setActiveField('subcategory');
            } else {
              setActiveField(null);
            }
          }}
          onSubcategorySelect={setSelectedSubcategory}  // ✅ CORREGIDO: onSubcategorySelect en vez de onSubcategoryChange
          onAccountSelect={setSelectedAccount}  // ✅ CORREGIDO: onAccountSelect en vez de onAccountChange
          onToAccountSelect={setSelectedToAccount}  // ✅ CORREGIDO: onToAccountSelect en vez de onToAccountChange
          onDateChange={setDate}
          onNoteChange={setNote}
          onManageCategories={() => setShowCategoryManagement(true)}
          onClose={() => setActiveField(null)}  // ✅ AGREGADO: onClose faltaba
        />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onSubmit={handleSave}
        transactionType={transactionType}
        isDisabled={!amount || parseFloat(amount.replace(/\./g, '').replace(',', '.')) <= 0 || !selectedAccount || (transactionType !== 'transfer' && !selectedCategory)}
        isEditing={!!editingTransactionId}
      />

      {/* Category Management Modal */}
      {showCategoryManagement && onAddCategory && onUpdateCategory && onDeleteCategory && (
        <CategoryManagementModal
          categories={filteredCategories}
          transactionType={transactionType === 'transfer' ? 'expense' : transactionType}
          onClose={() => setShowCategoryManagement(false)}
          onAddCategory={onAddCategory}
          onUpdateCategory={onUpdateCategory}
          onDeleteCategory={onDeleteCategory}
        />
      )}

      {/* Voice Recognition */}
      {showVoiceRecognition && (
        <VoiceRecognition
          accounts={accounts}
          categories={categories}
          onVoiceCommand={handleVoiceCommand}
          onClose={() => setShowVoiceRecognition(false)}
        />
      )}
    </div>
  );
}