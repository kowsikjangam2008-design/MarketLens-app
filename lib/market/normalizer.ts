import { StockQuote, SearchResult } from '@/types/market';
import { RawStockQuote, RawSearchResultItem } from './validation';

/**
 * Normalizes a raw validated stock quote into a standardized StockQuote.
 * Never defaults missing data to zero or invents timestamps.
 */
export function normalizeStockQuote(raw: RawStockQuote): StockQuote {
  const symbol = raw.symbol.toUpperCase().trim();
  const name = raw.name || raw.companyName || symbol;
  
  // Exchange detection
  let exchange = raw.exchange || '';
  if (!exchange) {
    if (symbol.endsWith('.NS')) {
      exchange = 'NSE';
    } else if (symbol.endsWith('.BO')) {
      exchange = 'BSE';
    } else {
      exchange = 'NSE';
    }
  }

  // Price & changes
  const price = raw.price ?? raw.currentPrice ?? raw.regularMarketPrice ?? null;
  const change = raw.change ?? raw.regularMarketChange ?? null;
  
  let changePercent = raw.changePercent ?? raw.pChange ?? raw.percentChange ?? raw.regularMarketChangePercent ?? null;
  
  // If changePercent is missing but we have price and change, we can compute it accurately:
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
    marketCap: raw.marketCap ?? null,
    pe: raw.pe ?? raw.peRatio ?? null,
    eps: raw.eps ?? null,
    dividendYield: raw.dividendYield ?? null,
    open: raw.open ?? raw.regularMarketOpen ?? null,
    high: raw.high ?? raw.dayHigh ?? raw.regularMarketDayHigh ?? null,
    low: raw.low ?? raw.dayLow ?? raw.regularMarketDayLow ?? null,
    previousClose: raw.previousClose ?? raw.regularMarketPreviousClose ?? null,
    fiftyTwoWeekHigh: raw.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow: raw.fiftyTwoWeekLow ?? null,
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
  const symbol = raw.symbol.toUpperCase().trim();
  const name = raw.name || raw.longname || raw.shortname || symbol;
  
  let exchange = raw.exchange || '';
  if (!exchange) {
    if (symbol.endsWith('.NS')) exchange = 'NSE';
    else if (symbol.endsWith('.BO')) exchange = 'BSE';
    else exchange = 'NSE';
  }

  return {
    symbol,
    name,
    exchange,
    type: raw.type || raw.quoteType || 'Equity',
    price: raw.price ?? null,
    changePercent: raw.changePercent ?? null,
  };
}
