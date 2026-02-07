/**
 * Property-Based Test for Translation Fallback Chain
 * Feature: multi-language-support, Property 1: Translation Fallback Chain
 * 
 * Validates: Requirements 2.3, 2.4
 */

import * as fc from 'fast-check';
import { TranslationManager } from '../TranslationManager';

describe('TranslationManager - Fallback Chain Property Tests', () => {
  /**
   * Property 1: Translation Fallback Chain
   * For any translation key and any supported locale, if the translation is missing 
   * in the requested locale, the system should return the translation from the 
   * fallback locale, and if missing there too, should return the key itself.
   */
  it('should follow fallback chain: requested locale → fallback locale → key itself', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('.') && s.trim().length > 0),
        fc.constantFrom('en', 'fr'),
        (translationKey, locale) => {
          const manager = new TranslationManager(locale);
          
          // Mock translations with some keys missing
          const enTranslations = {
            existsInBoth: 'English value',
            onlyInEnglish: 'Only in English',
          };
          
          const frTranslations = {
            existsInBoth: 'Valeur française',
            onlyInFrench: 'Seulement en français',
          };
          
          // Manually set translations for testing
          (manager as any).translations.set('en', enTranslations);
          (manager as any).translations.set('fr', frTranslations);
          manager.setFallbackLocale('en');
          
          const result = manager.translate(translationKey);
          
          // Check fallback chain logic
          if (locale === 'fr') {
            // If key exists in French, should return French value
            if (translationKey === 'existsInBoth') {
              expect(result).toBe('Valeur française');
            } else if (translationKey === 'onlyInFrench') {
              expect(result).toBe('Seulement en français');
            } else if (translationKey === 'onlyInEnglish') {
              // Should fallback to English
              expect(result).toBe('Only in English');
            } else {
              // Should return key itself
              expect(result).toBe(translationKey);
            }
          } else {
            // locale === 'en'
            if (translationKey === 'existsInBoth') {
              expect(result).toBe('English value');
            } else if (translationKey === 'onlyInEnglish') {
              expect(result).toBe('Only in English');
            } else {
              // Should return key itself (no fallback needed as we're already in fallback locale)
              expect(result).toBe(translationKey);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Missing translations always return a string
   * For any translation key, the translate function should always return a string,
   * never undefined or null.
   */
  it('should always return a string value, never undefined or null', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('en', 'fr'),
        (translationKey, locale) => {
          const manager = new TranslationManager(locale);
          
          // Set up minimal translations
          (manager as any).translations.set('en', { test: 'value' });
          (manager as any).translations.set('fr', { test: 'valeur' });
          
          const result = manager.translate(translationKey);
          
          expect(typeof result).toBe('string');
          expect(result).not.toBeNull();
          expect(result).not.toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Fallback locale is always checked when primary locale fails
   * For any key that exists in fallback but not in primary locale,
   * the fallback value should be returned.
   */
  it('should return fallback locale value when primary locale is missing', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes('.')),
        (key) => {
          const manager = new TranslationManager('fr');
          
          // Key only exists in English (fallback)
          (manager as any).translations.set('en', { [key]: `en_${key}` });
          (manager as any).translations.set('fr', {});
          manager.setFallbackLocale('en');
          
          const result = manager.translate(key);
          
          // Should return the English (fallback) value
          expect(result).toBe(`en_${key}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Key is returned when missing in both locales
   * For any key that doesn't exist in either locale, the key itself should be returned.
   */
  it('should return the key itself when missing in both primary and fallback locales', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('.')),
        (missingKey) => {
          const manager = new TranslationManager('fr');
          
          // Empty translations
          (manager as any).translations.set('en', {});
          (manager as any).translations.set('fr', {});
          manager.setFallbackLocale('en');
          
          const result = manager.translate(missingKey);
          
          // Should return the key itself
          expect(result).toBe(missingKey);
        }
      ),
      { numRuns: 100 }
    );
  });
});
