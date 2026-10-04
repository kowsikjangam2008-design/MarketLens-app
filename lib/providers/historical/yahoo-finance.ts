import YahooFinance from 'yahoo-finance2';
import { HistoricalCandle, HistoricalDataProvider } from '@/types/market';

export type HistoricalRange = '1D' | '1W' | '1M' | '6M' | '1Y';

interface RangeConfig {
  interval: '5m' | '15m' | '1d';
  daysLookback: number;
  isIntraday: boolean;
  filterLatestDayOnly?: boolean;
}

export const RANGE_CONFIG: Record<HistoricalRange, RangeConfig> = {
  '1D': {
    interval: '5m',
    daysLookback: 5, // Look back 5 days to safely capture latest active trading session on weekends/holidays
    isIntraday: true,
    filterLatestDayOnly: true,
  },
  '1W': {
    interval: '15m',
    daysLookback: 7,
    isIntraday: true,
  },
  '1M': {
    interval: '1d',
    daysLookback: 32,
    isIntraday: false,
  },
  '6M': {
    interval: '1d',
    daysLookback: 185,
    isIntraday: false,
  },
  '1Y': {
    interval: '1d',
    daysLookback: 370,
    isIntraday: false,
  },
};

/**
 * Normalizes input symbol to valid Yahoo Finance Indian stock ticker.
 * Defaults to .NS (National Stock Exchange) if no suffix is supplied.
 */
export function normalizeYahooSymbol(symbolInput: string): string {
  const clean = symbolInput.trim().toUpperCase();
  if (clean.endsWith('.NS') || clean.endsWith('.BO')) {
    return clean;
  }
  return `${clean}.NS`;
}

/**
 * Validates a candle according to strict financial data integrity rules:
 * - open, high, low, close must be finite numbers
 * - volume must be >= 0
 * - high must be >= max(open, close, low)
 * - low must be <= min(open, close, high)
 */
export function isValidCandle(
  open: unknown,
  high: unknown,
  low: unknown,
  close: unknown,
  volume: unknown
): boolean {
  if (
    typeof open !== 'number' || !Number.isFinite(open) ||
    typeof high !== 'number' || !Number.isFinite(high) ||
    typeof low !== 'number' || !Number.isFinite(low) ||
    typeof close !== 'number' || !Number.isFinite(close)
  ) {
    return false;
  }

  if (typeof volume === 'number' && (!Number.isFinite(volume) || volume < 0)) {
    return false;
  }

  const maxVal = Math.max(open, close, low);
  const minVal = Math.min(open, close, high);

  // Allow floating point tolerance of 1e-4
  if (high < maxVal - 0.0001 || low > minVal + 0.0001) {
    return false;
  }

  return true;
}

export class YahooFinanceHistoricalProvider implements HistoricalDataProvider {
  public readonly name = 'Yahoo Finance';
  public readonly capabilities = { historical: true };

  private yf: InstanceType<typeof YahooFinance>;

  constructor() {
    this.yf = new YahooFinance();
  }

  public async getHistoricalCandles(
    symbolInput: string,
    timeframeInput: string = '1D'
  ): Promise<HistoricalCandle[]> {
    const symbol = normalizeYahooSymbol(symbolInput);
    const rangeKey = (timeframeInput.toUpperCase() in RANGE_CONFIG
      ? timeframeInput.toUpperCase()
      : '1D') as HistoricalRange;

    const config = RANGE_CONFIG[rangeKey];
    const period1 = new Date(Date.now() - config.daysLookback * 24 * 60 * 60 * 1000);

    let rawResult;
    try {
      rawResult = await this.yf.chart(symbol, {
        period1,
        interval: config.interval,
        includePrePost: false,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[YahooFinanceHistoricalProvider] Error fetching chart for ${symbol}:`, msg);
      throw new Error(`Failed to fetch historical data for ${symbol}: ${msg}`);
    }

    if (!rawResult || !Array.isArray(rawResult.quotes) || rawResult.quotes.length === 0) {
      return [];
    }

    let quotes = rawResult.quotes;

    // For 1D timeframe outside market hours or weekends, isolate the single latest active trading day in Asia/Kolkata
    if (config.filterLatestDayOnly) {
      const dateGroups = new Map<string, typeof quotes>();
      for (const q of quotes) {
        if (!q.date) continue;
        const dStr = new Date(q.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        if (!dateGroups.has(dStr)) {
          dateGroups.set(dStr, []);
        }
        dateGroups.get(dStr)!.push(q);
      }

      // Filter to dates that contain actual trading data (not market holidays / empty sessions)
      const activeTradingDates = Array.from(dateGroups.entries())
        .filter(([_, dayQuotes]) =>
          dayQuotes.some((q) => q.open !== null && Number.isFinite(q.open as number))
        )
        .map(([dStr]) => dStr)
        .sort();

      if (activeTradingDates.length > 0) {
        const latestDate = activeTradingDates[activeTradingDates.length - 1];
        if (latestDate) {
          quotes = dateGroups.get(latestDate) || [];
        }
      }
    }

    const validatedCandles: HistoricalCandle[] = [];
    const seenTimes = new Set<number | string>();

    for (const q of quotes) {
      if (!q.date) continue;

      const open = q.open;
      const high = q.high;
      const low = q.low;
      const close = q.close;
      const volume = typeof q.volume === 'number' && Number.isFinite(q.volume) ? q.volume : 0;

      if (!isValidCandle(open, high, low, close, volume)) {
        continue;
      }

      let time: number | string;
      if (config.isIntraday) {
        // Unix timestamp in seconds for intraday time-of-day precision
        time = Math.floor(new Date(q.date).getTime() / 1000);
      } else {
        // 'YYYY-MM-DD' calendar date in Asia/Kolkata for daily candles
        time = new Date(q.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      }

      if (seenTimes.has(time)) {
        continue; // Deduplicate
      }
      seenTimes.add(time);

      validatedCandles.push({
        time,
        open: open as number,
        high: high as number,
        low: low as number,
        close: close as number,
        volume,
      });
    }

    // Sort strictly ascending by time
    validatedCandles.sort((a, b) => {
      const tA = typeof a.time === 'number' ? a.time : new Date(a.time).getTime() / 1000;
      const tB = typeof b.time === 'number' ? b.time : new Date(b.time).getTime() / 1000;
      return tA - tB;
    });

    return validatedCandles;
  }
}

export const yahooFinanceHistoricalProvider = new YahooFinanceHistoricalProvider();
