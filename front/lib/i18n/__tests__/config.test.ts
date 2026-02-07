import {
  locales,
  defaultLocale,
  availableLocales,
  isValidLocale,
  getLocaleInfo,
  isRTLLocale,
} from '../config';

describe('Locale Configuration', () => {
  describe('locales object', () => {
    it('should have English locale', () => {
      expect(locales.en).toBeDefined();
      expect(locales.en.code).toBe('en');
      expect(locales.en.name).toBe('English');
      expect(locales.en.nativeName).toBe('English');
      expect(locales.en.isRTL).toBe(false);
    });

    it('should have French locale', () => {
      expect(locales.fr).toBeDefined();
      expect(locales.fr.code).toBe('fr');
      expect(locales.fr.name).toBe('French');
      expect(locales.fr.nativeName).toBe('Français');
      expect(locales.fr.isRTL).toBe(false);
    });

    it('should have all required fields for each locale', () => {
      Object.values(locales).forEach((locale) => {
        expect(locale).toHaveProperty('code');
        expect(locale).toHaveProperty('name');
        expect(locale).toHaveProperty('nativeName');
        expect(locale).toHaveProperty('isRTL');
        expect(typeof locale.isRTL).toBe('boolean');
      });
    });
  });

  describe('defaultLocale', () => {
    it('should be English', () => {
      expect(defaultLocale).toBe('en');
    });

    it('should exist in available locales', () => {
      expect(locales[defaultLocale]).toBeDefined();
    });
  });

  describe('availableLocales', () => {
    it('should be an array', () => {
      expect(Array.isArray(availableLocales)).toBe(true);
    });

    it('should contain at least English and French', () => {
      const codes = availableLocales.map((l) => l.code);
      expect(codes).toContain('en');
      expect(codes).toContain('fr');
    });

    it('should have at least 2 locales', () => {
      expect(availableLocales.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('isValidLocale', () => {
    it('should return true for valid locales', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('fr')).toBe(true);
    });

    it('should return false for invalid locales', () => {
      expect(isValidLocale('invalid')).toBe(false);
      expect(isValidLocale('de')).toBe(false);
      expect(isValidLocale('')).toBe(false);
    });
  });

  describe('getLocaleInfo', () => {
    it('should return locale info for valid locales', () => {
      const enInfo = getLocaleInfo('en');
      expect(enInfo).toBeDefined();
      expect(enInfo?.code).toBe('en');
      expect(enInfo?.name).toBe('English');

      const frInfo = getLocaleInfo('fr');
      expect(frInfo).toBeDefined();
      expect(frInfo?.code).toBe('fr');
      expect(frInfo?.name).toBe('French');
    });

    it('should return undefined for invalid locales', () => {
      expect(getLocaleInfo('invalid')).toBeUndefined();
      expect(getLocaleInfo('de')).toBeUndefined();
    });
  });

  describe('isRTLLocale', () => {
    it('should return false for LTR locales', () => {
      expect(isRTLLocale('en')).toBe(false);
      expect(isRTLLocale('fr')).toBe(false);
    });

    it('should return false for invalid locales', () => {
      expect(isRTLLocale('invalid')).toBe(false);
      expect(isRTLLocale('')).toBe(false);
    });

    it('should return true for RTL locales if they exist', () => {
      // This test will pass when RTL locales are added
      if (locales['ar']) {
        expect(isRTLLocale('ar')).toBe(true);
      }
      if (locales['he']) {
        expect(isRTLLocale('he')).toBe(true);
      }
    });
  });

  describe('RTL locale identification', () => {
    it('should properly identify RTL locales', () => {
      // Current locales (en, fr) should be LTR
      expect(locales.en.isRTL).toBe(false);
      expect(locales.fr.isRTL).toBe(false);

      // If RTL locales are added, they should be marked as RTL
      const rtlCodes = ['ar', 'he', 'fa', 'ur'];
      Object.entries(locales).forEach(([code, locale]) => {
        if (rtlCodes.includes(code)) {
          expect(locale.isRTL).toBe(true);
        }
      });
    });
  });
});
