/**
 * Currency Utility Functions
 * For formatting salary ranges in careers platform
 * Default currency: Nigerian Naira (₦)
 */

/**
 * Format amount as Nigerian Naira
 */
export function formatNaira(
    amount: number,
    options: { minimumFractionDigits?: number; maximumFractionDigits?: number; useSymbol?: boolean } = {}
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
 * Format salary range string to include currency
 * Converts "50000-80000" or "50,000 - 80,000" to "₦50,000 - ₦80,000"
 */
export function formatSalaryRange(
    salaryRange: string,
    currency: string = 'NGN'
): string {
    if (!salaryRange) return '';

    const symbol = getCurrencySymbol(currency);

    // Check if already has currency symbol
    if (salaryRange.includes(symbol) || salaryRange.includes('₦') || salaryRange.includes('$')) {
        return salaryRange;
    }

    // Handle range format: "50000-80000" or "50,000 - 80,000"
    const rangeMatch = salaryRange.match(/(\d[\d,]*)\s*-\s*(\d[\d,]*)/);
    if (rangeMatch) {
        const min = parseFloat(rangeMatch[1].replace(/,/g, ''));
        const max = parseFloat(rangeMatch[2].replace(/,/g, ''));
        return `${formatNaira(min, { minimumFractionDigits: 0 })} - ${formatNaira(max, { minimumFractionDigits: 0 })}`;
    }

    // Handle single number: "50000" or "50,000"
    const singleMatch = salaryRange.match(/(\d[\d,]*)/);
    if (singleMatch) {
        const amount = parseFloat(singleMatch[1].replace(/,/g, ''));
        return formatNaira(amount, { minimumFractionDigits: 0 });
    }

    // If no numbers found, add symbol to beginning
    return `${symbol}${salaryRange}`;
}










