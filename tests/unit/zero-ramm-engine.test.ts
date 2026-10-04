import { describe, it, expect } from 'vitest';
import {
  determineExchange,
  formatCurrency,
  formatMarketCap,
  formatVolume,
  formatPercentage,
  formatRatio,
  searchInCache,
} from '@/lib/providers/market/zero-ramm-engine/format';
import { handleHome, handleSymbols } from '@/lib/providers/market/zero-ramm-engine';

describe('0xramm v3.0 Engine Utilities', () => {
  describe('determineExchange', () => {
    it('defaults to NSE (.NS) for plain symbols', () => {
      expect(determineExchange('itc')).toEqual(['ITC', '.NS']);
      expect(determineExchange('RELIANCE')).toEqual(['RELIANCE', '.NS']);
    });

    it('preserves explicit NSE (.NS) and BSE (.BO) suffixes', () => {
      expect(determineExchange('itc.ns')).toEqual(['ITC', '.NS']);
      expect(determineExchange('itc.bo')).toEqual(['ITC', '.BO']);
      expect(determineExchange('TCS.BO')).toEqual(['TCS', '.BO']);
    });
  });

  describe('formatCurrency', () => {
    it('formats with INR unit by default', () => {
      expect(formatCurrency(445.505, true)).toEqual({ value: 445.51, unit: 'INR' });
      expect(formatCurrency(null, true)).toEqual({ value: 'N/A', unit: 'INR' });
    });

    it('returns raw number when withUnit is false', () => {
      expect(formatCurrency(445.505, false)).toBe(445.51);
    });
  });

  describe('formatMarketCap', () => {
    it('formats Crore boundaries correctly', () => {
      expect(formatMarketCap(5567894500000, true)).toEqual({ value: 556789.45, unit: 'Crores INR' });
    });

    it('formats Lakh boundaries correctly', () => {
      expect(formatMarketCap(250000, true)).toEqual({ value: 2.5, unit: 'Lakhs INR' });
    });

    it('formats base INR under Lakhs correctly', () => {
      expect(formatMarketCap(5000, true)).toEqual({ value: 5000, unit: 'INR' });
    });
  });

  describe('formatVolume', () => {
    it('formats Crore shares boundary', () => {
      expect(formatVolume(52345670, true)).toEqual({ value: 5.23, unit: 'Crores Shares' });
      expect(formatVolume(52345670, false)).toBe(52345670);
    });
  });

  describe('formatPercentage and formatRatio', () => {
    it('formats percentages correctly', () => {
      expect(formatPercentage(0.5199, true)).toEqual({ value: 0.52, unit: '%' });
    });

    it('formats ratios correctly', () => {
      expect(formatRatio(0, true)).toEqual({ value: 'N/A', unit: 'x' });
      expect(formatRatio(28.451, true)).toEqual({ value: 28.45, unit: 'x' });
    });
  });

  describe('searchInCache', () => {
    it('finds exact matches', () => {
      const results = searchInCache('reliance');
      expect(results.map((r) => r.symbol)).toContain('RELIANCE');
    });

    it('finds partial matches', () => {
      const results = searchInCache('tata');
      expect(results.some((r) => r.symbol === 'TCS')).toBe(true);
    });
  });

  describe('endpoint handlers', () => {
    it('handleHome returns operational status with documented endpoints', () => {
      const home = handleHome();
      expect(home.status).toBe('success');
      expect(home.version).toBe('3.0');
      expect(home.endpoints).toBeDefined();
    });

    it('handleSymbols returns pre-cached symbol list', () => {
      const symbolsResponse = handleSymbols();
      expect(symbolsResponse.status).toBe('success');
      expect(symbolsResponse.total_symbols).toBeGreaterThan(20);
      expect(Array.isArray(symbolsResponse.symbols)).toBe(true);
    });
  });
});
