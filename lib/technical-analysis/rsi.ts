import { HistoricalCandle } from '@/types/market';
import { RSIResult, IndicatorPoint } from '@/types/technical';

/**
 * Calculates Relative Strength Index (RSI) using Wilder's smoothing technique.
 * Returns null if candles length <= period.
 */
export function calculateRSI(candles: HistoricalCandle[], period = 14): RSIResult | null {
  if (!candles || candles.length <= period || period <= 0) {
    return null;
  }

  const sorted = [...candles].sort((a, b) => {
    const tA = typeof a.time === 'number' ? a.time : new Date(a.time).getTime();
    const tB = typeof b.time === 'number' ? b.time : new Date(b.time).getTime();
    return tA - tB;
  });

  const changes: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    const prev = sorted[i - 1];
    if (!curr || !prev || typeof curr.close !== 'number' || typeof prev.close !== 'number') {
      return null;
    }
    changes.push(curr.close - prev.close);
  }

  if (changes.length < period) {
    return null;
  }

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    const ch = changes[i] ?? 0;
    if (ch >= 0) avgGain += ch;
    else avgLoss += Math.abs(ch);
  }

  avgGain /= period;
  avgLoss /= period;

  const values: IndicatorPoint<number>[] = [];

  const calcRsi = (gain: number, loss: number): number => {
    if (loss === 0) return 100;
    const rs = gain / loss;
    return Number((100 - 100 / (1 + rs)).toFixed(2));
  };

  const firstCandle = sorted[period];
  if (firstCandle) {
    values.push({
      time: firstCandle.time,
      value: calcRsi(avgGain, avgLoss),
    });
  }

  for (let i = period; i < changes.length; i++) {
    const change = changes[i] ?? 0;
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const candle = sorted[i + 1];
    if (candle) {
      values.push({
        time: candle.time,
        value: calcRsi(avgGain, avgLoss),
      });
    }
  }

  const latest = values.length > 0 ? (values[values.length - 1]?.value ?? null) : null;

  return {
    period,
    values,
    latest,
    isOverbought: latest !== null ? latest >= 70 : false,
    isOversold: latest !== null ? latest <= 30 : false,
  };
}
