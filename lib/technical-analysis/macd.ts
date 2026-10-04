import { HistoricalCandle } from '@/types/market';
import { MACDResult, MACDValue, IndicatorPoint } from '@/types/technical';
import { calculateEMA } from './ema';

/**
 * Calculates Moving Average Convergence Divergence (MACD).
 * Default: fast=12, slow=26, signal=9.
 * Returns null if candles length < slow + signal.
 */
export function calculateMACD(
  candles: HistoricalCandle[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MACDResult | null {
  if (!candles || candles.length < slowPeriod + signalPeriod) {
    return null;
  }

  const fastEma = calculateEMA(candles, fastPeriod);
  const slowEma = calculateEMA(candles, slowPeriod);

  if (!fastEma || !slowEma) {
    return null;
  }

  // Align fast and slow by time
  const slowTimes = new Set(slowEma.values.map((v) => v.time));
  const fastMap = new Map(fastEma.values.map((v) => [v.time, v.value]));

  const macdLinePoints: IndicatorPoint<number>[] = [];
  for (const s of slowEma.values) {
    const fVal = fastMap.get(s.time);
    if (fVal !== undefined) {
      macdLinePoints.push({
        time: s.time,
        value: Number((fVal - s.value).toFixed(2)),
      });
    }
  }

  if (macdLinePoints.length < signalPeriod) {
    return null;
  }

  // Calculate Signal line (EMA of MACD line)
  // Convert macdLinePoints to mock candles format for calculateEMA reuse
  const mockCandles: HistoricalCandle[] = macdLinePoints.map((p) => ({
    time: p.time,
    open: p.value,
    high: p.value,
    low: p.value,
    close: p.value,
  }));

  const signalEma = calculateEMA(mockCandles, signalPeriod);
  if (!signalEma) {
    return null;
  }

  const signalMap = new Map(signalEma.values.map((v) => [v.time, v.value]));
  const values: IndicatorPoint<MACDValue>[] = [];

  for (const p of macdLinePoints) {
    const sVal = signalMap.get(p.time);
    if (sVal !== undefined) {
      const hist = Number((p.value - sVal).toFixed(2));
      values.push({
        time: p.time,
        value: {
          macd: p.value,
          signal: sVal,
          histogram: hist,
        },
      });
    }
  }

  const latest = values.length > 0 ? (values[values.length - 1]?.value ?? null) : null;

  return {
    fastPeriod,
    slowPeriod,
    signalPeriod,
    values,
    latest,
  };
}
