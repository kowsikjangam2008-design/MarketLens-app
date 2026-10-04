import { describe, it, expect } from 'vitest';
import { normalizeStockQuote, normalizeSearchResult } from '@/lib/market/normalizer';
import { RawStockQuote, RawSearchResultItem } from '@/lib/market/validation';

describe('normalizeStockQuote', () => {
  it('correctly maps all available fields and infers NSE exchange', () => {
    const raw: RawStockQuote = {
      symbol: 'reliance.ns',
      name: 'Reliance Industries Limited',
      price: 2950.0,
      change: 15.0,
      changePercent: 0.51,
      volume: 3500000,
      marketCap: 20000000000000,
      pe: 28.0,
      eps: 105.0,
      dividendYield: 0.35,
    };

    const normalized = normalizeStockQuote(raw);
    expect(normalized.symbol).toBe('RELIANCE.NS');
    expect(normalized.exchange).toBe('NSE');
    expect(normalized.price).toBe(2950.0);
    expect(normalized.changePercent).toBe(0.51);
  });

  it('calculates changePercent accurately if missing from raw quote', () => {
    const raw: RawStockQuote = {
      symbol: 'TCS.NS',
      price: 4000.0,
      change: 40.0, // previous close was 3960
      changePercent: null,
    };

    const normalized = normalizeStockQuote(raw);
    // (40 / 3960) * 100 = 1.0101... -> 1.01
    expect(normalized.changePercent).toBe(1.01);
  });

  it('keeps missing fields as null rather than defaulting to 0', () => {
    const raw: RawStockQuote = {
      symbol: 'INFY.NS',
      price: 1800.0,
    };

    const normalized = normalizeStockQuote(raw);
    expect(normalized.pe).toBeNull();
    expect(normalized.eps).toBeNull();
    expect(normalized.dividendYield).toBeNull();
    expect(normalized.volume).toBeNull();
    expect(normalized.marketCap).toBeNull();
  });
});

describe('normalizeSearchResult', () => {
  it('normalizes search results with proper uppercase symbol and exchange fallback', () => {
    const raw: RawSearchResultItem = {
      symbol: 'hdfcbank.ns',
      shortname: 'HDFC Bank',
    };

    const normalized = normalizeSearchResult(raw);
    expect(normalized.symbol).toBe('HDFCBANK.NS');
    expect(normalized.name).toBe('HDFC Bank');
    expect(normalized.exchange).toBe('NSE');
    expect(normalized.type).toBe('Equity');
  });
});
