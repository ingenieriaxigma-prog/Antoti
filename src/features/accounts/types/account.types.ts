/**
 * Account Types
 * 
 * TypeScript type definitions for the accounts feature
 */

/**
 * Account type options
 */
export type AccountType = 'cash' | 'bank' | 'card' | 'digital';

/**
 * Main account entity
 */
export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  icon: string;
  color: string;
}

/**
 * Form data for creating/updating accounts
 */
export type AccountFormData = Omit<Account, 'id'>;

/**
 * Account type configuration (icon, label, color)
 */
export interface AccountTypeConfig {
  icon: any; // Lucide icon component
  label: string;
  color: string;
}

/**
 * Props for Account components
 */
export interface AccountsScreenProps {
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onUpdateAccount: (accountId: string, updates: Partial<Account>) => void;
  onDeleteAccount: (accountId: string) => boolean;
  onNavigate: (screen: string) => void;
}

export interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
  formatCurrency: (amount: number) => string;
}

export interface AccountFormProps {
  show: boolean;
  editingAccount: Account | null;
  accountName: string;
  accountType: AccountType;
  accountBalance: string;
  onAccountNameChange: (name: string) => void;
  onAccountTypeChange: (type: AccountType) => void;
  onAccountBalanceChange: (balance: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export interface AccountStatsProps {
  totalBalance: number;
  totalAssets: number;
  totalLiabilities: number;
  formatCurrency: (amount: number) => string;
}
