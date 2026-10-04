import { MarketDataProvider, ProviderCapabilities, StockQuote, SearchResult } from '@/types/market';
import {
  RawStockQuoteSchema,
  SearchResponseSchema,
  SymbolsResponseSchema,
  RawStockQuote,
} from '@/lib/market/validation';
import { normalizeStockQuote, normalizeSearchResult } from '@/lib/market/normalizer';
import { execute0xrammRoute } from './zero-ramm-engine';

const BATCH_CHUNK_SIZE = 20;

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

  private getBaseUrl(): string | null {
    const envUrl = process.env.MARKET_API_BASE_URL?.trim();
    if (envUrl && envUrl.length > 0) {
      return envUrl.replace(/\/+$/, '');
    }
    return null;
  }

  /**
   * Fetches data from configured remote base URL or falls back to the embedded 0xramm v3.0 engine.
   */
  private async fetchFromApi(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // If an external base URL is configured, try querying it first
    if (baseUrl) {
      const url = `${baseUrl}${cleanEndpoint}`;
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            Accept: 'application/json',
            ...(options.headers || {}),
          },
          signal: AbortSignal.timeout(8000),
        });

        if (response.ok) {
          const text = await response.text();
          if (text && text.trim().length > 0) {
            try {
              return JSON.parse(text);
            } catch {
              console.warn('[0xramm] Remote returned non-JSON, falling back to embedded engine');
            }
          }
        } else {
          console.warn(`[0xramm] Remote URL ${url} returned HTTP ${response.status}, falling back to embedded engine`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[0xramm] Remote fetch failed (${msg}), falling back to embedded engine`);
      }
    }

    // Direct execution via official 0xramm v3.0 core engine
    return await execute0xrammRoute(cleanEndpoint);
  }

  /**
   * Fetch quote for a single stock using GET /stock?symbol={SYMBOL}&res=num
   */
  public async getStockQuote(symbol: string): Promise<StockQuote> {
    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) {
      throw new Error('Symbol must not be empty');
    }

    const res = await this.fetchFromApi(`/stock?symbol=${encodeURIComponent(cleanSymbol)}&res=num`);
    
    if (!res || typeof res !== 'object') {
      throw new Error(`Invalid response received for stock quote: ${cleanSymbol}`);
    }

    const responseObj = res as Record<string, unknown>;
    if (responseObj.status === 'error') {
      const msg = typeof responseObj.message === 'string' ? responseObj.message : `No data found for ${cleanSymbol}`;
      throw new Error(msg);
    }

    // 0xramm v3.0 structure: { status: 'success', symbol, exchange, ticker, data: { ... } }
    let rawToParse: Record<string, unknown>;
    if (responseObj.data && typeof responseObj.data === 'object') {
      rawToParse = {
        symbol: responseObj.ticker || responseObj.symbol || cleanSymbol,
        ticker: responseObj.ticker || cleanSymbol,
        exchange: responseObj.exchange || (cleanSymbol.endsWith('.BO') ? 'BSE' : 'NSE'),
        ...(responseObj.data as Record<string, unknown>),
      };
    } else {
      rawToParse = {
        symbol: responseObj.symbol || cleanSymbol,
        ...responseObj,
      };
    }

    const parsed = RawStockQuoteSchema.safeParse(rawToParse);
    if (!parsed.success) {
      throw new Error(`Failed to validate stock quote data: ${parsed.error.message}`);
    }

    return normalizeStockQuote(parsed.data);
  }

  /**
   * Fetch batch quotes using GET /stock/list?symbols={SYM1,SYM2}&res=num
   * Automatically chunks symbols into groups of 20 to avoid URL length & upstream limits.
   */
  public async getBatchQuotes(symbols: string[]): Promise<StockQuote[]> {
    if (!symbols || symbols.length === 0) {
      return [];
    }

    const cleanedSymbols = Array.from(
      new Set(
        symbols
          .map((s) => s.trim().toUpperCase())
          .filter((s) => s.length > 0)
      )
    );

    if (cleanedSymbols.length === 0) {
      return [];
    }

    // Split symbols into chunks
    const chunks: string[][] = [];
    for (let i = 0; i < cleanedSymbols.length; i += BATCH_CHUNK_SIZE) {
      chunks.push(cleanedSymbols.slice(i, i + BATCH_CHUNK_SIZE));
    }

    const chunkPromises = chunks.map(async (chunk) => {
      const joinedSymbols = chunk.join(',');
      const res = await this.fetchFromApi(`/stock/list?symbols=${encodeURIComponent(joinedSymbols)}&res=num`);

      if (!res || typeof res !== 'object') {
        return [];
      }

      const responseObj = res as Record<string, unknown>;
      let rawList: unknown[] = [];

      // 0xramm v3.0 returns list under 'stocks'
      if (Array.isArray(responseObj.stocks)) {
        rawList = responseObj.stocks;
      } else if (Array.isArray(responseObj.data)) {
        rawList = responseObj.data;
      } else if (Array.isArray(responseObj)) {
        rawList = responseObj;
      } else if (responseObj.stocks && typeof responseObj.stocks === 'object') {
        rawList = Object.values(responseObj.stocks);
      }

      const validQuotes: StockQuote[] = [];
      for (const item of rawList) {
        if (!item || typeof item !== 'object') continue;
        const itemObj = item as Record<string, unknown>;
        if (itemObj.error) continue; // Skip stocks where upstream had no data

        const rawItem: Record<string, unknown> = {
          symbol: itemObj.ticker || itemObj.symbol || '',
          ticker: itemObj.ticker,
          exchange: itemObj.exchange,
          ...itemObj,
        };

        const parsed = RawStockQuoteSchema.safeParse(rawItem);
        if (parsed.success) {
          validQuotes.push(normalizeStockQuote(parsed.data));
        }
      }
      return validQuotes;
    });

    const chunkResults = await Promise.all(chunkPromises);
    return chunkResults.flat();
  }

  /**
   * Search stocks using GET /search?q={query}
   */
  public async searchStocks(query: string): Promise<SearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return [];
    }

    const res = await this.fetchFromApi(`/search?q=${encodeURIComponent(cleanQuery)}`);
    if (!res || typeof res !== 'object') {
      return [];
    }

    const responseObj = res as Record<string, unknown>;
    let rawList: unknown[] = [];

    // 0xramm v3.0 returns array under 'results'
    if (Array.isArray(responseObj.results)) {
      rawList = responseObj.results;
    } else if (Array.isArray(responseObj.data)) {
      rawList = responseObj.data;
    } else if (Array.isArray(responseObj)) {
      rawList = responseObj;
    }

    const parsed = SearchResponseSchema.safeParse(rawList);
    if (!parsed.success) {
      console.warn(`[0xramm] Search validation warning: ${parsed.error.message}`);
      return [];
    }

    return parsed.data.map(normalizeSearchResult);
  }

  /**
   * Get supported symbols using GET /symbols
   */
  public async getSymbols(): Promise<string[]> {
    const res = await this.fetchFromApi('/symbols');
    if (!res || typeof res !== 'object') {
      return [];
    }

    const responseObj = res as Record<string, unknown>;
    let rawList: unknown[] = [];

    // 0xramm v3.0 returns list under 'symbols'
    if (Array.isArray(responseObj.symbols)) {
      rawList = responseObj.symbols;
    } else if (Array.isArray(responseObj.data)) {
      rawList = responseObj.data;
    } else if (Array.isArray(responseObj)) {
      rawList = responseObj;
    }

    const parsed = SymbolsResponseSchema.safeParse(rawList);
    if (!parsed.success) {
      throw new Error(`Failed to validate symbol list: ${parsed.error.message}`);
    }

    return parsed.data.map((item) => (typeof item === 'string' ? item : item.symbol));
  }
}

export const zeroRammProvider = new ZeroRammMarketProvider();
