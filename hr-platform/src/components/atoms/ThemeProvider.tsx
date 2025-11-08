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
    const body = window.document.body;
    
    // Remove all theme classes first
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Also set data-theme attribute for better CSS targeting
    root.setAttribute('data-theme', theme);
    
    // Force re-render by updating CSS variables and triggering repaint
    root.style.colorScheme = theme;
    
    // Force a repaint to ensure CSS variables are applied
    void root.offsetHeight; // Trigger reflow
    
    console.log('🎨 Theme changed to:', theme);
    console.log('🎨 HTML classes:', root.className);
    console.log('🎨 Computed background:', window.getComputedStyle(body).backgroundColor);
    console.log('🎨 CSS variable --background:', getComputedStyle(root).getPropertyValue('--background'));
    console.log('🎨 CSS variable --foreground:', getComputedStyle(root).getPropertyValue('--foreground'));
    
    // Force a re-render by updating body style directly
    const bgVar = getComputedStyle(root).getPropertyValue('--background').trim();
    const fgVar = getComputedStyle(root).getPropertyValue('--foreground').trim();
    
    // Use the actual HSL values from CSS variables
    body.style.backgroundColor = bgVar ? `hsl(${bgVar})` : '';
    body.style.color = fgVar ? `hsl(${fgVar})` : '';
    
    setTimeout(() => {
      const computedBg = window.getComputedStyle(body).backgroundColor;
      console.log('🎨 Body styles forced:', {
        background: body.style.backgroundColor,
        color: body.style.color,
        computed: computedBg,
        bgVar: bgVar,
        fgVar: fgVar
      });
      
      // If still white in dark mode, force it again
      if (theme === 'dark' && (computedBg.includes('255, 255, 255') || computedBg === 'rgba(0, 0, 0, 0)')) {
        body.style.setProperty('background-color', `hsl(${bgVar})`, 'important');
        body.style.setProperty('color', `hsl(${fgVar})`, 'important');
        console.log('🔧 Forced dark mode background with !important');
      }
    }, 10);
    
    // Re-apply branding colors when theme changes
    const primaryColorHex = root.style.getPropertyValue('--company-primary-hex') || 
                            getComputedStyle(root).getPropertyValue('--company-primary-hex').trim();
    const secondaryColorHex = root.style.getPropertyValue('--company-secondary-hex') || 
                              getComputedStyle(root).getPropertyValue('--company-secondary-hex').trim();
    
    if (primaryColorHex && secondaryColorHex && 
        primaryColorHex !== 'hsl(var(--primary))' && 
        secondaryColorHex !== 'hsl(var(--secondary))' &&
        primaryColorHex !== '' &&
        secondaryColorHex !== '') {
      applyBrandingColors(primaryColorHex, secondaryColorHex, theme === 'dark');
    }
    
    // Dispatch a custom event for components that need to react to theme changes
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }));
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
