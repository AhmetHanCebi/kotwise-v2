/**
 * Shared currency formatting utilities.
 * Prices in the database are stored in minor units (cents/kuruş).
 * All display functions divide by 100 to show the correct amount.
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

/** Convert minor units (cents) to major units and format for display */
export function formatPrice(priceInMinor: number, locale = 'tr-TR'): string {
  const major = priceInMinor / 100;
  return major.toLocaleString(locale, { maximumFractionDigits: 0 });
}

/** Full price display: "320 €/ay" */
export function displayPrice(
  priceInMinor: number,
  currencyCode?: string | null,
  suffix = '/ay',
  locale = 'tr-TR',
): string {
  return `${formatPrice(priceInMinor, locale)} ${currencySymbol(currencyCode)}${suffix}`;
}
