import { memo } from 'react';
import { Account } from '../../types';

/**
 * AccountSelector Component
 * 
 * List of accounts for selection.
 * Memoized to prevent re-renders when other values change.
 * 
 * @param {Account[]} accounts - Available accounts
 * @param {string} selectedAccountId - Selected account ID
 * @param {Function} onAccountSelect - Account selection handler
 */

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string;
  onAccountSelect: (accountId: string) => void;
}

const AccountSelector = memo<AccountSelectorProps>(
  ({ accounts, selectedAccountId, onAccountSelect }) => {
    return (
      <div className="space-y-2">
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => onAccountSelect(account.id)}
            className={`w-full px-4 py-3 rounded-xl text-left transition-all ${
              selectedAccountId === account.id
                ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 ring-2 ring-blue-400 dark:ring-blue-600 text-blue-700 dark:text-blue-300 shadow-md'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
          >
            {account.name}
          </button>
        ))}
      </div>
    );
  },
  // Custom comparison: only re-render if accounts or selection changes
  (prevProps, nextProps) => {
    return (
      prevProps.accounts.length === nextProps.accounts.length &&
      prevProps.selectedAccountId === nextProps.selectedAccountId
    );
  }
);

AccountSelector.displayName = 'AccountSelector';

export default AccountSelector;
