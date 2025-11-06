import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { applyBrandingColors } from '../../utils/brandingUtils';

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Initialize theme from localStorage first, then system preference
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      // Fallback to system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Apply theme to HTML element and re-apply branding colors
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes first
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Also set data-theme attribute for better CSS targeting
    root.setAttribute('data-theme', theme);
    
    // Force re-render by updating CSS variables
    root.style.colorScheme = theme;
    
    console.log('🎨 Theme changed to:', theme);
    
    // Re-apply branding colors when theme changes
    const primaryColorHex = root.style.getPropertyValue('--company-primary-hex');
    const secondaryColorHex = root.style.getPropertyValue('--company-secondary-hex');
    
    if (primaryColorHex && secondaryColorHex && 
        primaryColorHex !== 'hsl(var(--primary))' && 
        secondaryColorHex !== 'hsl(var(--secondary))') {
      applyBrandingColors(primaryColorHex, secondaryColorHex, theme === 'dark');
    }
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    console.log('💾 Theme saved to localStorage:', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    console.log('🔄 Toggling theme from', theme, 'to', newTheme);
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
