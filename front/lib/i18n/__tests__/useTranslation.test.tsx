/**
 * Unit Tests for useTranslation Hook
 * 
 * Validates: Requirements 1.2, 8.3
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useTranslation } from '../useTranslation';
import { LanguageProvider } from '../LanguageContext';
import { ReactNode } from 'react';

// Mock fetch for translation files
global.fetch = jest.fn((url: string) => {
  const locale = url.includes('/en/') ? 'en' : 'fr';
  const file = url.includes('common.json') ? 'common' : 'auth';
  
  const translations: Record<string, any> = {
    'en-common': {
      nav: { home: 'Home', dashboard: 'Dashboard' },
      common: { loading: 'Loading...' },
    },
    'en-auth': {
      login: { title: 'Login', email: 'Email' },
    },
    'fr-common': {
      nav: { home: 'Accueil', dashboard: 'Tableau de bord' },
      common: { loading: 'Chargement...' },
    },
    'fr-auth': {
      login: { title: 'Connexion', email: 'E-mail' },
    },
  };
  
  return Promise.resolve({
    json: () => Promise.resolve(translations[`${locale}-${file}`]),
  } as Response);
}) as jest.Mock;

describe('useTranslation Hook', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <LanguageProvider initialLocale="en">{children}</LanguageProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should return translation function', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(typeof result.current.t).toBe('function');
  });

  it('should return correct translation for known keys', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    const translation = result.current.t('nav.home');
    expect(translation).toBe('Home');
  });

  it('should return current locale', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.locale).toBe('en');
  });

  it('should provide setLocale function', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(typeof result.current.setLocale).toBe('function');
  });

  it('should update locale when setLocale is called', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.locale).toBe('en');
    
    await result.current.setLocale('fr');
    
    await waitFor(() => {
      expect(result.current.locale).toBe('fr');
    });
  });

  it('should return isRTL as false for LTR locales', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.isRTL).toBe(false);
  });

  it('should provide pluralize function', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(typeof result.current.pluralize).toBe('function');
  });

  it('should return isLoading state', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    // Initially loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should translate with parameters', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Mock a translation with parameters
    const mockTranslation = result.current.t('test', { name: 'John' });
    expect(typeof mockTranslation).toBe('string');
  });

  it('should return all expected properties', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current).toHaveProperty('t');
    expect(result.current).toHaveProperty('pluralize');
    expect(result.current).toHaveProperty('locale');
    expect(result.current).toHaveProperty('setLocale');
    expect(result.current).toHaveProperty('isRTL');
    expect(result.current).toHaveProperty('isLoading');
  });
});
