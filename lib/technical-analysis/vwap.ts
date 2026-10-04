import { HistoricalCandle } from '@/types/market';
import { VWAPResult, IndicatorPoint } from '@/types/technical';

/**
 * Calculates Volume Weighted Average Price (VWAP).
 * Cumulative (Typical Price * Volume) / Cumulative Volume.
 * Returns null if candles length == 0 or candles lack volume.
 */
export function calculateVWAP(candles: HistoricalCandle[]): VWAPResult | null {
  if (!candles || candles.length === 0) {
    return null;
  }

  const sorted = [...candles].sort((a, b) => {
    const tA = typeof a.time === 'number' ? a.time : new Date(a.time).getTime();
    const tB = typeof b.time === 'number' ? b.time : new Date(b.time).getTime();
    return tA - tB;
  });

  let cumulativePv = 0;
  let cumulativeVolume = 0;
  const values: IndicatorPoint<number>[] = [];

  for (const c of sorted) {
    if (typeof c.volume !== 'number' || c.volume <= 0) {
      return null; // Cannot calculate VWAP without genuine volume
    }

    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumulativePv += typicalPrice * c.volume;
    cumulativeVolume += c.volume;

    const vwap = cumulativeVolume > 0 ? cumulativePv / cumulativeVolume : typicalPrice;
    values.push({
      time: c.time,
      value: Number(vwap.toFixed(2)),
    });
  }

  const latest = values.length > 0 ? (values[values.length - 1]?.value ?? null) : null;

  return {
    values,
    latest,
  };
}
