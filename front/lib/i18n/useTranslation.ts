/**
 * useTranslation Hook
 * 
 * Convenience hook for accessing translation functions and locale state.
 * Re-exports the useLanguage hook with a more familiar name for i18n users.
 */

import { useLanguage } from './LanguageContext';

export interface UseTranslationReturn {
  t: (key: string, params?: Record<string, any>) => string;
  pluralize: (key: string, count: number, params?: Record<string, any>) => string;
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  isRTL: boolean;
  isLoading: boolean;
}

/**
 * Hook to access translation functions and locale state
 * 
 * @returns Translation functions and locale state
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, locale, setLocale } = useTranslation();
 *   
 *   return (
 *     <div>
 *       <p>{t('common.welcome')}</p>
 *       <button onClick={() => setLocale('fr')}>
 *         Switch to French
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTranslation(): UseTranslationReturn {
  const { t, pluralize, locale, setLocale, isRTL, isLoading } = useLanguage();
  
  return {
    t,
    pluralize,
    locale,
    setLocale,
    isRTL,
    isLoading,
  };
}
