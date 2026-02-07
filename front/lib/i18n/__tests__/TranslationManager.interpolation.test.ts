/**
 * Property-Based Test for Variable Interpolation
 * Feature: multi-language-support, Property 4: Variable Interpolation Consistency
 * 
 * Validates: Requirements 2.5
 */

import * as fc from 'fast-check';
import { TranslationManager } from '../TranslationManager';

describe('TranslationManager - Variable Interpolation Property Tests', () => {
  /**
   * Property 4: Variable Interpolation Consistency
   * For any translation string containing variables and any set of parameter values,
   * interpolating those parameters should replace all variable placeholders with 
   * the corresponding values.
   */
  it('should replace all variable placeholders with corresponding values', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
        fc.string({ minLength: 0, maxLength: 50 }),
        (varName, varValue) => {
          const manager = new TranslationManager('en');
          
          // Create a translation with a variable placeholder
          const template = `Hello {{${varName}}}!`;
          (manager as any).translations.set('en', { greeting: template });
          
          const result = manager.translate('greeting', { [varName]: varValue });
          
          // Should replace the placeholder with the value
          expect(result).toBe(`Hello ${varValue}!`);
          // Should not contain the original placeholder
          expect(result).not.toContain(`{{${varName}}}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple variables are all replaced
   * For any translation with multiple variables, all should be replaced.
   */
  it('should replace all multiple variable placeholders', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
        fc.string({ minLength: 0, maxLength: 30 }),
        fc.string({ minLength: 0, maxLength: 30 }),
        (var1, var2, val1, val2) => {
          // Ensure variables are different
          if (var1 === var2) return true;
          
          const manager = new TranslationManager('en');
          
          const template = `{{${var1}}} and {{${var2}}}`;
          (manager as any).translations.set('en', { test: template });
          
          const result = manager.translate('test', { [var1]: val1, [var2]: val2 });
          
          expect(result).toBe(`${val1} and ${val2}`);
          // Should not contain the original placeholders
          expect(result).not.toContain(`{{${var1}}}`);
          expect(result).not.toContain(`{{${var2}}}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Missing parameters leave placeholders unchanged
   * For any variable placeholder without a corresponding parameter,
   * the placeholder should remain in the output.
   */
  it('should leave placeholders unchanged when parameters are missing', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
        (varName) => {
          const manager = new TranslationManager('en');
          
          const template = `Hello {{${varName}}}!`;
          (manager as any).translations.set('en', { greeting: template });
          
          // Call without providing the parameter
          const result = manager.translate('greeting', {});
          
          // Placeholder should remain
          expect(result).toBe(template);
          expect(result).toContain(`{{${varName}}}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Non-string parameter values are converted to strings
   * For any parameter value (number, boolean, etc.), it should be converted to string.
   */
  it('should convert non-string parameter values to strings', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer(),
          fc.boolean(),
          fc.double(),
        ),
        (value) => {
          const manager = new TranslationManager('en');
          
          const template = 'Value: {{val}}';
          (manager as any).translations.set('en', { test: template });
          
          const result = manager.translate('test', { val: value });
          
          expect(result).toBe(`Value: ${String(value)}`);
          expect(typeof result).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Same variable used multiple times is replaced consistently
   * If a variable appears multiple times in a template, all occurrences
   * should be replaced with the same value.
   */
  it('should replace all occurrences of the same variable consistently', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 30 }), // Ensure non-empty to avoid split() issues
        (varName, value) => {
          const manager = new TranslationManager('en');
          
          const template = `{{${varName}}} loves {{${varName}}}`;
          (manager as any).translations.set('en', { test: template });
          
          const result = manager.translate('test', { [varName]: value });
          
          expect(result).toBe(`${value} loves ${value}`);
          
          // Verify both occurrences were replaced
          expect(result).toContain(value);
          expect(result).toContain(' loves ');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty string parameters are handled correctly
   * For any variable with an empty string value, it should replace with empty string.
   */
  it('should handle empty string parameters correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
        (varName) => {
          const manager = new TranslationManager('en');
          
          const template = `Before{{${varName}}}After`;
          (manager as any).translations.set('en', { test: template });
          
          const result = manager.translate('test', { [varName]: '' });
          
          expect(result).toBe('BeforeAfter');
        }
      ),
      { numRuns: 100 }
    );
  });
});
