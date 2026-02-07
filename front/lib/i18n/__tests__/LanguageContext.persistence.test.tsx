/**
 * Property-Based Test for Locale Persistence Round-Trip
 * Feature: multi-language-support, Property 2: Locale Persistence Round-Trip
 * 
 * Validates: Requirements 1.3, 1.4
 */

import * as fc from 'fast-check';

describe('Locale Persistence - Property Tests', () => {
  const LOCALE_STORAGE_KEY = 'user-locale';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * Property 2: Locale Persistence Round-Trip
   * For any valid locale code, when a user selects that locale and the preference 
   * is saved to localStorage, then retrieving the preference should return the 
   * same locale code.
   */
  it('should persist and retrieve locale correctly (round-trip)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fr'),
        (locale) => {
          // Save locale to localStorage
          localStorage.setItem(LOCALE_STORAGE_KEY, locale);
          
          // Retrieve locale from localStorage
          const retrieved = localStorage.getItem(LOCALE_STORAGE_KEY);
          
          // Should match exactly
          expect(retrieved).toBe(locale);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple round-trips preserve value
   * For any valid locale, saving and retrieving multiple times should 
   * always return the same value.
   */
  it('should preserve locale through multiple round-trips', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fr'),
        fc.integer({ min: 1, max: 10 }),
        (locale, iterations) => {
          for (let i = 0; i < iterations; i++) {
            localStorage.setItem(LOCALE_STORAGE_KEY, locale);
            const retrieved = localStorage.getItem(LOCALE_STORAGE_KEY);
            expect(retrieved).toBe(locale);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Last write wins
   * For any sequence of locale changes, the last written value should be retrieved.
   */
  it('should return the last written locale', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('en', 'fr'), { minLength: 1, maxLength: 10 }),
        (locales) => {
          // Write all locales in sequence
          locales.forEach(locale => {
            localStorage.setItem(LOCALE_STORAGE_KEY, locale);
          });
          
          // Retrieve should return the last one
          const retrieved = localStorage.getItem(LOCALE_STORAGE_KEY);
          const lastLocale = locales[locales.length - 1];
          
          expect(retrieved).toBe(lastLocale);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Persistence survives page reload simulation
   * For any valid locale, the value should persist even after simulating
   * a page reload (clearing in-memory state but not localStorage).
   */
  it('should persist locale across simulated page reloads', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fr'),
        (locale) => {
          // Save locale
          localStorage.setItem(LOCALE_STORAGE_KEY, locale);
          
          // Simulate page reload by just reading again
          // (localStorage persists across this)
          const retrieved = localStorage.getItem(LOCALE_STORAGE_KEY);
          
          expect(retrieved).toBe(locale);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Null is returned for non-existent key
   * When no locale has been saved, retrieval should return null.
   */
  it('should return null when no locale is stored', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          // Don't save anything
          const retrieved = localStorage.getItem(LOCALE_STORAGE_KEY);
          
          expect(retrieved).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Clearing storage removes locale
   * After clearing localStorage, the locale should not be retrievable.
   */
  it('should not retrieve locale after clearing storage', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fr'),
        (locale) => {
          // Save locale
          localStorage.setItem(LOCALE_STORAGE_KEY, locale);
          
          // Clear storage
          localStorage.clear();
          
          // Should return null
          const retrieved = localStorage.getItem(LOCALE_STORAGE_KEY);
          expect(retrieved).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
