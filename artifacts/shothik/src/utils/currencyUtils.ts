// Currency code to symbol mapping
const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  INR: "₹",
  BDT: "৳",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  HKD: "HK$",
  SGD: "S$",
  SEK: "kr",
  KRW: "₩",
  NOK: "kr",
  NZD: "NZ$",
  MXN: "MX$",
  TWD: "NT$",
  ZAR: "R",
  BRL: "R$",
  DKK: "kr",
  PLN: "zł",
  THB: "฿",
  IDR: "Rp",
  HUF: "Ft",
  CZK: "Kč",
  ILS: "₪",
  CLP: "CLP$",
  PHP: "₱",
  AED: "د.إ",
  COP: "COL$",
  SAR: "﷼",
  MYR: "RM",
  RON: "lei",
  VND: "₫",
  PKR: "₨",
  NGN: "₦",
  EGP: "E£",
  TRY: "₺",
  RUB: "₽",
  UAH: "₴",
};

/**
 * Get the currency symbol for a given currency code
 * @param currencyCode - ISO 4217 currency code (e.g., "USD", "BDT", "EUR")
 * @returns The currency symbol or the code itself if not found
 */
export function getCurrencySymbol(currencyCode?: string | null): string {
  if (!currencyCode) return "$";
  return currencySymbols[currencyCode.toUpperCase()] || currencyCode;
}

/**
 * Format a budget amount with the appropriate currency symbol
 * @param amount - The budget amount
 * @param currencyCode - ISO 4217 currency code
 * @returns Formatted string like "$100" or "৳100"
 */
export function formatBudget(
  amount: number,
  currencyCode?: string | null,
): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount}`;
}

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/**
 * Converts Western digits (0-9) to Bengali numerals (০-৯)
 */
export function toBengaliNumerals(val: string | number): string {
  return String(val).replace(/[0-9]/g, (d) => BENGALI_DIGITS[parseInt(d, 10)]);
}

/**
 * Formats a number with South Asian grouping (3 digits then groups of 2: 12,50,000)
 */
export function formatSouthAsianNumber(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return "0";
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const parts = absVal.toFixed(2).split(".");
  const intPart = parts[0];
  const decPart = parts[1] !== "00" ? `.${parts[1]}` : "";

  if (intPart.length <= 3) {
    return (isNegative ? "-" : "") + intPart + decPart;
  }

  const lastThree = intPart.slice(-3);
  const remaining = intPart.slice(0, -3);
  const groupedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  return (isNegative ? "-" : "") + groupedRemaining + "," + lastThree + decPart;
}

/**
 * Returns human-friendly South Asian scale (হাজার / লাখ / কোটি)
 */
export function getLakhCroreDescription(
  amount: number,
  locale: "bn" | "en" = "bn"
): string {
  if (isNaN(amount) || amount === 0) return locale === "bn" ? "০ টাকা" : "0 BDT";
  const abs = Math.abs(amount);

  if (abs >= 10_000_000) {
    const val = Number((abs / 10_000_000).toFixed(2));
    const str = locale === "bn" ? `${toBengaliNumerals(val)} কোটি টাকা` : `${val} Crore BDT`;
    return str;
  }
  if (abs >= 100_000) {
    const val = Number((abs / 100_000).toFixed(2));
    const str = locale === "bn" ? `${toBengaliNumerals(val)} লাখ টাকা` : `${val} Lakh BDT`;
    return str;
  }
  if (abs >= 1_000) {
    const val = Number((abs / 1_000).toFixed(2));
    const str = locale === "bn" ? `${toBengaliNumerals(val)} হাজার টাকা` : `${val} Thousand BDT`;
    return str;
  }

  return locale === "bn" ? `${toBengaliNumerals(abs)} টাকা` : `${abs} BDT`;
}

export interface FormatBanglaCurrencyOptions {
  bengaliDigits?: boolean;
  showWords?: boolean;
  currencySymbol?: string;
  locale?: "bn" | "en";
}

/**
 * Comprehensive Bangladeshi currency formatter (e.g. ৳ ৫০,০০,০০০ (৫০ লাখ টাকা))
 */
export function formatBanglaCurrency(
  amount: number,
  options: FormatBanglaCurrencyOptions = {}
): string {
  const {
    bengaliDigits = false,
    showWords = false,
    currencySymbol = "৳ ",
    locale = "bn",
  } = options;

  let formatted = formatSouthAsianNumber(amount);
  if (bengaliDigits) {
    formatted = toBengaliNumerals(formatted);
  }

  const base = `${currencySymbol}${formatted}`;
  if (showWords && Math.abs(amount) >= 1_000) {
    const words = getLakhCroreDescription(amount, locale);
    return `${base} (${words})`;
  }

  return base;
}
