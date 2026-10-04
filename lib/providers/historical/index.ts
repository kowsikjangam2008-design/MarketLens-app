import { HistoricalCandle, HistoricalDataProvider } from '@/types/market';

/**
 * Historical Data Provider implementation for the current system.
 * Because 0xramm Indian Stock Market API has NO historical candle endpoint,
 * this provider explicitly reports capability as false and throws informative errors.
 * NEVER generate fake candles.
 */
export class UnavailableHistoricalDataProvider implements HistoricalDataProvider {
  public readonly name = 'Historical Provider (None configured)';
  public readonly capabilities = {
    historical: false,
  };

  public async getHistoricalCandles(_symbol: string, _timeframe: string): Promise<HistoricalCandle[]> {
    throw new Error('Historical chart data is not supported by the current 0xramm market data provider.');
  }
}

export const defaultHistoricalProvider = new UnavailableHistoricalDataProvider();

export function getHistoricalDataProvider(): HistoricalDataProvider {
  return defaultHistoricalProvider;
}

/**
 * Normalizer for Lightweight Charts v5 series data format.
 * Expects real HistoricalCandle data sorted strictly ascending by timestamp.
 */
export interface NormalizedChartData {
  candlesticks: { time: number | string; open: number; high: number; low: number; close: number }[];
  line: { time: number | string; value: number }[];
  area: { time: number | string; value: number }[];
  volume: { time: number | string; value: number; color?: string }[];
}

export function normalizeChartData(candles: HistoricalCandle[]): NormalizedChartData {
  if (!candles || candles.length === 0) {
    return { candlesticks: [], line: [], area: [], volume: [] };
  }

  // Sort ascending by time (required strictly by Lightweight Charts)
  const sorted = [...candles].sort((a, b) => {
    const tA = typeof a.time === 'number' ? a.time : new Date(a.time).getTime() / 1000;
    const tB = typeof b.time === 'number' ? b.time : new Date(b.time).getTime() / 1000;
    return tA - tB;
  });

  const candlesticks = sorted.map((c) => ({
    time: c.time,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));

  const line = sorted.map((c) => ({
    time: c.time,
    value: c.close,
  }));

  const area = sorted.map((c) => ({
    time: c.time,
    value: c.close,
  }));

  const volume = sorted.map((c) => ({
    time: c.time,
    value: c.volume ?? 0,
    color: c.close >= c.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
  }));

  return { candlesticks, line, area, volume };
}
