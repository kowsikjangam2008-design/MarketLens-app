import { NextRequest, NextResponse } from 'next/server';
import { getMarketDataProvider } from '@/lib/providers/market';
import { z } from 'zod';

const SymbolQuerySchema = z.object({
  symbol: z
    .string()
    .min(1, 'Symbol is required')
    .max(30, 'Symbol too long')
    .regex(/^[A-Za-z0-9_.\-&]+$/, 'Invalid symbol format'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSymbol = searchParams.get('symbol');

    const validation = SymbolQuerySchema.safeParse({ symbol: rawSymbol });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid symbol parameter', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const provider = getMarketDataProvider();
    const quote = await provider.getStockQuote(validation.data.symbol);

    return NextResponse.json({ data: quote }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown provider error';
    const isNotFound = message.includes('404') || message.includes('not found');
    
    return NextResponse.json(
      {
        error: isNotFound ? 'Stock symbol not found' : 'Live market data is temporarily unavailable',
        message,
      },
      { status: isNotFound ? 404 : 503 }
    );
  }
}
