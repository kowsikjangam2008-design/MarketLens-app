import { HistoricalCandle } from '@/types/market';
import { ATRResult, IndicatorPoint } from '@/types/technical';

/**
 * Calculates Average True Range (ATR).
 * Default: period = 14.
 * Returns null if candles length <= period.
 */
export function calculateATR(candles: HistoricalCandle[], period = 14): ATRResult | null {
  if (!candles || candles.length <= period || period <= 0) {
    return null;
  }

  const sorted = [...candles].sort((a, b) => {
    const tA = typeof a.time === 'number' ? a.time : new Date(a.time).getTime();
    const tB = typeof b.time === 'number' ? b.time : new Date(b.time).getTime();
    return tA - tB;
  });

  const trValues: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    const prev = sorted[i - 1];
    if (!curr || !prev) return null;

    const hl = curr.high - curr.low;
    const hpc = Math.abs(curr.high - prev.close);
    const lpc = Math.abs(curr.low - prev.close);

    const tr = Math.max(hl, hpc, lpc);
    trValues.push(tr);
  }

  if (trValues.length < period) {
    return null;
  }

  // Initial ATR is simple average of first period TRs
  let currentAtr = 0;
  for (let i = 0; i < period; i++) {
    currentAtr += trValues[i] ?? 0;
  }
  currentAtr /= period;

  const values: IndicatorPoint<number>[] = [];
  const initialCandle = sorted[period];
  if (initialCandle) {
    values.push({
      time: initialCandle.time,
      value: Number(currentAtr.toFixed(2)),
    });
  }

  // Subsequent ATRs using Wilder smoothing: ATR = (Prior ATR * (n-1) + Current TR) / n
  for (let i = period; i < trValues.length; i++) {
    const tr = trValues[i] ?? 0;
    currentAtr = (currentAtr * (period - 1) + tr) / period;
    const candle = sorted[i + 1];
    if (candle) {
      values.push({
        time: candle.time,
        value: Number(currentAtr.toFixed(2)),
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
