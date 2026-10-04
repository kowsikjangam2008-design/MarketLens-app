/**
 * Core market data types for MarketLens
 * Reflecting real provider data from 0xramm Indian Stock Market API
 */

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
  marketCap: number | null;
  pe: number | null;
  eps: number | null;
  dividendYield: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  sector: string | null;
  industry: string | null;
  currency: string;
  lastUpdated?: string | null;
  raw?: Record<string, unknown>;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type?: string;
  price?: number | null;
  changePercent?: number | null;
}

export interface SymbolInfo {
  symbol: string;
  name?: string;
  exchange?: string;
}

export interface HistoricalCandle {
  time: number | string; // Unix timestamp in seconds (number) or 'YYYY-MM-DD' (string)
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface ProviderCapabilities {
  quotes: boolean;
  batchQuotes: boolean;
  search: boolean;
  symbols: boolean;
  historical: boolean;
  ipo: boolean;
}

export interface MarketDataProvider {
  name: string;
  capabilities: ProviderCapabilities;
  getStockQuote(symbol: string): Promise<StockQuote>;
  getBatchQuotes(symbols: string[]): Promise<StockQuote[]>;
  searchStocks(query: string): Promise<SearchResult[]>;
  getSymbols(): Promise<string[]>;
}

export interface HistoricalDataProvider {
  name: string;
  capabilities: { historical: boolean };
  getHistoricalCandles(symbol: string, timeframe: string): Promise<HistoricalCandle[]>;
}

export interface IPOItem {
  id: string;
  companyName: string;
  symbol?: string;
  issuePriceRange?: string;
  issueSize?: string;
  openDate?: string;
  closeDate?: string;
  listingDate?: string;
  status?: string;
}

export interface IPOProvider {
  name: string;
  capabilities: { ipo: boolean };
  getIPOs(): Promise<IPOItem[]>;
}

export type MarketStatus = 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'POST_MARKET';
