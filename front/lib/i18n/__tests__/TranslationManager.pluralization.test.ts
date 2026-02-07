/**
 * Unit Tests for Pluralization
 * 
 * Validates: Requirements 2.6
 */

import { TranslationManager } from '../TranslationManager';

describe('TranslationManager - Pluralization Unit Tests', () => {
  let manager: TranslationManager;

  beforeEach(() => {
    manager = new TranslationManager('en');
  });

  describe('English pluralization', () => {
    beforeEach(() => {
      (manager as any).translations.set('en', {
        items: {
          zero: 'No items',
          one: '{{count}} item',
          other: '{{count}} items',
        },
      });
    });

    it('should use zero form for count 0', () => {
      const result = manager.pluralize('items', 0);
      expect(result).toBe('No items');
    });

    it('should use one form for count 1', () => {
      const result = manager.pluralize('items', 1);
      expect(result).toBe('1 item');
    });

    it('should use other form for count 2', () => {
      const result = manager.pluralize('items', 2);
      expect(result).toBe('2 items');
    });

    it('should use other form for large counts', () => {
      const result = manager.pluralize('items', 100);
      expect(result).toBe('100 items');
    });

    it('should use other form for negative counts (except -1)', () => {
      const result = manager.pluralize('items', -5);
      expect(result).toBe('-5 items');
    });
  });

  describe('French pluralization', () => {
    beforeEach(() => {
      manager.setLocale('fr');
      (manager as any).translations.set('fr', {
        items: {
          zero: 'Aucun élément',
          one: '{{count}} élément',
          other: '{{count}} éléments',
        },
      });
    });

    it('should use zero form for count 0', () => {
      const result = manager.pluralize('items', 0);
      expect(result).toBe('Aucun élément');
    });

    it('should use one form for count 1', () => {
      const result = manager.pluralize('items', 1);
      expect(result).toBe('1 élément');
    });

    it('should use other form for count 2 and above', () => {
      const result = manager.pluralize('items', 2);
      expect(result).toBe('2 éléments');
    });
  });

  describe('Parameter interpolation in pluralization', () => {
    beforeEach(() => {
      (manager as any).translations.set('en', {
        messages: {
          zero: 'No messages from {{user}}',
          one: '{{count}} message from {{user}}',
          other: '{{count}} messages from {{user}}',
        },
      });
    });

    it('should interpolate additional parameters', () => {
      const result = manager.pluralize('messages', 0, { user: 'Alice' });
      expect(result).toBe('No messages from Alice');
    });

    it('should interpolate count and other parameters', () => {
      const result = manager.pluralize('messages', 5, { user: 'Bob' });
      expect(result).toBe('5 messages from Bob');
    });
  });

  describe('Fallback behavior', () => {
    beforeEach(() => {
      (manager as any).translations.set('en', {
        simple: '{{count}} things',
      });
    });

    it('should fallback to base key if no plural forms exist', () => {
      const result = manager.pluralize('simple', 5);
      expect(result).toBe('5 things');
    });

    it('should return key if translation is missing', () => {
      const result = manager.pluralize('missing', 5);
      expect(result).toBe('missing');
    });
  });

  describe('Edge cases', () => {
    beforeEach(() => {
      (manager as any).translations.set('en', {
        items: {
          zero: 'No items',
          one: '{{count}} item',
          other: '{{count}} items',
        },
      });
    });

    it('should handle decimal counts', () => {
      const result = manager.pluralize('items', 1.5);
      expect(result).toBe('1.5 items');
    });

    it('should handle very large counts', () => {
      const result = manager.pluralize('items', 1000000);
      expect(result).toBe('1000000 items');
    });

    it('should handle negative zero', () => {
      const result = manager.pluralize('items', -0);
      expect(result).toBe('No items');
    });
  });

  describe('Language-specific plural rules', () => {
    it('should apply English rules correctly', () => {
      (manager as any).translations.set('en', {
        test: {
          zero: 'zero',
          one: 'one',
          other: 'other',
        },
      });

      expect(manager.pluralize('test', 0)).toBe('zero');
      expect(manager.pluralize('test', 1)).toBe('one');
      expect(manager.pluralize('test', 2)).toBe('other');
      expect(manager.pluralize('test', 10)).toBe('other');
    });

    it('should apply French rules correctly', () => {
      manager.setLocale('fr');
      (manager as any).translations.set('fr', {
        test: {
          zero: 'zéro',
          one: 'un',
          other: 'autre',
        },
      });

      expect(manager.pluralize('test', 0)).toBe('zéro');
      expect(manager.pluralize('test', 1)).toBe('un');
      expect(manager.pluralize('test', 2)).toBe('autre');
    });
  });
});
