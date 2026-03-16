/**
 * Consolidated Translations
 * 
 * Import all translations and re-export them
 */

import es from './locales/es';
import en from './locales/en';
import pt from './locales/pt';

export const translations = {
  es,
  en,
  pt,
};

export type TranslationKeys = typeof es;
