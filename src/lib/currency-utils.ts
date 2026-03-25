/**
 * Shared currency formatting utilities.
 * Prices in the database are stored in minor units (kurus / cents).
 * e.g. 30000 = 300 TL, 80000 = 800 EUR.
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: '₺',
  EUR: '€',
  USD: '$',
  GBP: '£',
};

/** Get currency symbol (€, $, £, ₺). Defaults to ₺ when code is missing. */
export function currencySymbol(code: string | null | undefined): string {
  if (!code) return '₺';
  return CURRENCY_SYMBOLS[code] ?? code;
}

/** Format price for display (prices are stored in minor units, divide by 100) */
export function formatPrice(price: number, locale = 'tr-TR'): string {
  return Math.round(price / 100).toLocaleString(locale, { maximumFractionDigits: 0 });
}

/**
 * Single unified currency formatter.
 * Converts minor-unit price to a human-readable string with the correct symbol.
 *
 * Examples:
 *   formatCurrency(1400000)          → "14.000 ₺"
 *   formatCurrency(85000, 'EUR')     → "850 €"
 *   formatCurrency(30000, 'TRY')     → "300 ₺"
 */
export function formatCurrency(
  amount: number,
  currencyCode?: string | null,
  locale = 'tr-TR',
): string {
  const formatted = Math.round(amount / 100).toLocaleString(locale, { maximumFractionDigits: 0 });
  const symbol = currencySymbol(currencyCode);
  return `${formatted} ${symbol}`;
}

/**
 * Format a raw number (NOT minor units) with thousand separators and symbol.
 * Useful for avg_rent and other values already in major units.
 *
 * Examples:
 *   formatCurrencyRaw(14000)          → "14.000 ₺"
 *   formatCurrencyRaw(850, 'EUR')     → "850 €"
 */
export function formatCurrencyRaw(
  amount: number,
  currencyCode?: string | null,
  locale = 'tr-TR',
): string {
  const formatted = Math.round(amount).toLocaleString(locale, { maximumFractionDigits: 0 });
  const symbol = currencySymbol(currencyCode);
  return `${formatted} ${symbol}`;
}

/** Full price display: "300 ₺/ay" */
export function displayPrice(
  price: number,
  currencyCode?: string | null,
  suffix = '/ay',
  locale = 'tr-TR',
): string {
  return `${formatCurrency(price, currencyCode, locale)}${suffix}`;
}
