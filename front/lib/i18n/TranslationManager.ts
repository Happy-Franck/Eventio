/**
 * Translation Manager
 * 
 * Manages loading and retrieving translations for different locales.
 * Supports nested keys, lazy loading, and fallback mechanisms.
 */

import { defaultLocale, isValidLocale } from './config';

type TranslationObject = Record<string, any>;
type Translations = Map<string, TranslationObject>;

export class TranslationManager {
  private translations: Translations = new Map();
  private currentLocale: string = defaultLocale;
  private fallbackLocale: string = defaultLocale;
  private loadingPromises: Map<string, Promise<void>> = new Map();
  private isInitialLoad: boolean = true;

  constructor(locale: string = defaultLocale) {
    this.currentLocale = locale;
  }

  /**
   * Load translations for a specific locale
   */
  async loadTranslations(locale: string): Promise<void> {
    if (!isValidLocale(locale)) {
      console.warn(`Invalid locale: ${locale}`);
      return;
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(locale)) {
      return this.loadingPromises.get(locale);
    }

    // Return immediately if already loaded
    if (this.translations.has(locale)) {
      return;
    }

    // Create loading promise
    const loadingPromise = this.loadLocaleFiles(locale);
    this.loadingPromises.set(locale, loadingPromise);

    try {
      await loadingPromise;
    } finally {
      this.loadingPromises.delete(locale);
    }
  }

  /**
   * Load all translation files for a locale
   */
  private async loadLocaleFiles(locale: string): Promise<void> {
    try {
      // Load common and auth translation files
      const [common, auth] = await Promise.all([
        fetch(`/locales/${locale}/common.json`).then(res => res.json()),
        fetch(`/locales/${locale}/auth.json`).then(res => res.json()),
      ]);

      // Merge all translation files
      const merged = {
        ...common,
        auth,
      };

      this.translations.set(locale, merged);
      
      // Mark initial load as complete after first successful load
      if (this.isInitialLoad) {
        this.isInitialLoad = false;
      }
    } catch (error) {
      console.error(`Failed to load translations for locale: ${locale}`, error);
      throw error;
    }
  }

  /**
   * Translate a key with optional parameters
   * Supports dot notation for nested keys (e.g., "auth.login.title")
   */
  translate(key: string, params?: Record<string, any>): string {
    // During initial load, return empty string to avoid showing keys
    if (this.isInitialLoad) {
      return '';
    }

    // Try to get translation from current locale
    let translation = this.getNestedValue(this.currentLocale, key);

    // Fallback to fallback locale if not found
    if (translation === undefined && this.currentLocale !== this.fallbackLocale) {
      translation = this.getNestedValue(this.fallbackLocale, key);
    }

    // Return key itself if no translation found
    if (translation === undefined) {
      // Only show warnings after initial load is complete
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation for key: ${key} in locale: ${this.currentLocale}`);
      }
      return key;
    }

    // If translation is not a string, return the key
    if (typeof translation !== 'string') {
      return key;
    }

    // Interpolate parameters if provided
    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  /**
   * Get nested value from translations using dot notation
   */
  private getNestedValue(locale: string, key: string): any {
    const translations = this.translations.get(locale);
    if (!translations) {
      return undefined;
    }

    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      // Use hasOwnProperty to avoid prototype pollution
      if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, k)) {
        value = value[k];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Interpolate parameters into translation string
   * Supports {{param}} syntax
   */
  private interpolate(template: string, params: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      // Use hasOwnProperty to avoid prototype pollution
      if (Object.prototype.hasOwnProperty.call(params, key) && params[key] !== undefined) {
        return String(params[key]);
      }
      return match;
    });
  }

  /**
   * Check if a translation exists for a key
   */
  hasTranslation(key: string, locale?: string): boolean {
    const targetLocale = locale || this.currentLocale;
    const value = this.getNestedValue(targetLocale, key);
    return value !== undefined && typeof value === 'string';
  }

  /**
   * Get all available locales that have been loaded
   */
  getLoadedLocales(): string[] {
    return Array.from(this.translations.keys());
  }

  /**
   * Set the current locale
   */
  setLocale(locale: string): void {
    if (isValidLocale(locale)) {
      this.currentLocale = locale;
    }
  }

  /**
   * Get the current locale
   */
  getLocale(): string {
    return this.currentLocale;
  }

  /**
   * Set the fallback locale
   */
  setFallbackLocale(locale: string): void {
    if (isValidLocale(locale)) {
      this.fallbackLocale = locale;
    }
  }

  /**
   * Get the fallback locale
   */
  getFallbackLocale(): string {
    return this.fallbackLocale;
  }

  /**
   * Pluralize a translation key based on count
   * Supports different plural forms for different languages
   * 
   * @param key - The base translation key
   * @param count - The count to determine plural form
   * @param params - Optional parameters for interpolation
   */
  pluralize(key: string, count: number, params?: Record<string, any>): string {
    const pluralKey = this.getPluralKey(key, count);
    const mergedParams = { ...params, count };
    return this.translate(pluralKey, mergedParams);
  }

  /**
   * Get the appropriate plural key based on count and locale
   * Implements plural rules for different languages
   */
  private getPluralKey(baseKey: string, count: number): string {
    const pluralForm = this.getPluralForm(count, this.currentLocale);
    
    // Try specific plural form first (e.g., "items.zero", "items.one", "items.other")
    const specificKey = `${baseKey}.${pluralForm}`;
    if (this.hasTranslation(specificKey)) {
      return specificKey;
    }
    
    // Fallback to base key
    return baseKey;
  }

  /**
   * Determine plural form based on count and locale
   * Implements CLDR plural rules
   */
  private getPluralForm(count: number, locale: string): string {
    const absCount = Math.abs(count);
    
    // English and French plural rules
    if (locale === 'en') {
      if (count === 0) return 'zero';
      if (count === 1) return 'one';
      return 'other';
    }
    
    if (locale === 'fr') {
      if (count === 0) return 'zero';
      if (count <= 1) return 'one';
      return 'other';
    }
    
    // Default rule
    if (count === 0) return 'zero';
    if (count === 1) return 'one';
    return 'other';
  }
}
