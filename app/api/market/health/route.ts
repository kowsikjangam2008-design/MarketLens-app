import { NextResponse } from 'next/server';
import { getMarketDataProvider } from '@/lib/providers/market';

export async function GET() {
  const provider = getMarketDataProvider();
  
  return NextResponse.json({
    status: 'ok',
    provider: provider.name,
    capabilities: provider.capabilities,
    timestamp: new Date().toISOString(),
    market: 'India (NSE / BSE)',
    notice: 'MarketLens is a personal, read-only market data dashboard. Not exchange-direct.',
  });
}
