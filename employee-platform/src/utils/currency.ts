/**
 * Currency Utility Functions
 * Centralized currency formatting for the Employee platform
 * Default currency: Nigerian Naira (₦)
 */

export type SupportedCurrency = 'NGN' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyFormatOptions {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    useSymbol?: boolean;
}

/**
 * Format amount as Nigerian Naira
 */
export function formatNaira(
    amount: number,
    options: CurrencyFormatOptions = {}
): string {
    const {
        minimumFractionDigits = 2,
        maximumFractionDigits = 2,
        useSymbol = true
    } = options;

    const formatted = amount.toLocaleString('en-NG', {
        minimumFractionDigits,
        maximumFractionDigits
    });

    return useSymbol ? `₦${formatted}` : formatted;
}

/**
 * Format amount based on currency type
 */
export function formatCurrency(
    amount: number,
    currency: string = 'NGN',
    options: CurrencyFormatOptions = {}
): string {
    const {
        minimumFractionDigits = 2,
        maximumFractionDigits = 2
    } = options;

    switch (currency.toUpperCase()) {
        case 'NGN':
            return formatNaira(amount, options);

        case 'USD':
            return `$${amount.toLocaleString('en-US', {
                minimumFractionDigits,
                maximumFractionDigits
            })}`;

        case 'EUR':
            return `€${amount.toLocaleString('en-EU', {
                minimumFractionDigits,
                maximumFractionDigits
            })}`;

        case 'GBP':
            return `£${amount.toLocaleString('en-GB', {
                minimumFractionDigits,
                maximumFractionDigits
            })}`;

        default:
            return `${currency} ${amount.toLocaleString('en-US', {
                minimumFractionDigits,
                maximumFractionDigits
            })}`;
    }
}

/**
 * Parse formatted currency string back to number
 */
export function parseCurrency(formatted: string): number {
    // Remove currency symbols and commas
    const cleaned = formatted.replace(/[₦$€£,\s]/g, '');
    return parseFloat(cleaned) || 0;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string = 'NGN'): string {
    switch (currency.toUpperCase()) {
        case 'NGN':
            return '₦';
        case 'USD':
            return '$';
        case 'EUR':
            return '€';
        case 'GBP':
            return '£';
        default:
            return currency;
    }
}

/**
 * Format currency with compact notation (e.g., ₦1.2M, ₦450K)
 */
export function formatCurrencyCompact(
    amount: number,
    currency: string = 'NGN'
): string {
    const symbol = getCurrencySymbol(currency);

    if (amount >= 1000000) {
        return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
        return `${symbol}${(amount / 1000).toFixed(1)}K`;
    } else {
        return formatCurrency(amount, currency);
    }
}











