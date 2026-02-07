/**
 * i18n Module Exports
 * 
 * Central export point for all i18n functionality
 */

export { LanguageProvider, useLanguage } from './LanguageContext';
export { useTranslation } from './useTranslation';
export { TranslationManager } from './TranslationManager';
export {
  locales,
  defaultLocale,
  availableLocales,
  isValidLocale,
  getLocaleInfo,
  isRTLLocale,
  type LocaleInfo,
} from './config';
