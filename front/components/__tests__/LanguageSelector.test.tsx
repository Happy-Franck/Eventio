/**
 * Unit Tests for LanguageSelector Component
 * 
 * Validates: Requirements 5.3, 5.4
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageSelector } from '../LanguageSelector';
import { LanguageProvider } from '../../lib/i18n';
import { ReactNode } from 'react';

// Mock fetch for translation files
global.fetch = jest.fn((url: string) => {
  const locale = url.includes('/en/') ? 'en' : 'fr';
  const file = url.includes('common.json') ? 'common' : 'auth';
  
  const translations: Record<string, any> = {
    'en-common': { nav: { home: 'Home' } },
    'en-auth': { login: { title: 'Login' } },
    'fr-common': { nav: { home: 'Accueil' } },
    'fr-auth': { login: { title: 'Connexion' } },
  };
  
  return Promise.resolve({
    json: () => Promise.resolve(translations[`${locale}-${file}`]),
  } as Response);
}) as jest.Mock;

describe('LanguageSelector Component', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <LanguageProvider initialLocale="en">{children}</LanguageProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should render the language selector button', async () => {
    render(<LanguageSelector />, { wrapper });
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /select language/i });
      expect(button).toBeInTheDocument();
    });
  });

  it('should display current locale in native name', async () => {
    render(<LanguageSelector />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });

  it('should show dropdown when button is clicked', async () => {
    const { container } = render(<LanguageSelector />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /select language/i })).not.toBeDisabled();
    });
    
    const button = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(button);
    
    // Wait for dropdown to appear
    await waitFor(() => {
      const dropdown = container.querySelector('[role="menu"]');
      expect(dropdown).toBeInTheDocument();
    });
  });

  it('should render all available locales in dropdown', async () => {
    const { container } = render(<LanguageSelector />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /select language/i })).not.toBeDisabled();
    });
    
    const button = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(button);
    
    // Wait for dropdown
    await waitFor(() => {
      const menuItems = container.querySelectorAll('[role="menuitem"]');
      expect(menuItems.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('should mark currently selected language', async () => {
    const { container } = render(<LanguageSelector />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /select language/i })).not.toBeDisabled();
    });
    
    const button = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(button);
    
    // Wait for dropdown
    await waitFor(() => {
      const currentItem = container.querySelector('[aria-current="true"]');
      expect(currentItem).toBeInTheDocument();
    });
  });

  it('should close dropdown when clicking outside', async () => {
    const { container } = render(<LanguageSelector />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /select language/i })).not.toBeDisabled();
    });
    
    const button = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(button);
    
    // Wait for dropdown to open
    await waitFor(() => {
      const dropdown = container.querySelector('[role="menu"]');
      expect(dropdown).toBeInTheDocument();
    });
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      const dropdown = container.querySelector('[role="menu"]');
      expect(dropdown).not.toBeInTheDocument();
    });
  });

  it('should be disabled when loading', async () => {
    render(<LanguageSelector />, { wrapper });
    
    // Initially loading
    const button = screen.getByRole('button', { name: /select language/i });
    expect(button).toBeDisabled();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('should apply custom className', async () => {
    const { container } = render(<LanguageSelector className="custom-class" />, { wrapper });
    
    await waitFor(() => {
      const div = container.querySelector('.custom-class');
      expect(div).toBeInTheDocument();
    });
  });
});
