import { HistoricalCandle } from '@/types/market';
import { SMAResult, IndicatorPoint } from '@/types/technical';

/**
 * Calculates Simple Moving Average (SMA) from historical candle closes.
 * Returns null if candles length < period.
 */
export function calculateSMA(candles: HistoricalCandle[], period = 20): SMAResult | null {
  if (!candles || candles.length < period || period <= 0) {
    return null;
  }

  // Sort ascending by time
  const sorted = [...candles].sort((a, b) => {
    const tA = typeof a.time === 'number' ? a.time : new Date(a.time).getTime();
    const tB = typeof b.time === 'number' ? b.time : new Date(b.time).getTime();
    return tA - tB;
  });

  const values: IndicatorPoint<number>[] = [];

  for (let i = period - 1; i < sorted.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      const candle = sorted[i - j];
      if (!candle || typeof candle.close !== 'number' || Number.isNaN(candle.close)) {
        return null;
      }
      sum += candle.close;
    }
    const avg = Number((sum / period).toFixed(2));
    const current = sorted[i];
    if (current) {
      values.push({
        time: current.time,
        value: avg,
      });
    }
  }

  const latest = values.length > 0 ? (values[values.length - 1]?.value ?? null) : null;

  return {
    period,
    values,
    latest,
  };
}
