import { NextRequest, NextResponse } from 'next/server';
import { execute0xrammRoute } from '@/lib/providers/market/zero-ramm-engine';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const pathname = `/${pathSegments.join('/')}`;
    const url = new URL(request.url);
    const search = url.search;
    const fullPathWithQuery = `${pathname}${search}`;

    const result = await execute0xrammRoute(fullPathWithQuery);
    const statusCode = result.status === 'error' ? 400 : 200;

    return NextResponse.json(result, {
      status: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal 0xramm engine error';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
