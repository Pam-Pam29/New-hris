/**
 * Utility functions for handling number inputs that allow empty values and 0
 */

/**
 * Parse number input value, allowing empty string and 0
 * @param value - The input value (string)
 * @returns The parsed number or undefined if empty
 */
export function parseNumberInput(value: string): number | undefined {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === '-') {
        return undefined; // Allow empty
    }
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? undefined : parsed;
}

/**
 * Format number for display in input, allowing empty string
 * @param value - The number value (number | undefined)
 * @returns String representation or empty string
 */
export function formatNumberInput(value: number | undefined): string {
    return value === undefined || value === null ? '' : String(value);
}

/**
 * Handle number input change event
 * @param e - The change event
 * @param setter - The state setter function
 * @returns The parsed number or undefined
 */
export function handleNumberInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: number | undefined) => void
): void {
    const parsed = parseNumberInput(e.target.value);
    setter(parsed);
}

