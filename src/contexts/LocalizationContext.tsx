/**
 * LocalizationContext
 * 
 * Sistema de internacionalización (i18n) nativo con React Context API
 * Sin dependencias externas - 100% React puro
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { SupportedLanguage, SupportedCurrency } from '../i18n/config';
import { SUPPORTED_LANGUAGES, SUPPORTED_CURRENCIES } from '../i18n/config';
import { translations } from '../i18n/translations';

interface LocalizationContextType {
  language: SupportedLanguage;
  currency: SupportedCurrency;
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
  changeCurrency: (curr: SupportedCurrency) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  supportedLanguages: typeof import('../i18n/config').SUPPORTED_LANGUAGES;
  supportedCurrencies: typeof import('../i18n/config').SUPPORTED_CURRENCIES;
  currentLanguage: SupportedLanguage;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
  children: ReactNode;
}

export function LocalizationProvider({ children }: LocalizationProviderProps) {
  const [language, setLanguage] = useState<SupportedLanguage>('es');
  const [currency, setCurrency] = useState<SupportedCurrency>('COP');

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as SupportedLanguage;
    const savedCurrency = localStorage.getItem('app-currency') as SupportedCurrency;

    if (savedLanguage && ['es', 'en', 'pt'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }

    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Change language
  const changeLanguage = async (lang: SupportedLanguage) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  // Change currency
  const changeCurrency = (curr: SupportedCurrency) => {
    setCurrency(curr);
    localStorage.setItem('app-currency', curr);
  };

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} for language: ${language}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // Replace params
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  // Format number based on language
  const formatNumber = (num: number): string => {
    const locales: Record<SupportedLanguage, string> = {
      es: 'es-CO',
      en: 'en-US',
      pt: 'pt-BR',
    };

    return new Intl.NumberFormat(locales[language], {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    const locales: Record<SupportedLanguage, string> = {
      es: 'es-CO',
      en: 'en-US',
      pt: 'pt-BR',
    };

    const currencySymbols: Record<SupportedCurrency, string> = {
      COP: '$',
      USD: '$',
      EUR: '€',
      BRL: 'R$',
      MXN: '$',
      ARS: '$',
      CLP: '$',
      PEN: 'S/',
      GBP: '£',
    };

    const formatted = new Intl.NumberFormat(locales[language], {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

    return `${currencySymbols[currency]}${formatted}`;
  };

  // Format date based on language
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const locales: Record<SupportedLanguage, string> = {
      es: 'es-CO',
      en: 'en-US',
      pt: 'pt-BR',
    };

    return new Intl.DateTimeFormat(locales[language], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  };

  const value: LocalizationContextType = {
    language,
    currency,
    changeLanguage,
    changeCurrency,
    t,
    formatNumber,
    formatCurrency,
    formatDate,
    supportedLanguages: SUPPORTED_LANGUAGES,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    currentLanguage: language,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
}
