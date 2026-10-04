import { HistoricalCandle } from '@/types/market';
import { EMAResult, IndicatorPoint } from '@/types/technical';

/**
 * Calculates Exponential Moving Average (EMA) from historical candle closes.
 * Returns null if candles length < period.
 */
export function calculateEMA(candles: HistoricalCandle[], period = 20): EMAResult | null {
  if (!candles || candles.length < period || period <= 0) {
    return null;
  }

  const sorted = [...candles].sort((a, b) => {
    const tA = typeof a.time === 'number' ? a.time : new Date(a.time).getTime();
    const tB = typeof b.time === 'number' ? b.time : new Date(b.time).getTime();
    return tA - tB;
  });

  const k = 2 / (period + 1);
  const values: IndicatorPoint<number>[] = [];

  // Calculate first SMA as baseline for EMA
  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    const c = sorted[i];
    if (!c || typeof c.close !== 'number' || Number.isNaN(c.close)) {
      return null;
    }
    initialSum += c.close;
  }

  let prevEma = initialSum / period;
  const initialCandle = sorted[period - 1];
  if (initialCandle) {
    values.push({
      time: initialCandle.time,
      value: Number(prevEma.toFixed(2)),
    });
  }

  for (let i = period; i < sorted.length; i++) {
    const c = sorted[i];
    if (!c || typeof c.close !== 'number' || Number.isNaN(c.close)) {
      return null;
    }
    const currentEma = (c.close - prevEma) * k + prevEma;
    values.push({
      time: c.time,
      value: Number(currentEma.toFixed(2)),
    });
    prevEma = currentEma;
  }

  const latest = values.length > 0 ? (values[values.length - 1]?.value ?? null) : null;

  return {
    period,
    values,
    latest,
  };
}
