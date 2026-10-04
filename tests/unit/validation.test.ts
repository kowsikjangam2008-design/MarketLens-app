import { describe, it, expect } from 'vitest';
import {
  RawStockQuoteSchema,
  SearchResponseSchema,
  BatchQuoteResponseSchema,
  SymbolsResponseSchema,
} from '@/lib/market/validation';

describe('RawStockQuoteSchema Zod Validation', () => {
  it('validates a complete valid stock quote', () => {
    const raw = {
      symbol: 'RELIANCE.NS',
      name: 'Reliance Industries Limited',
      price: 2950.5,
      change: 15.2,
      changePercent: 0.52,
      volume: 4500000,
      marketCap: 20000000000000,
      pe: 28.5,
      eps: 103.5,
      dividendYield: 0.34,
      open: 2940.0,
      high: 2960.0,
      low: 2935.0,
      previousClose: 2935.3,
      fiftyTwoWeekHigh: 3024.9,
      fiftyTwoWeekLow: 2220.0,
      sector: 'Energy',
      industry: 'Oil & Gas',
      exchange: 'NSE',
    };

    const parsed = RawStockQuoteSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.symbol).toBe('RELIANCE.NS');
      expect(parsed.data.price).toBe(2950.5);
    }
  });

  it('safely handles and strips comma-separated string numbers', () => {
    const raw = {
      symbol: 'TCS.NS',
      price: '3,850.50',
      volume: '1,200,000',
    };

    const parsed = RawStockQuoteSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.price).toBe(3850.5);
      expect(parsed.data.volume).toBe(1200000);
    }
  });

  it('rejects or turns NaN and invalid strings into null', () => {
    const raw = {
      symbol: 'INFY.NS',
      price: 'invalid_price',
      pe: NaN,
      dividendYield: 'N/A',
      eps: '-',
    };

    const parsed = RawStockQuoteSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.price).toBeNull();
      expect(parsed.data.pe).toBeNull();
      expect(parsed.data.dividendYield).toBeNull();
      expect(parsed.data.eps).toBeNull();
    }
  });

  it('fails if symbol is missing or empty', () => {
    const raw = {
      price: 100,
    };

    const parsed = RawStockQuoteSchema.safeParse(raw);
    expect(parsed.success).toBe(false);
  });
});

describe('SearchResponseSchema Zod Validation', () => {
  it('validates an array of search results', () => {
    const raw = [
      { symbol: 'RELIANCE.NS', name: 'Reliance Industries', exchange: 'NSE' },
      { symbol: 'RELIANCE.BO', name: 'Reliance Industries', exchange: 'BSE' },
    ];

    const parsed = SearchResponseSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toHaveLength(2);
    }
  });
});

describe('BatchQuoteResponseSchema Zod Validation', () => {
  it('validates array of stock quotes', () => {
    const raw = [
      { symbol: 'SBIN.NS', price: 780.0 },
      { symbol: 'HDFCBANK.NS', price: 1650.0 },
    ];

    const parsed = BatchQuoteResponseSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
  });

  it('validates key-value record of stock quotes', () => {
    const raw = {
      'SBIN.NS': { symbol: 'SBIN.NS', price: 780.0 },
      'HDFCBANK.NS': { symbol: 'HDFCBANK.NS', price: 1650.0 },
    };

    const parsed = BatchQuoteResponseSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
  });
});
