/**
 * LanguageSelector Component
 * 
 * Selector de idioma con diseño moderno
 * Ahora funciona con Context API nativo - Sin dependencias externas
 */

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { useLocalization } from '../hooks/useLocalization';
import type { SupportedLanguage } from '../i18n/config';

export function LanguageSelector() {
  const { currentLanguage, changeLanguage, supportedLanguages, t } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLanguageChange = async (lang: SupportedLanguage) => {
    await changeLanguage(lang);
    setIsOpen(false);
  };
  
  const currentLangInfo = supportedLanguages[currentLanguage];
  
  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between w-full p-4 bg-white/60 dark:bg-gray-900/60 rounded-xl shadow-sm hover:shadow-md transition-all backdrop-blur-xl border border-white/60 dark:border-gray-800/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900 dark:text-white">
              {t('settings.language')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span>{currentLangInfo.flag}</span>
              <span>{currentLangInfo.nativeName}</span>
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
      
      {/* Language Selection Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              {t('settings.language')}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              {t('settings.languageDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 mt-4">
            {Object.entries(supportedLanguages).map(([code, info]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code as SupportedLanguage)}
                className={`
                  w-full flex items-center justify-between p-4 rounded-lg
                  transition-all
                  ${
                    currentLanguage === code
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500'
                      : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{info.flag}</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {info.nativeName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {info.name}
                    </div>
                  </div>
                </div>
                
                {currentLanguage === code && (
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
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}