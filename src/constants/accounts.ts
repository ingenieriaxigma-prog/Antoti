/**
 * Account Constants
 * 
 * Account types, configurations, and test data.
 */

import { Account } from '../types';

export const ACCOUNT_TYPES = {
  CASH: 'cash',
  BANK: 'bank',
  CARD: 'card',
  DIGITAL: 'digital',
} as const;

export const ACCOUNT_TYPE_CONFIG = {
  cash: {
    icon: 'Wallet',
    label: 'Efectivo',
    color: '#10b981',
  },
  bank: {
    icon: 'Building2',
    label: 'Banco',
    color: '#3b82f6',
  },
  card: {
    icon: 'CreditCard',
    label: 'Préstamos, Deudas y Créditos',
    color: '#ef4444',
  },
  digital: {
    icon: 'Smartphone',
    label: 'Digital',
    color: '#8b5cf6',
  },
} as const;

/**
 * Test accounts for demo/development purposes
 */
export const TEST_ACCOUNTS: Omit<Account, 'id'>[] = [
  { 
    name: 'Efectivo Principal', 
    type: 'cash', 
    balance: 500000, 
    icon: 'Wallet', 
    color: '#10b981' 
  },
  { 
    name: 'Banco Davivienda', 
    type: 'bank', 
    balance: 2500000, 
    icon: 'Building2', 
    color: '#3b82f6' 
  },
  { 
    name: 'Tarjeta Visa', 
    type: 'card', 
    balance: -450000, 
    icon: 'CreditCard', 
    color: '#ef4444' 
  },
  { 
    name: 'Nequi', 
    type: 'digital', 
    balance: 180000, 
    icon: 'Smartphone', 
    color: '#8b5cf6' 
  },
  { 
    name: 'Banco Bancolombia', 
    type: 'bank', 
    balance: 1800000, 
    icon: 'Building2', 
    color: '#3b82f6' 
  },
  { 
    name: 'Daviplata', 
    type: 'digital', 
    balance: 75000, 
    icon: 'Smartphone', 
    color: '#8b5cf6' 
  },
] as const;

/**
 * Default accounts for new users
 */
export const DEFAULT_ACCOUNTS: Omit<Account, 'id'>[] = [
  { 
    name: 'Efectivo', 
    type: 'cash', 
    balance: 0, 
    icon: 'wallet', 
    color: '#10b981' 
  },
  { 
    name: 'Bancolombia', 
    type: 'bank', 
    balance: 0, 
    icon: 'building-2', 
    color: '#FFDE00' 
  },
  { 
    name: 'Falabella', 
    type: 'bank', 
    balance: 0, 
    icon: 'building-2', 
    color: '#00A859' 
  },
  { 
    name: 'BBVA', 
    type: 'bank', 
    balance: 0, 
    icon: 'building-2', 
    color: '#004481' 
  },
  { 
    name: 'Nequi', 
    type: 'digital', 
    balance: 0, 
    icon: 'smartphone', 
    color: '#FF006B' 
  },
  { 
    name: 'DaviPlata', 
    type: 'digital', 
    balance: 0, 
    icon: 'smartphone', 
    color: '#EB001B' 
  },
  { 
    name: 'Tarjeta de Crédito', 
    type: 'card', 
    balance: 0, 
    icon: 'credit-card', 
    color: '#ef4444' 
  },
  { 
    name: 'Deuda', 
    type: 'card', 
    balance: 0, 
    icon: 'credit-card', 
    color: '#dc2626' 
  },
  { 
    name: 'Préstamo', 
    type: 'card', 
    balance: 0, 
    icon: 'credit-card', 
    color: '#f97316' 
  },
] as const;