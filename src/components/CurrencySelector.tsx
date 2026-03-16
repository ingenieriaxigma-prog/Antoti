/**
 * CurrencySelector Component
 * 
 * Selector de moneda con búsqueda y diseño moderno
 * Ahora funciona con Context API nativo - Sin dependencias externas
 */

import React, { useState, useMemo } from 'react';
import { DollarSign, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Input } from './ui/input';
import { useLocalization } from '../hooks/useLocalization';
import type { SupportedCurrency } from '../i18n/config';

export function CurrencySelector() {
  const { currency, changeCurrency, supportedCurrencies, t } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentCurrencyInfo = supportedCurrencies[currency];
  
  // Filtrar monedas por búsqueda
  const filteredCurrencies = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return Object.entries(supportedCurrencies).filter(([code, info]) =>
      code.toLowerCase().includes(query) ||
      info.name.toLowerCase().includes(query)
    );
  }, [searchQuery, supportedCurrencies]);
  
  const handleCurrencyChange = (curr: SupportedCurrency) => {
    changeCurrency(curr);
    setIsOpen(false);
    setSearchQuery('');
  };
  
  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between w-full p-4 bg-white/60 dark:bg-gray-900/60 rounded-xl shadow-sm hover:shadow-md transition-all backdrop-blur-xl border border-white/60 dark:border-gray-800/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900 dark:text-white">
              {t('settings.currency')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span>{currentCurrencyInfo.flag}</span>
              <span>{currency} - {currentCurrencyInfo.name}</span>
            </div>
          </div>
        </div>
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      
      {/* Currency Selection Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              {t('settings.currency')}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              {t('settings.currencyDescription')}
            </DialogDescription>
          </DialogHeader>
          
          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Currency List */}
          <div className="space-y-2 mt-4 overflow-y-auto max-h-[400px] pr-2">
            {filteredCurrencies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('common.noData')}
              </div>
            ) : (
              filteredCurrencies.map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => handleCurrencyChange(code as SupportedCurrency)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-lg
                    transition-all
                    ${
                      currency === code
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500'
                        : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.flag}</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{code}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                          {info.symbol}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {info.name}
                      </div>
                    </div>
                  </div>
                  
                  {currency === code && (
                    <svg
                      className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}