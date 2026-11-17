/**
 * Currency conversion and formatting service.
 * Destino operates with INR as its primary display currency for Indian travellers,
 * but allows foreign currency budgets and calculates with destination-local currencies.
 */

export const BENCHMARK_EXCHANGE_RATE_DATE = "2026-11-16";

// Standard benchmark exchange rates relative to INR (1 Unit of Foreign Currency = X INR)
export const EXCHANGE_RATES_TO_INR: Record<string, number> = {
  INR: 1,
  USD: 84.5,
  EUR: 91.5,
  GBP: 107.0,
  JPY: 0.55,
  THB: 2.35,
  AED: 23.0,
  SGD: 63.0,
  AUD: 55.0,
  CAD: 61.5,
  CNY: 11.6,
  EGP: 1.75,
  KES: 0.65,
  CHF: 96.0,
  VND: 0.0034,
  IDR: 0.0053,
  MYR: 19.2,
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  THB: "฿",
  AED: "AED ",
  SGD: "S$",
  AUD: "A$",
  CAD: "C$",
  CNY: "¥",
  EGP: "E£",
  KES: "KSh ",
  CHF: "CHF ",
  VND: "₫",
  IDR: "Rp ",
  MYR: "RM ",
};

export interface ConvertedCurrencyResult {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  rateDate: string;
  formatted: string;
}

/**
 * Normalizes a currency code to uppercase trimmed string, defaulting to "INR" if unrecognized.
 */
export const normalizeCurrencyCode = (currency?: string): string => {
  if (!currency || typeof currency !== "string") return "INR";
  const upper = currency.trim().toUpperCase();
  return EXCHANGE_RATES_TO_INR[upper] !== undefined ? upper : "INR";
};

/**
 * Format an amount in the given currency with proper symbol and locale formatting.
 */
export const formatCurrency = (amount: number, currency = "INR"): string => {
  const normCurrency = normalizeCurrencyCode(currency);
  const rounded = Math.round(amount);
  const symbol = CURRENCY_SYMBOLS[normCurrency] ?? `${normCurrency} `;

  if (normCurrency === "INR") {
    return `₹${rounded.toLocaleString("en-IN")}`;
  }

  return `${symbol}${rounded.toLocaleString("en-US")}`;
};

/**
 * Format an amount in INR.
 */
export const formatInr = (amount: number): string => {
  return formatCurrency(amount, "INR");
};

/**
 * Convert any amount from one currency to another using the standard benchmark table.
 */
export const convertCurrency = (
  amount: number,
  fromCurrency = "INR",
  toCurrency = "INR",
): ConvertedCurrencyResult => {
  const normFrom = normalizeCurrencyCode(fromCurrency);
  const normTo = normalizeCurrencyCode(toCurrency);

  const rateFromToInr = EXCHANGE_RATES_TO_INR[normFrom] ?? 1;
  const rateToToInr = EXCHANGE_RATES_TO_INR[normTo] ?? 1;

  // Amount in INR = amount * rateFromToInr
  const amountInInr = amount * rateFromToInr;
  // Amount in target = amountInInr / rateToToInr
  const convertedAmount = Math.round(amountInInr / rateToToInr);
  const effectiveRate = Number((rateFromToInr / rateToToInr).toFixed(4));

  return {
    amount: convertedAmount,
    fromCurrency: normFrom,
    toCurrency: normTo,
    exchangeRate: effectiveRate,
    rateDate: BENCHMARK_EXCHANGE_RATE_DATE,
    formatted: formatCurrency(convertedAmount, normTo),
  };
};

/**
 * Convenience helper to convert foreign currency directly to INR.
 */
export const convertToInr = (
  amount: number,
  fromCurrency = "INR",
): ConvertedCurrencyResult => {
  return convertCurrency(amount, fromCurrency, "INR");
};
