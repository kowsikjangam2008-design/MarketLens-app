import { z } from 'zod';

/**
 * Zod helper for safe number parsing
 * Rejects NaN, Infinity, and invalid numbers.
 * Converts valid string numbers to numbers.
 * Returns null for missing/null/undefined/empty string.
 */
const safeNullableNumber = z.preprocess((val) => {
  if (val === null || val === undefined || val === '' || val === 'N/A' || val === '-') {
    return null;
  }
  if (typeof val === 'number') {
    if (Number.isNaN(val) || !Number.isFinite(val)) {
      return null;
    }
    return val;
  }
  if (typeof val === 'string') {
    // Strip commas, spaces, currency symbols
    const cleaned = val.replace(/,/g, '').replace(/[₹$%]/g, '').trim();
    const num = Number(cleaned);
    if (!Number.isNaN(num) && Number.isFinite(num)) {
      return num;
    }
  }
  return null;
}, z.number().nullable().optional());

const safeNullableString = z.preprocess((val) => {
  if (val === null || val === undefined || val === '' || val === 'N/A' || val === '-') {
    return null;
  }
  return String(val).trim();
}, z.string().nullable().optional());

/**
 * Schema for single stock quote response from 0xramm
 * Supporting res=num with fallbacks for both camelCase and snake_case field namings
 */
export const RawStockQuoteSchema = z.object({
  symbol: z.string().min(1),
  ticker: safeNullableString,
  name: safeNullableString,
  companyName: safeNullableString,
  company_name: safeNullableString,
  price: safeNullableNumber,
  last_price: safeNullableNumber,
  currentPrice: safeNullableNumber,
  regularMarketPrice: safeNullableNumber,
  change: safeNullableNumber,
  regularMarketChange: safeNullableNumber,
  changePercent: safeNullableNumber,
  percent_change: safeNullableNumber,
  pChange: safeNullableNumber,
  percentChange: safeNullableNumber,
  regularMarketChangePercent: safeNullableNumber,
  volume: safeNullableNumber,
  regularMarketVolume: safeNullableNumber,
  marketCap: safeNullableNumber,
  market_cap: safeNullableNumber,
  pe: safeNullableNumber,
  peRatio: safeNullableNumber,
  pe_ratio: safeNullableNumber,
  eps: safeNullableNumber,
  earnings_per_share: safeNullableNumber,
  dividendYield: safeNullableNumber,
  dividend_yield: safeNullableNumber,
  book_value: safeNullableNumber,
  bookValue: safeNullableNumber,
  open: safeNullableNumber,
  regularMarketOpen: safeNullableNumber,
  high: safeNullableNumber,
  dayHigh: safeNullableNumber,
  day_high: safeNullableNumber,
  regularMarketDayHigh: safeNullableNumber,
  low: safeNullableNumber,
  dayLow: safeNullableNumber,
  day_low: safeNullableNumber,
  regularMarketDayLow: safeNullableNumber,
  previousClose: safeNullableNumber,
  previous_close: safeNullableNumber,
  regularMarketPreviousClose: safeNullableNumber,
  fiftyTwoWeekHigh: safeNullableNumber,
  year_high: safeNullableNumber,
  fiftyTwoWeekLow: safeNullableNumber,
  year_low: safeNullableNumber,
  sector: safeNullableString,
  industry: safeNullableString,
  exchange: safeNullableString,
  currency: safeNullableString,
  lastUpdated: safeNullableString,
  last_update: safeNullableString,
  timestamp: z.union([z.number(), z.string()]).optional().nullable(),
}).passthrough();

export type RawStockQuote = z.infer<typeof RawStockQuoteSchema>;

/**
 * Schema for single search result item
 */
export const RawSearchResultItemSchema = z.object({
  symbol: z.string().min(1),
  name: safeNullableString,
  company_name: safeNullableString,
  shortname: safeNullableString,
  longname: safeNullableString,
  exchange: safeNullableString,
  type: safeNullableString,
  quoteType: safeNullableString,
  price: safeNullableNumber,
  changePercent: safeNullableNumber,
  sector: safeNullableString,
  industry: safeNullableString,
  source: safeNullableString,
  nse_url: safeNullableString,
  bse_url: safeNullableString,
}).passthrough();

export type RawSearchResultItem = z.infer<typeof RawSearchResultItemSchema>;

/**
 * Search response schema: array of items
 */
export const SearchResponseSchema = z.array(RawSearchResultItemSchema);

/**
 * Batch quote response schema: array of quotes or object mapping
 */
export const BatchQuoteResponseSchema = z.union([
  z.array(RawStockQuoteSchema),
  z.record(z.string(), RawStockQuoteSchema),
]);

/**
 * Symbols response schema: array of symbol strings or objects
 */
export const SymbolsResponseSchema = z.union([
  z.array(z.string()),
  z.array(z.object({ symbol: z.string() }).passthrough()),
]);
