/**
 * Utility functions for company branding colors
 * Handles conversion between hex and HSL for proper dark/light mode support
 */

/**
 * Convert hex color to HSL
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Get adjusted color for dark/light mode
 * For light mode: uses original color
 * For dark mode: lightens the color for better visibility
 */
export function getAdjustedColor(hex: string, isDark: boolean): string {
    const hsl = hexToHsl(hex);
    
    if (isDark) {
        // In dark mode, lighten the color and increase saturation
        return `${hsl.h} ${Math.min(hsl.s + 10, 100)}% ${Math.min(hsl.l + 30, 85)}%`;
    } else {
        // In light mode, use original color with slight adjustment
        return `${hsl.h} ${hsl.s}% ${Math.max(hsl.l, 20)}%`;
    }
}

/**
 * Apply company branding colors to CSS variables
 */
export function applyBrandingColors(
    primaryColor: string,
    secondaryColor: string,
    isDark: boolean = false
): void {
    const root = document.documentElement;
    
    // Convert hex to HSL for CSS variables
    const primaryHsl = hexToHsl(primaryColor);
    const secondaryHsl = hexToHsl(secondaryColor);
    
    // For light mode: use original colors
    // For dark mode: use adjusted (lighter) colors
    if (isDark) {
        root.style.setProperty('--company-primary', getAdjustedColor(primaryColor, true));
        root.style.setProperty('--company-secondary', getAdjustedColor(secondaryColor, true));
    } else {
        root.style.setProperty('--company-primary', `${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%`);
        root.style.setProperty('--company-secondary', `${secondaryHsl.h} ${secondaryHsl.s}% ${secondaryHsl.l}%`);
    }
    
    // Also set as fallback hex values
    root.style.setProperty('--company-primary-hex', primaryColor);
    root.style.setProperty('--company-secondary-hex', secondaryColor);
}

/**
 * Remove company branding colors (reset to defaults)
 */
export function removeBrandingColors(): void {
    const root = document.documentElement;
    root.style.removeProperty('--company-primary');
    root.style.removeProperty('--company-secondary');
    root.style.removeProperty('--company-primary-hex');
    root.style.removeProperty('--company-secondary-hex');
}

