import { StockQuote, SearchResult } from '@/types/market';
import { RawStockQuote, RawSearchResultItem } from './validation';

/**
 * Normalizes a raw validated stock quote into a standardized StockQuote.
 * Never defaults missing data to zero or invents timestamps.
 * Accurately extracts both camelCase and 0xramm v3.0 snake_case fields.
 */
export function normalizeStockQuote(raw: RawStockQuote): StockQuote {
  const rawSymbol = (raw.ticker || raw.symbol || '').toUpperCase().trim();
  
  // Exchange detection
  let exchange = (raw.exchange || '').toUpperCase().trim();
  let symbol = rawSymbol;

  if (symbol.endsWith('.NS')) {
    exchange = 'NSE';
  } else if (symbol.endsWith('.BO')) {
    exchange = 'BSE';
  } else if (exchange === 'BSE') {
    symbol = `${symbol}.BO`;
  } else {
    // Default to NSE
    exchange = exchange || 'NSE';
    symbol = `${symbol}.NS`;
  }

  const name = raw.name || raw.companyName || raw.company_name || symbol;

  // Price & changes
  const price = raw.price ?? raw.last_price ?? raw.currentPrice ?? raw.regularMarketPrice ?? null;
  const change = raw.change ?? raw.regularMarketChange ?? null;
  
  let changePercent = raw.changePercent ?? raw.percent_change ?? raw.pChange ?? raw.percentChange ?? raw.regularMarketChangePercent ?? null;
  
  // If changePercent is missing but we have price and change, compute it accurately:
  if (changePercent === null && price !== null && change !== null && price - change !== 0) {
    const prev = price - change;
    if (prev > 0) {
      changePercent = Number(((change / prev) * 100).toFixed(2));
    }
  }

  // Last updated timestamp: Only use if actually provided by the upstream provider
  let lastUpdated: string | null = null;
  if (raw.lastUpdated) {
    lastUpdated = raw.lastUpdated;
  } else if (raw.last_update && raw.last_update !== 'N/A') {
    lastUpdated = raw.last_update;
  } else if (raw.timestamp) {
    const ts = typeof raw.timestamp === 'number' 
      ? (raw.timestamp > 1e11 ? raw.timestamp : raw.timestamp * 1000)
      : Date.parse(raw.timestamp);
    if (!Number.isNaN(ts)) {
      lastUpdated = new Date(ts).toISOString();
    }
  }

  return {
    symbol,
    name,
    exchange,
    price,
    change,
    changePercent,
    volume: raw.volume ?? raw.regularMarketVolume ?? null,
    marketCap: raw.marketCap ?? raw.market_cap ?? null,
    pe: raw.pe ?? raw.peRatio ?? raw.pe_ratio ?? null,
    eps: raw.eps ?? raw.earnings_per_share ?? null,
    dividendYield: raw.dividendYield ?? raw.dividend_yield ?? null,
    open: raw.open ?? raw.regularMarketOpen ?? null,
    high: raw.high ?? raw.dayHigh ?? raw.day_high ?? raw.regularMarketDayHigh ?? null,
    low: raw.low ?? raw.dayLow ?? raw.day_low ?? raw.regularMarketDayLow ?? null,
    previousClose: raw.previousClose ?? raw.previous_close ?? raw.regularMarketPreviousClose ?? null,
    fiftyTwoWeekHigh: raw.fiftyTwoWeekHigh ?? raw.year_high ?? null,
    fiftyTwoWeekLow: raw.fiftyTwoWeekLow ?? raw.year_low ?? null,
    sector: raw.sector ?? null,
    industry: raw.industry ?? null,
    currency: raw.currency || 'INR',
    lastUpdated,
    raw,
  };
}

/**
 * Normalizes a raw validated search result item into SearchResult
 */
export function normalizeSearchResult(raw: RawSearchResultItem): SearchResult {
  const rawSymbol = raw.symbol.toUpperCase().trim();
  let exchange = (raw.exchange || '').toUpperCase().trim();
  let symbol = rawSymbol;

  if (symbol.endsWith('.NS')) {
    exchange = 'NSE';
  } else if (symbol.endsWith('.BO')) {
    exchange = 'BSE';
  } else if (exchange === 'BSE') {
    symbol = `${symbol}.BO`;
  } else {
    exchange = exchange || 'NSE';
    symbol = `${symbol}.NS`;
  }

  const name = raw.name || raw.company_name || raw.longname || raw.shortname || symbol;

  return {
    symbol,
    name,
    exchange,
    type: raw.type || raw.quoteType || 'Equity',
    price: raw.price ?? null,
    changePercent: raw.changePercent ?? null,
  };
}
