import { NextResponse } from 'next/server';
import { handleHome } from '@/lib/providers/market/zero-ramm-engine';

export async function GET() {
  const result = handleHome();
  return NextResponse.json(result, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
}
