'use client';

/**
 * Language Selector Component
 * 
 * Dropdown component for selecting the application language.
 * Shows all available locales with their native names and marks the current selection.
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../lib/i18n';
import { availableLocales } from '../lib/i18n/config';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { locale, setLocale, isLoading } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleLocaleClick = async (newLocale: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Changing locale to:', newLocale);
    setIsOpen(false);
    
    try {
      await setLocale(newLocale);
      console.log('Locale changed successfully');
    } catch (error) {
      console.error('Failed to change locale:', error);
    }
  };

  const dropdownContent = isOpen && mounted ? (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Dropdown menu */}
      <div 
        ref={dropdownRef}
        className="fixed z-[9999] w-48 rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none"
        style={{
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1" role="menu" aria-orientation="vertical">
          {availableLocales.map((localeOption) => (
            <button
              key={localeOption.code}
              onClick={(e) => handleLocaleClick(localeOption.code, e)}
              type="button"
              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition-colors cursor-pointer flex flex-col gap-1 ${
                localeOption.code === locale
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700'
              }`}
              role="menuitem"
              aria-current={localeOption.code === locale ? 'true' : undefined}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{localeOption.nativeName}</span>
                {localeOption.code === locale && (
                  <svg
                    className="w-4 h-4 text-blue-600 flex-shrink-0"
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
    </>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={isLoading}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed relative ${className}`}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
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

      {mounted && createPortal(dropdownContent, document.body)}
    </>
  );
}
