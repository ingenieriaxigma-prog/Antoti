/**
 * AccountTypeGroup Component
 * 
 * Displays a group of accounts by type (cash, bank, card, digital)
 */

import { TrendingUp } from 'lucide-react';
import { AccountCard } from './AccountCard';
import type { Account, AccountTypeConfig } from '../types';

interface AccountTypeGroupProps {
  type: string;
  accounts: Account[];
  config: AccountTypeConfig;
  typeTotal: number;
  formatCurrency: (amount: number) => string;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
}

export function AccountTypeGroup({ 
  type,
  accounts, 
  config, 
  typeTotal, 
  formatCurrency,
  onEdit,
  onDelete
}: AccountTypeGroupProps) {
  const Icon = config.icon;

  // ✅ Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // ✅ Compact currency format
  const formatCompactCurrency = (amount: number) => {
    const absAmount = Math.abs(amount);
    
    if (absAmount >= 1000000) {
      const millions = amount / 1000000;
      return `$ ${millions.toFixed(1)}M`;
    }
    
    if (absAmount >= 10000) {
      const thousands = amount / 1000;
      return `$ ${thousands.toFixed(0)}K`;
    }
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div data-tour="account-types">
      {/* ✅ IMPROVED: Header with type color and badge */}
      <div 
        className="p-3 sm:p-4 mb-3 rounded-xl border-2"
        style={{
          backgroundColor: hexToRgba(config.color, 0.1),
          borderColor: hexToRgba(config.color, 0.3),
        }}
      >
        <div className="flex items-center justify-between">
          {/* Type Name with Icon and color bar */}
          <div className="flex items-center gap-2">
            <div 
              className="w-1.5 h-10 sm:h-12 rounded-full" 
              style={{ backgroundColor: config.color }}
            />
            <div className="flex items-center gap-2">
              <Icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: config.color }} />
              <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                {config.label}
              </h3>
            </div>
          </div>

          {/* ✅ Total Badge */}
          <div 
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg"
            style={{ backgroundColor: hexToRgba(config.color, 0.15) }}
          >
            <div 
              className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full"
              style={{ backgroundColor: config.color }}
            >
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <p className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
              {formatCurrency(typeTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 shadow-sm">
        {accounts.map((account, index) => (
          <AccountCard
            key={account.id}
            account={account}
            icon={config.icon}
            color={config.color}
            onEdit={onEdit}
            onDelete={onDelete}
            formatCurrency={formatCurrency}
            index={index}
            isFirstCard={index === 0}
          />
        ))}
      </div>
    </div>
  );
}