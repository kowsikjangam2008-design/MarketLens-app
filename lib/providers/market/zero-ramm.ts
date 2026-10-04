import { MarketDataProvider, ProviderCapabilities, StockQuote, SearchResult } from '@/types/market';
import {
  RawStockQuoteSchema,
  SearchResponseSchema,
  BatchQuoteResponseSchema,
  SymbolsResponseSchema,
} from '@/lib/market/validation';
import { normalizeStockQuote, normalizeSearchResult } from '@/lib/market/normalizer';

export class ZeroRammMarketProvider implements MarketDataProvider {
  public readonly name = '0xramm Indian Stock Market API';
  
  public readonly capabilities: ProviderCapabilities = {
    quotes: true,
    batchQuotes: true,
    search: true,
    symbols: true,
    historical: false,
    ipo: false,
  };

  private getBaseUrl(): string {
    const envUrl = process.env.MARKET_API_BASE_URL?.trim();
    if (envUrl) {
      return envUrl.replace(/\/+$/, '');
    }
    // Fallback to the documented Vercel deployment URL
    return 'https://indian-stock-market-api.vercel.app';
  }

  private async fetchFromApi(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.headers || {}),
        },
        // Timeout signal after 10s
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Resource not found on market provider (404)`);
        }
        if (response.status === 429) {
          throw new Error(`Rate limit exceeded on market provider (429). Please retry later.`);
        }
        throw new Error(`Provider returned error HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      if (!text || text.trim() === '') {
        throw new Error('Provider returned empty response');
      }

      try {
        return JSON.parse(text);
      } catch {
        throw new Error('Provider returned malformed JSON response');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
          throw new Error('Market data provider request timed out. Please retry.');
        }
        throw err;
      }
      throw new Error('Failed to communicate with market data provider');
    }
  }

  /**
   * Fetch quote for a single stock using GET /stock?symbol={SYMBOL}&res=num
   */
  public async getStockQuote(symbol: string): Promise<StockQuote> {
    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) {
      throw new Error('Symbol must not be empty');
    }

    const data = await this.fetchFromApi(`/stock?symbol=${encodeURIComponent(cleanSymbol)}&res=num`);
    
    // In case the response wraps the object under a 'data' key or root
    const targetObj = (data && typeof data === 'object' && 'data' in data) 
      ? (data as { data: unknown }).data 
      : data;

    const parsed = RawStockQuoteSchema.safeParse(targetObj);
    if (!parsed.success) {
      throw new Error(`Failed to validate stock quote data: ${parsed.error.message}`);
    }

    return normalizeStockQuote(parsed.data);
  }

  /**
   * Fetch batch quotes using GET /stock/list?symbols={SYM1,SYM2}&res=num
   */
  public async getBatchQuotes(symbols: string[]): Promise<StockQuote[]> {
    if (!symbols || symbols.length === 0) {
      return [];
    }

    const cleanedSymbols = symbols
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);

    if (cleanedSymbols.length === 0) {
      return [];
    }

    const joinedSymbols = cleanedSymbols.join(',');
    const data = await this.fetchFromApi(`/stock/list?symbols=${encodeURIComponent(joinedSymbols)}&res=num`);

    const targetData = (data && typeof data === 'object' && 'data' in data)
      ? (data as { data: unknown }).data
      : data;

    const parsed = BatchQuoteResponseSchema.safeParse(targetData);
    if (!parsed.success) {
      throw new Error(`Failed to validate batch quotes: ${parsed.error.message}`);
    }

    if (Array.isArray(parsed.data)) {
      return parsed.data.map(normalizeStockQuote);
    }

    // If it's a key-value record object
    return Object.values(parsed.data).map(normalizeStockQuote);
  }

  /**
   * Search stocks using GET /search?q={query}
   */
  public async searchStocks(query: string): Promise<SearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return [];
    }

    const data = await this.fetchFromApi(`/search?q=${encodeURIComponent(cleanQuery)}`);
    const targetData = (data && typeof data === 'object' && 'data' in data)
      ? (data as { data: unknown }).data
      : data;

    const parsed = SearchResponseSchema.safeParse(targetData);
    if (!parsed.success) {
      throw new Error(`Failed to validate search results: ${parsed.error.message}`);
    }

    return parsed.data.map(normalizeSearchResult);
  }

  /**
   * Get supported symbols using GET /symbols
   */
  public async getSymbols(): Promise<string[]> {
    const data = await this.fetchFromApi('/symbols');
    const targetData = (data && typeof data === 'object' && 'data' in data)
      ? (data as { data: unknown }).data
      : data;

    const parsed = SymbolsResponseSchema.safeParse(targetData);
    if (!parsed.success) {
      throw new Error(`Failed to validate symbol list: ${parsed.error.message}`);
    }

    return parsed.data.map((item) => (typeof item === 'string' ? item : item.symbol));
  }
}

export const zeroRammProvider = new ZeroRammMarketProvider();
