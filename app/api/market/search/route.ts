import { NextRequest, NextResponse } from 'next/server';
import { getMarketDataProvider } from '@/lib/providers/market';
import { z } from 'zod';

const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(50, 'Search query too long'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q');

    const validation = SearchQuerySchema.safeParse({ q: rawQuery });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid search parameter', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const provider = getMarketDataProvider();
    const results = await provider.searchStocks(validation.data.q);

    return NextResponse.json({ data: results }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown provider error';
    return NextResponse.json(
      {
        error: 'Search service is temporarily unavailable',
        message,
      },
      { status: 503 }
    );
  }
}
