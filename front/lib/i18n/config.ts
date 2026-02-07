/**
 * Internationalization configuration for the frontend application
 */

export interface LocaleInfo {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

export const locales: Record<string, LocaleInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    isRTL: false,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    isRTL: false,
  },
};

export const defaultLocale = 'en';

export const availableLocales: LocaleInfo[] = Object.values(locales);

export function isValidLocale(locale: string): boolean {
  return locale in locales;
}

export function getLocaleInfo(locale: string): LocaleInfo | undefined {
  return locales[locale];
}

export function isRTLLocale(locale: string): boolean {
  return locales[locale]?.isRTL ?? false;
}
