/**
 * Currency utility helpers for integer representation
 * 1 Unit = 100 Smallest Units (e.g. 1 INR = 100 paise, 1 USD = 100 cents)
 */

export function formatCurrency(amountInSmallestUnit: number, currencyCode: string = 'INR'): string {
  const standardAmount = amountInSmallestUnit / 100;
  
  if (currencyCode === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(standardAmount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: standardAmount % 1 === 0 ? 0 : 2,
  }).format(standardAmount);
}

/**
 * Converts user decimal input (e.g., 250.50) into integer stored unit (e.g., 25050)
 */
export function toStorageAmount(decimalValue: number | string): number {
  const numeric = typeof decimalValue === 'string' ? parseFloat(decimalValue) : decimalValue;
  if (isNaN(numeric)) return 0;
  return Math.round(numeric * 100);
}

/**
 * Converts stored integer unit (e.g., 25050) to decimal number (250.50)
 */
export function fromStorageAmount(storedValue: number): number {
  return storedValue / 100;
}
