/**
 * Shared currency formatting utilities.
 * Prices in the database are stored in minor units (kuruş / cents).
 * e.g. 30000 = 300 TL, 80000 = 800 EUR.
 */

const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: '₺',
  EUR: '€',
  USD: '$',
  GBP: '£',
};

const CURRENCY_CODES: Record<string, string> = {
  TRY: 'TL',
  EUR: 'EUR',
  USD: 'USD',
  GBP: 'GBP',
};

/** Get currency symbol (€, $, £, ₺) */
export function currencySymbol(code: string | null | undefined): string {
  if (!code) return '€';
  return CURRENCY_SYMBOLS[code] ?? code;
}

/** Get currency code label (EUR, TL, USD, GBP) */
export function currencyLabel(code: string | null | undefined): string {
  if (!code) return 'EUR';
  return CURRENCY_CODES[code] ?? code;
}

/** Format price for display (prices are stored in minor units, divide by 100) */
export function formatPrice(price: number, locale = 'tr-TR'): string {
  return Math.round(price / 100).toLocaleString(locale, { maximumFractionDigits: 0 });
}

/** Full price display: "300 ₺/ay" */
export function displayPrice(
  price: number,
  currencyCode?: string | null,
  suffix = '/ay',
  locale = 'tr-TR',
): string {
  return `${formatPrice(price, locale)} ${currencySymbol(currencyCode)}${suffix}`;
}
