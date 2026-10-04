import { NextRequest, NextResponse } from 'next/server';
import { getMarketDataProvider } from '@/lib/providers/market';
import { z } from 'zod';

const BatchQuerySchema = z.object({
  symbols: z.string().min(1, 'At least one symbol is required'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSymbols = searchParams.get('symbols');

    const validation = BatchQuerySchema.safeParse({ symbols: rawSymbols });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid symbols parameter', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const symbolList = validation.data.symbols
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && /^[A-Za-z0-9_.\-&]+$/.test(s));

    if (symbolList.length === 0) {
      return NextResponse.json({ error: 'No valid symbols provided' }, { status: 400 });
    }

    if (symbolList.length > 60) {
      return NextResponse.json(
        { error: 'Cannot request more than 60 symbols in a single batch' },
        { status: 400 }
      );
    }

    const provider = getMarketDataProvider();
    const quotes = await provider.getBatchQuotes(symbolList);

    return NextResponse.json({ data: quotes }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown provider error';
    return NextResponse.json(
      {
        error: 'Live market data is temporarily unavailable',
        message,
      },
      { status: 503 }
    );
  }
}
