import { describe, it, expect } from 'vitest';
import { analyzeStockSignals } from '@/lib/signals/analyzer';
import { StockQuote } from '@/types/market';

describe('analyzeStockSignals', () => {
  it('marks Trend and Momentum as UNAVAILABLE when historical candles are missing', () => {
    const quote: StockQuote = {
      symbol: 'RELIANCE.NS',
      name: 'Reliance Industries',
      exchange: 'NSE',
      price: 2900.0,
      change: 10.0,
      changePercent: 0.35,
      volume: 4000000,
      marketCap: 20000000000000,
      pe: 25.0,
      eps: 102.0,
      dividendYield: 0.35,
      open: 2890.0,
      high: 2910.0,
      low: 2885.0,
      previousClose: 2890.0,
      fiftyTwoWeekHigh: 3000.0,
      fiftyTwoWeekLow: 2200.0,
      sector: 'Energy',
      industry: 'Oil & Gas',
      currency: 'INR',
    };

    const result = analyzeStockSignals(quote, null);

    const trendFactor = result.factors.find((f) => f.id === 'trend');
    const momentumFactor = result.factors.find((f) => f.id === 'momentum');

    expect(trendFactor?.status).toBe('UNAVAILABLE');
    expect(trendFactor?.score).toBeNull();
    expect(trendFactor?.assessment).toBe('UNAVAILABLE');

    expect(momentumFactor?.status).toBe('UNAVAILABLE');
    expect(momentumFactor?.score).toBeNull();

    // Mandatory disclaimers
    expect(result.disclaimer).toContain('Not personalized investment advice');
    expect(result.whyThisSignal).toBeTruthy();
    expect(result.dataLimitations.length).toBeGreaterThan(0);
  });

  it('evaluates valuation and fundamentals when fields exist in quote', () => {
    const quote: StockQuote = {
      symbol: 'TCS.NS',
      name: 'Tata Consultancy Services',
      exchange: 'NSE',
      price: 3900.0,
      change: 20.0,
      changePercent: 0.5,
      volume: 1500000,
      marketCap: 14000000000000,
      pe: 30.0,
      eps: 130.0,
      dividendYield: 1.2,
      open: 3880.0,
      high: 3910.0,
      low: 3870.0,
      previousClose: 3880.0,
      fiftyTwoWeekHigh: 4200.0,
      fiftyTwoWeekLow: 3200.0,
      sector: 'Information Technology',
      industry: 'IT Services',
      currency: 'INR',
    };

    const result = analyzeStockSignals(quote, null);

    const valFactor = result.factors.find((f) => f.id === 'valuation');
    const fundFactor = result.factors.find((f) => f.id === 'fundamentals');

    expect(valFactor?.status).toBe('AVAILABLE');
    expect(fundFactor?.status).toBe('AVAILABLE');
  });
});
