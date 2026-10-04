import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getHistoricalDataProvider } from '@/lib/providers/historical';
import { normalizeYahooSymbol } from '@/lib/providers/historical/yahoo-finance';

const HistoryQuerySchema = z.object({
  symbol: z
    .string()
    .min(1, 'Symbol is required')
    .max(30, 'Symbol too long')
    .regex(/^[A-Za-z0-9_.\-&]+$/, 'Invalid symbol format'),
  range: z.enum(['1D', '1W', '1M', '6M', '1Y']).default('1D'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSymbol = searchParams.get('symbol');
    const rawRange = (searchParams.get('range') || '1D').toUpperCase();

    const validation = HistoryQuerySchema.safeParse({
      symbol: rawSymbol,
      range: rawRange,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { symbol, range } = validation.data;
    const provider = getHistoricalDataProvider();
    const candles = await provider.getHistoricalCandles(symbol, range);

    const isIntraday = range === '1D' || range === '1W';
    const cacheHeader = isIntraday
      ? 'public, s-maxage=60, stale-while-revalidate=120'
      : 'public, s-maxage=3600, stale-while-revalidate=7200';

    return NextResponse.json(
      {
        symbol: normalizeYahooSymbol(symbol),
        range,
        data: candles,
        count: candles.length,
        source: 'Yahoo Finance',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': cacheHeader,
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown historical data provider error';
    const isNotFound = message.includes('404') || message.includes('not found');

    return NextResponse.json(
      {
        error: isNotFound ? 'Symbol not found on historical provider' : 'Unable to load historical chart data',
        message,
      },
      { status: isNotFound ? 404 : 503 }
    );
  }
}
