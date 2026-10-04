import { NextResponse } from 'next/server';
import { getMarketDataProvider } from '@/lib/providers/market';

export async function GET() {
  try {
    const provider = getMarketDataProvider();
    const symbols = await provider.getSymbols();

    return NextResponse.json({ data: symbols }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown provider error';
    return NextResponse.json(
      {
        error: 'Symbols service is temporarily unavailable',
        message,
      },
      { status: 503 }
    );
  }
}
