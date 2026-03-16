import { memo } from 'react';
import { Edit2, X } from 'lucide-react';
import { Account, Category } from '../../types';
import CustomKeyboard from '../CustomKeyboard';
import CategorySelector from './CategorySelector';
import SubcategorySelector from './SubcategorySelector';
import AccountSelector from './AccountSelector';
import DateEditor from './DateEditor';
import NoteEditor from './NoteEditor';

/**
 * FieldEditorPanel Component
 * 
 * Bottom panel that displays the appropriate editor based on activeField.
 * Handles amount keyboard, category grid, account list, date picker, and note textarea.
 * Memoized to prevent re-renders when unrelated values change.
 * 
 * @param {string | null} activeField - Currently active field
 * @param {'income' | 'expense' | 'transfer'} transactionType - Transaction type
 * @param {string} amount - Amount value
 * @param {string} date - Date value
 * @param {string} note - Note value
 * @param {Category[]} filteredCategories - Categories for current type
 * @param {Array} availableSubcategories - Subcategories for selected category
 * @param {Account[]} accounts - Available accounts
 * @param {string} selectedCategory - Selected category ID
 * @param {string} selectedSubcategory - Selected subcategory ID
 * @param {string} selectedAccount - Selected account ID
 * @param {string} selectedToAccount - Selected to-account ID
 * @param {Function} onAmountChange - Amount change handler
 * @param {Function} onDateChange - Date change handler
 * @param {Function} onNoteChange - Note change handler
 * @param {Function} onCategorySelect - Category selection handler
 * @param {Function} onSubcategorySelect - Subcategory selection handler
 * @param {Function} onAccountSelect - Account selection handler
 * @param {Function} onToAccountSelect - To-account selection handler
 * @param {Function} onManageCategories - Open category management
 * @param {Function} onClose - Close panel handler
 */

type ActiveField = 'amount' | 'category' | 'subcategory' | 'account' | 'toAccount' | 'date' | 'note' | null;

interface FieldEditorPanelProps {
  activeField: ActiveField;
  transactionType: 'income' | 'expense' | 'transfer';
  amount: string;
  date: string;
  note: string;
  filteredCategories: Category[];
  availableSubcategories: any[];
  accounts: Account[];
  selectedCategory: string;
  selectedSubcategory: string;
  selectedAccount: string;
  selectedToAccount: string;
  onAmountChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onCategorySelect: (categoryId: string) => void;
  onSubcategorySelect: (subcategoryId: string) => void;
  onAccountSelect: (accountId: string) => void;
  onToAccountSelect: (accountId: string) => void;
  onManageCategories: () => void;
  onClose: () => void;
}

const FieldEditorPanel = memo<FieldEditorPanelProps>(
  ({
    activeField,
    transactionType,
    amount,
    date,
    note,
    filteredCategories,
    availableSubcategories,
    accounts,
    selectedCategory,
    selectedSubcategory,
    selectedAccount,
    selectedToAccount,
    onAmountChange,
    onDateChange,
    onNoteChange,
    onCategorySelect,
    onSubcategorySelect,
    onAccountSelect,
    onToAccountSelect,
    onManageCategories,
    onClose,
  }) => {
    if (!activeField) return null;

    // ✅ NEW: Amount field now uses native input in QuickOverviewFields
    // No need to show keyboard panel
    if (activeField === 'amount') return null;

    return (
      <>
        {/* Field Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-gray-900 dark:text-white">
            {activeField === 'category' && 'Categoría'}
            {activeField === 'subcategory' && 'Subcategoría'}
            {activeField === 'account' &&
              (transactionType === 'transfer' ? 'Desde' : 'Cuenta')}
            {activeField === 'toAccount' && 'Hacia'}
            {activeField === 'date' && 'Fecha'}
            {activeField === 'note' && 'Nota'}
          </h3>
          <div className="flex items-center gap-2">
            {(activeField === 'category' || activeField === 'subcategory') && (
              <button
                onClick={onManageCategories}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Field Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950">
          <div className="p-4">
            {activeField === 'category' && (
              <CategorySelector
                categories={filteredCategories}
                selectedCategoryId={selectedCategory}
                onCategorySelect={onCategorySelect}
                onManageCategories={onManageCategories}
              />
            )}

            {activeField === 'subcategory' && (
              <SubcategorySelector
                subcategories={availableSubcategories}
                selectedSubcategoryId={selectedSubcategory}
                onSubcategorySelect={onSubcategorySelect}
                onManageCategories={onManageCategories}
              />
            )}

            {activeField === 'account' && (
              <AccountSelector
                accounts={accounts}
                selectedAccountId={selectedAccount}
                onAccountSelect={onAccountSelect}
              />
            )}

            {activeField === 'toAccount' && (
              <AccountSelector
                accounts={accounts}
                selectedAccountId={selectedToAccount}
                onAccountSelect={onToAccountSelect}
              />
            )}

            {activeField === 'date' && (
              <DateEditor value={date} onChange={onDateChange} />
            )}

            {activeField === 'note' && <NoteEditor value={note} onChange={onNoteChange} />}
          </div>
        </div>
      </>
    );
  }
);

FieldEditorPanel.displayName = 'FieldEditorPanel';

export default FieldEditorPanel;