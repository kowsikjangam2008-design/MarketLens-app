import { describe, it, expect } from 'vitest';
import { getFinancialTerm, FINANCIAL_TERMS } from '@/lib/finance/terms';

describe('Financial Glossary & Terms Lookup', () => {
  it('retrieves key required financial terms by exact key', () => {
    const requiredKeys = [
      'market_cap',
      'ltp',
      'volume',
      'pe',
      'eps',
      'dividend_yield',
      'sector',
      'price_change',
      'percentage_change',
      'ohlc',
      'sma',
      'ema',
      'rsi',
      'macd',
      'bollinger_bands',
      'atr',
      'vwap',
      'bid',
      'ask',
      'spread',
      'beta',
      'volatility',
      'ipo',
    ];

    for (const key of requiredKeys) {
      const term = getFinancialTerm(key);
      expect(term, `Term for key "${key}" should exist`).toBeDefined();
      expect(term?.shortDefinition).toBeTruthy();
      expect(term?.detailedExplanation).toBeTruthy();
      expect(term?.simpleExample).toBeTruthy();
      expect(term?.whyItMatters).toBeTruthy();
    }
  });

  it('tolerates case and spacing variations', () => {
    expect(getFinancialTerm('Market Cap')).toBeDefined();
    expect(getFinancialTerm('p/e')).toBeDefined();
    expect(getFinancialTerm('RSI')).toBeDefined();
  });
});
