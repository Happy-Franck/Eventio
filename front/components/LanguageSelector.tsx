'use client';

/**
 * Language Selector Component
 * 
 * Dropdown component for selecting the application language.
 * Shows all available locales with their native names and marks the current selection.
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import { availableLocales } from '../lib/i18n/config';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { locale, setLocale, isLoading } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const currentLocale = availableLocales.find(l => l.code === locale);

  const handleLocaleChange = async (newLocale: string) => {
    setIsOpen(false);
    await setLocale(newLocale);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="font-semibold">{locale.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {availableLocales.map((localeOption) => (
              <button
                key={localeOption.code}
                onClick={() => handleLocaleChange(localeOption.code)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  localeOption.code === locale
                    ? 'bg-gray-50 text-blue-600 font-medium'
                    : 'text-gray-700'
                }`}
                role="menuitem"
                aria-current={localeOption.code === locale ? 'true' : undefined}
              >
                <div className="flex items-center justify-between">
                  <span>{localeOption.nativeName}</span>
                  {localeOption.code === locale && (
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-gray-500">{localeOption.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
