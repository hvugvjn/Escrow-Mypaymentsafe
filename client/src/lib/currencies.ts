// Supported currencies across the platform
export const CURRENCIES = [
  { code: "USD", symbol: "$",  name: "US Dollar",          flag: "🇺🇸" },
  { code: "EUR", symbol: "€",  name: "Euro",               flag: "🇪🇺" },
  { code: "GBP", symbol: "£",  name: "British Pound",      flag: "🇬🇧" },
  { code: "INR", symbol: "₹",  name: "Indian Rupee",       flag: "🇮🇳" },
  { code: "AED", symbol: "د.إ",name: "UAE Dirham",         flag: "🇦🇪" },
  { code: "CAD", symbol: "CA$",name: "Canadian Dollar",    flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar",  flag: "🇦🇺" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar",   flag: "🇸🇬" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit",  flag: "🇲🇾" },
  { code: "PHP", symbol: "₱",  name: "Philippine Peso",    flag: "🇵🇭" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah",  flag: "🇮🇩" },
  { code: "PKR", symbol: "₨",  name: "Pakistani Rupee",    flag: "🇵🇰" },
  { code: "BDT", symbol: "৳",  name: "Bangladeshi Taka",   flag: "🇧🇩" },
  { code: "NGN", symbol: "₦",  name: "Nigerian Naira",     flag: "🇳🇬" },
  { code: "KES", symbol: "KSh",name: "Kenyan Shilling",    flag: "🇰🇪" },
  { code: "ZAR", symbol: "R",  name: "South African Rand", flag: "🇿🇦" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real",     flag: "🇧🇷" },
  { code: "MXN", symbol: "MX$",name: "Mexican Peso",       flag: "🇲🇽" },
  { code: "JPY", symbol: "¥",  name: "Japanese Yen",       flag: "🇯🇵" },
  { code: "CNY", symbol: "¥",  name: "Chinese Yuan",       flag: "🇨🇳" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc",        flag: "🇨🇭" },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]["code"];

/** Get the symbol for a currency code (e.g. "INR" → "₹") */
export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? "$";
}

/** Format an amount stored in smallest units (cents/paise) for display */
export function formatMoney(smallestUnits: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  // JPY and IDR don't have decimals in practice
  const noDecimal = ["JPY", "IDR"].includes(currencyCode);
  const amount = noDecimal ? Math.round(smallestUnits / 100) : (smallestUnits / 100).toFixed(2);
  return `${symbol}${amount}`;
}
