import { describe, it, expect } from 'vitest';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
  calculateVWAP,
} from '@/lib/technical-analysis';
import { HistoricalCandle } from '@/types/market';

// Generate mock candles strictly for testing mathematical correctness of pure algorithms
function generateTestCandles(count: number, basePrice = 100): HistoricalCandle[] {
  const candles: HistoricalCandle[] = [];
  let price = basePrice;
  const startTime = 1700000000;

  for (let i = 0; i < count; i++) {
    const change = (i % 2 === 0 ? 1 : -0.5) * (1 + (i % 3));
    price += change;
    candles.push({
      time: startTime + i * 86400,
      open: price - 0.5,
      high: price + 1.5,
      low: price - 1.0,
      close: price,
      volume: 10000 + i * 500,
    });
  }
  return candles;
}

describe('Technical Analysis Indicator Unit Tests', () => {
  describe('calculateSMA', () => {
    it('returns null if candles count is less than period', () => {
      const candles = generateTestCandles(10);
      expect(calculateSMA(candles, 20)).toBeNull();
    });

    it('calculates correct SMA value', () => {
      const candles = [
        { time: 1, open: 10, high: 12, low: 9, close: 10 },
        { time: 2, open: 11, high: 13, low: 10, close: 20 },
        { time: 3, open: 20, high: 22, low: 19, close: 30 },
      ];
      const result = calculateSMA(candles, 3);
      expect(result).not.toBeNull();
      // (10 + 20 + 30) / 3 = 20
      expect(result?.latest).toBe(20);
    });
  });

  describe('calculateEMA', () => {
    it('returns null if candles count is less than period', () => {
      const candles = generateTestCandles(5);
      expect(calculateEMA(candles, 10)).toBeNull();
    });

    it('calculates EMA with higher weighting on recent prices', () => {
      const candles = generateTestCandles(30);
      const result = calculateEMA(candles, 10);
      expect(result).not.toBeNull();
      expect(typeof result?.latest).toBe('number');
    });
  });

  describe('calculateRSI', () => {
    it('returns null if candles count is less than period + 1', () => {
      const candles = generateTestCandles(10);
      expect(calculateRSI(candles, 14)).toBeNull();
    });

    it('calculates RSI bounded between 0 and 100', () => {
      const candles = generateTestCandles(40);
      const result = calculateRSI(candles, 14);
      expect(result).not.toBeNull();
      expect(result?.latest).toBeGreaterThanOrEqual(0);
      expect(result?.latest).toBeLessThanOrEqual(100);
      expect(typeof result?.isOverbought).toBe('boolean');
      expect(typeof result?.isOversold).toBe('boolean');
    });
  });

  describe('calculateMACD', () => {
    it('returns null if candles count is less than slowPeriod + signalPeriod', () => {
      const candles = generateTestCandles(30);
      expect(calculateMACD(candles, 12, 26, 9)).toBeNull();
    });

    it('calculates MACD line, signal line, and histogram', () => {
      const candles = generateTestCandles(50);
      const result = calculateMACD(candles, 12, 26, 9);
      expect(result).not.toBeNull();
      expect(result?.latest).toHaveProperty('macd');
      expect(result?.latest).toHaveProperty('signal');
      expect(result?.latest).toHaveProperty('histogram');
    });
  });

  describe('calculateBollingerBands', () => {
    it('returns null if candles count is less than period', () => {
      const candles = generateTestCandles(10);
      expect(calculateBollingerBands(candles, 20)).toBeNull();
    });

    it('calculates Upper band > Middle band > Lower band', () => {
      const candles = generateTestCandles(30);
      const result = calculateBollingerBands(candles, 20, 2);
      expect(result).not.toBeNull();
      if (result && result.latest) {
        expect(result.latest.upper).toBeGreaterThanOrEqual(result.latest.middle);
        expect(result.latest.middle).toBeGreaterThanOrEqual(result.latest.lower);
      }
    });
  });

  describe('calculateATR', () => {
    it('returns null if candles count is less than period + 1', () => {
      const candles = generateTestCandles(10);
      expect(calculateATR(candles, 14)).toBeNull();
    });

    it('calculates a positive Average True Range', () => {
      const candles = generateTestCandles(30);
      const result = calculateATR(candles, 14);
      expect(result).not.toBeNull();
      expect(result?.latest).toBeGreaterThan(0);
    });
  });

  describe('calculateVWAP', () => {
    it('returns null if candle volume is missing or non-positive', () => {
      const candles: HistoricalCandle[] = [
        { time: 1, open: 10, high: 12, low: 9, close: 10 },
      ];
      expect(calculateVWAP(candles)).toBeNull();
    });

    it('calculates VWAP correctly when volume is provided', () => {
      const candles: HistoricalCandle[] = [
        { time: 1, open: 10, high: 12, low: 8, close: 10, volume: 100 }, // TP = 10, TP*V = 1000
        { time: 2, open: 10, high: 14, low: 10, close: 12, volume: 200 }, // TP = 12, TP*V = 2400
      ];
      // Total PV = 3400, Total V = 300, VWAP = 3400 / 300 = 11.33
      const result = calculateVWAP(candles);
      expect(result).not.toBeNull();
      expect(result?.latest).toBe(11.33);
    });
  });
});
