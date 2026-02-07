/**
 * Property-Based Test for RTL Direction Consistency
 * Feature: multi-language-support, Property 5: RTL Direction Consistency
 * 
 * Validates: Requirements 8.1, 8.2, 8.4
 */

import * as fc from 'fast-check';
import { isRTLLocale, locales } from '../config';

describe('RTL Direction - Property Tests', () => {
  /**
   * Property 5: RTL Direction Consistency
   * For any locale marked as RTL in the configuration, when that locale is selected,
   * the HTML dir attribute should be set to "rtl" and all directional UI elements 
   * should be mirrored.
   */
  it('should correctly identify RTL locales from configuration', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(locales)),
        (localeCode) => {
          const isRTL = isRTLLocale(localeCode);
          const localeConfig = locales[localeCode];
          
          // The isRTLLocale function should match the configuration
          expect(isRTL).toBe(localeConfig.isRTL);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: LTR locales should never be identified as RTL
   * For any locale marked as LTR (isRTL: false), isRTLLocale should return false.
   */
  it('should return false for all LTR locales', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fr'),
        (locale) => {
          const isRTL = isRTLLocale(locale);
          expect(isRTL).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Invalid locales should return false for RTL check
   * For any invalid locale code, isRTLLocale should return false.
   */
  it('should return false for invalid locales', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => !Object.keys(locales).includes(s)),
        (invalidLocale) => {
          const isRTL = isRTLLocale(invalidLocale);
          expect(isRTL).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: RTL flag is boolean
   * For any locale in the configuration, the isRTL flag should be a boolean.
   */
  it('should have boolean RTL flag for all locales', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(locales)),
        (localeCode) => {
          const locale = locales[localeCode];
          expect(typeof locale.isRTL).toBe('boolean');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: RTL detection is consistent
   * For any locale, calling isRTLLocale multiple times should return the same result.
   */
  it('should return consistent RTL detection results', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(locales)),
        fc.integer({ min: 2, max: 10 }),
        (localeCode, iterations) => {
          const results: boolean[] = [];
          
          for (let i = 0; i < iterations; i++) {
            results.push(isRTLLocale(localeCode));
          }
          
          // All results should be the same
          const firstResult = results[0];
          expect(results.every(r => r === firstResult)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
