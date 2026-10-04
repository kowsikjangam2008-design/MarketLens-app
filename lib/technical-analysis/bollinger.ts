import { HistoricalCandle } from '@/types/market';
import { BollingerBandsResult, BollingerValue, IndicatorPoint } from '@/types/technical';

/**
 * Calculates Bollinger Bands (Middle, Upper, Lower, Bandwidth).
 * Default: period=20, stdDevMultiplier=2.
 * Returns null if candles length < period.
 */
export function calculateBollingerBands(
  candles: HistoricalCandle[],
  period = 20,
  stdDevMultiplier = 2
): BollingerBandsResult | null {
  if (!candles || candles.length < period || period <= 0) {
    return null;
  }

  const sorted = [...candles].sort((a, b) => {
    const tA = typeof a.time === 'number' ? a.time : new Date(a.time).getTime();
    const tB = typeof b.time === 'number' ? b.time : new Date(b.time).getTime();
    return tA - tB;
  });

  const values: IndicatorPoint<BollingerValue>[] = [];

  for (let i = period - 1; i < sorted.length; i++) {
    const slice = sorted.slice(i - period + 1, i + 1);
    
    let sum = 0;
    for (const c of slice) {
      if (typeof c.close !== 'number' || Number.isNaN(c.close)) {
        return null;
      }
      sum += c.close;
    }
    const middle = sum / period;

    let varianceSum = 0;
    for (const c of slice) {
      varianceSum += Math.pow(c.close - middle, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    const upper = middle + stdDevMultiplier * stdDev;
    const lower = middle - stdDevMultiplier * stdDev;
    const bandwidth = middle > 0 ? ((upper - lower) / middle) * 100 : 0;

    const currentCandle = sorted[i];
    if (currentCandle) {
      values.push({
        time: currentCandle.time,
        value: {
          middle: Number(middle.toFixed(2)),
          upper: Number(upper.toFixed(2)),
          lower: Number(lower.toFixed(2)),
          bandwidth: Number(bandwidth.toFixed(2)),
        },
      });
    }
  }

  const latest = values.length > 0 ? (values[values.length - 1]?.value ?? null) : null;

  return {
    period,
    stdDevMultiplier,
    values,
    latest,
  };
}
