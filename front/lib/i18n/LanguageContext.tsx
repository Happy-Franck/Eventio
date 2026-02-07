'use client';

/**
 * Language Context Provider
 * 
 * Provides language state and translation functions to the entire application.
 * Handles locale detection, persistence, and translation management.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { TranslationManager } from './TranslationManager';
import { defaultLocale, availableLocales, isValidLocale, isRTLLocale, LocaleInfo } from './config';

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  t: (key: string, params?: Record<string, any>) => string;
  pluralize: (key: string, count: number, params?: Record<string, any>) => string;
  availableLocales: LocaleInfo[];
  isRTL: boolean;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'user-locale';

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale?: string;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<string>(initialLocale || defaultLocale);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [translationManager] = useState<TranslationManager>(() => new TranslationManager(locale));

  /**
   * Detect browser's preferred language on first visit
   */
  const detectBrowserLocale = useCallback((): string => {
    if (typeof window === 'undefined') return defaultLocale;

    // Try to get from localStorage first
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isValidLocale(stored)) {
      return stored;
    }

    // Detect from browser
    const browserLang = navigator.language.split('-')[0]; // Get language code without region
    if (isValidLocale(browserLang)) {
      return browserLang;
    }

    return defaultLocale;
  }, []);

  /**
   * Initialize locale on mount
   */
  useEffect(() => {
    const initializeLocale = async () => {
      const detectedLocale = detectBrowserLocale();
      
      try {
        await translationManager.loadTranslations(detectedLocale);
        translationManager.setLocale(detectedLocale);
        setLocaleState(detectedLocale);
        
        // Update HTML dir attribute
        if (typeof document !== 'undefined') {
          document.documentElement.dir = isRTLLocale(detectedLocale) ? 'rtl' : 'ltr';
          document.documentElement.lang = detectedLocale;
        }
      } catch (error) {
        console.error('Failed to initialize locale:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLocale();
  }, [detectBrowserLocale, translationManager]);

  /**
   * Change locale and persist preference
   */
  const setLocale = useCallback(async (newLocale: string) => {
    if (!isValidLocale(newLocale)) {
      console.warn(`Invalid locale: ${newLocale}`);
      return;
    }

    if (newLocale === locale) {
      return; // Already set
    }

    setIsLoading(true);

    try {
      // Load translations for new locale
      await translationManager.loadTranslations(newLocale);
      
      // Update translation manager
      translationManager.setLocale(newLocale);
      
      // Update state
      setLocaleState(newLocale);
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
        
        // Update HTML dir attribute
        document.documentElement.dir = isRTLLocale(newLocale) ? 'rtl' : 'ltr';
        document.documentElement.lang = newLocale;
      }
    } catch (error) {
      console.error(`Failed to set locale to ${newLocale}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [locale, translationManager]);

  /**
   * Translation function
   */
  const t = useCallback((key: string, params?: Record<string, any>): string => {
    return translationManager.translate(key, params);
  }, [translationManager]);

  /**
   * Pluralization function
   */
  const pluralize = useCallback((key: string, count: number, params?: Record<string, any>): string => {
    return translationManager.pluralize(key, count, params);
  }, [translationManager]);

  const value: LanguageContextType = {
    locale,
    setLocale,
    t,
    pluralize,
    availableLocales,
    isRTL: isRTLLocale(locale),
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        children
      )}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to use language context
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
