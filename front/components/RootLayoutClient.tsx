'use client';

import { useEffect } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { isRTLLocale } from '../lib/i18n/config';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguage();

  useEffect(() => {
    // Update HTML lang and dir attributes
    const html = document.documentElement;
    html.lang = locale;
    html.dir = isRTLLocale(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  return <>{children}</>;
}
