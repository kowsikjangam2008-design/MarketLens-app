import { describe, it, expect, vi } from 'vitest';
import {
  normalizeYahooSymbol,
  isValidCandle,
  RANGE_CONFIG,
  YahooFinanceHistoricalProvider,
  yahooFinanceHistoricalProvider,
} from '@/lib/providers/historical/yahoo-finance';

describe('normalizeYahooSymbol', () => {
  it('appends .NS to bare Indian stock tickers', () => {
    expect(normalizeYahooSymbol('RELIANCE')).toBe('RELIANCE.NS');
    expect(normalizeYahooSymbol('tcs')).toBe('TCS.NS');
    expect(normalizeYahooSymbol('INFY')).toBe('INFY.NS');
    expect(normalizeYahooSymbol('HDFCBANK')).toBe('HDFCBANK.NS');
  });

  it('preserves existing .NS suffix', () => {
    expect(normalizeYahooSymbol('RELIANCE.NS')).toBe('RELIANCE.NS');
    expect(normalizeYahooSymbol('tcs.ns')).toBe('TCS.NS');
  });

  it('preserves BSE .BO suffix', () => {
    expect(normalizeYahooSymbol('500325.BO')).toBe('500325.BO');
    expect(normalizeYahooSymbol('RELIANCE.BO')).toBe('RELIANCE.BO');
  });

  it('trims whitespace and handles mixed case', () => {
    expect(normalizeYahooSymbol('  tatamotors  ')).toBe('TATAMOTORS.NS');
    expect(normalizeYahooSymbol('  wipro.ns \n')).toBe('WIPRO.NS');
  });
});

describe('isValidCandle', () => {
  it('accepts valid OHLCV candles', () => {
    expect(isValidCandle(100, 105, 95, 102, 10000)).toBe(true);
    expect(isValidCandle(2500.5, 2510.0, 2490.25, 2505.75, 50000)).toBe(true);
  });

  it('accepts flat candles where open = high = low = close', () => {
    expect(isValidCandle(100, 100, 100, 100, 0)).toBe(true);
  });

  it('accepts zero or undefined volume', () => {
    expect(isValidCandle(100, 105, 95, 102, 0)).toBe(true);
    expect(isValidCandle(100, 105, 95, 102, undefined)).toBe(true);
  });

  it('rejects candles with missing or non-finite price values', () => {
    expect(isValidCandle(null, 105, 95, 100, 1000)).toBe(false);
    expect(isValidCandle(100, undefined, 95, 100, 1000)).toBe(false);
    expect(isValidCandle(100, 105, NaN, 100, 1000)).toBe(false);
    expect(isValidCandle(100, 105, 95, Infinity, 1000)).toBe(false);
    expect(isValidCandle('100' as unknown, 105, 95, 100, 1000)).toBe(false);
  });

  it('rejects candle where high is strictly less than open, close, or low', () => {
    expect(isValidCandle(100, 95, 90, 92, 1000)).toBe(false); // high 95 < open 100
    expect(isValidCandle(90, 95, 85, 100, 1000)).toBe(false); // high 95 < close 100
  });

  it('rejects candle where low is strictly greater than open, close, or high', () => {
    expect(isValidCandle(100, 110, 105, 108, 1000)).toBe(false); // low 105 > open 100
    expect(isValidCandle(100, 110, 105, 102, 1000)).toBe(false); // low 105 > close 102
  });

  it('rejects negative volume', () => {
    expect(isValidCandle(100, 105, 95, 100, -500)).toBe(false);
  });
});

describe('RANGE_CONFIG', () => {
  it('contains expected definitions for all 5 ranges', () => {
    expect(RANGE_CONFIG['1D'].interval).toBe('5m');
    expect(RANGE_CONFIG['1D'].isIntraday).toBe(true);
    expect(RANGE_CONFIG['1D'].filterLatestDayOnly).toBe(true);

    expect(RANGE_CONFIG['1W'].interval).toBe('15m');
    expect(RANGE_CONFIG['1W'].isIntraday).toBe(true);

    expect(RANGE_CONFIG['1M'].interval).toBe('1d');
    expect(RANGE_CONFIG['1M'].isIntraday).toBe(false);

    expect(RANGE_CONFIG['6M'].interval).toBe('1d');
    expect(RANGE_CONFIG['6M'].isIntraday).toBe(false);

    expect(RANGE_CONFIG['1Y'].interval).toBe('1d');
    expect(RANGE_CONFIG['1Y'].isIntraday).toBe(false);
  });
});

describe('YahooFinanceHistoricalProvider', () => {
  it('exposes correct metadata and capabilities', () => {
    const provider = new YahooFinanceHistoricalProvider();
    expect(provider.name).toBe('Yahoo Finance');
    expect(provider.capabilities.historical).toBe(true);
    expect(yahooFinanceHistoricalProvider.name).toBe('Yahoo Finance');
  });

  it('transforms and filters raw chart quotes properly', async () => {
    const provider = new YahooFinanceHistoricalProvider();
    const mockQuotes = [
      {
        date: new Date('2026-03-27T09:15:00.000Z'),
        open: 100,
        high: 105,
        low: 99,
        close: 104,
        volume: 15000,
      },
      {
        // Invalid candle: high < open
        date: new Date('2026-03-27T09:20:00.000Z'),
        open: 110,
        high: 105,
        low: 99,
        close: 102,
        volume: 12000,
      },
      {
        date: new Date('2026-03-27T09:25:00.000Z'),
        open: 104,
        high: 108,
        low: 103,
        close: 107,
        volume: 20000,
      },
      {
        // Duplicate timestamp
        date: new Date('2026-03-27T09:25:00.000Z'),
        open: 104,
        high: 108,
        low: 103,
        close: 107,
        volume: 20000,
      },
    ];

    // Mock chart call
    (provider as any).yf = {
      chart: vi.fn().mockResolvedValue({ quotes: mockQuotes }),
    };

    const candles = await provider.getHistoricalCandles('RELIANCE', '1D');
    expect(candles).toHaveLength(2);
    expect(candles[0]!.open).toBe(100);
    expect(candles[0]!.close).toBe(104);
    expect(candles[1]!.open).toBe(104);
    expect(candles[1]!.close).toBe(107);
    expect(typeof candles[0]!.time).toBe('number');
  });
});
