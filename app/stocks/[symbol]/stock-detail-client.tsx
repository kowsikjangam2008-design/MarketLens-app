'use client';

import { useStockQuote } from '@/hooks/use-stock-quote';
import { StockDetail } from '@/components/market/stock-detail';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface StockDetailPageClientProps {
  symbol: string;
}

export function StockDetailPageClient({ symbol }: StockDetailPageClientProps) {
  const { data: quote, isLoading, isError, error, refetch } = useStockQuote(symbol);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/markets">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Markets
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message={`Fetching quote and financials for ${symbol} from 0xramm API...`} />
      ) : isError ? (
        <ErrorState
          title={`Unable to load data for ${symbol}`}
          message={error?.message || 'Stock ticker could not be retrieved from provider.'}
          onRetry={refetch}
        />
      ) : quote ? (
        <StockDetail quote={quote} />
      ) : (
        <ErrorState
          title="Stock not found"
          message={`No market data was returned for ticker "${symbol}". Verify that the symbol uses .NS (for NSE) or .BO (for BSE).`}
          onRetry={refetch}
        />
      )}
    </div>
  );
}
