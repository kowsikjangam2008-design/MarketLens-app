'use client';

import { useBatchQuotes } from '@/hooks/use-batch-quotes';
import { StockQuote } from '@/types/market';
import { TRACKED_SYMBOLS } from '@/config/market-universe';
import { StockCard } from '@/components/market/stock-card';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { UnavailableState } from '@/components/ui/unavailable-state';
import { Badge } from '@/components/ui/badge';
import { Compass, Landmark, Cpu, Zap, HeartPulse, Building } from 'lucide-react';

const BASKETS = [
  {
    id: 'financials',
    title: 'Banking & Financial Leaders',
    description: 'Premier private and public banking institutions and financial service providers',
    icon: Landmark,
    symbols: ['HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'KOTAKBANK.NS', 'BAJFINANCE.NS'],
  },
  {
    id: 'tech',
    title: 'Technology & Digital Giants',
    description: 'Global IT service leaders and software exporters',
    icon: Cpu,
    symbols: ['TCS.NS', 'INFY.NS', 'HCLTECH.NS', 'WIPRO.NS', 'TECHM.NS'],
  },
  {
    id: 'energy',
    title: 'Energy & Infrastructure Core',
    description: 'Heavy industries, power transmission, and oil refining champions',
    icon: Zap,
    symbols: ['RELIANCE.NS', 'NTPC.NS', 'ONGC.NS', 'POWERGRID.NS', 'COALINDIA.NS'],
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Pharma Innovators',
    description: 'Formulation exporters, active ingredient developers, and hospital networks',
    icon: HeartPulse,
    symbols: ['SUNPHARMA.NS', 'CIPLA.NS', 'DRREDDY.NS', 'DIVISLAB.NS', 'APOLLOHOSP.NS'],
  },
];

export default function DiscoverPage() {
  const { data: quotes, isLoading, isError, error, refetch } = useBatchQuotes(TRACKED_SYMBOLS.slice(0, 30));

  const quoteMap = new Map((quotes || []).map((q) => [q.symbol, q]));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-4 space-y-1">
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Discover Indian Equities</h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Explore curated thematic groups and industry baskets across the Indian corporate landscape.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Loading discovery baskets and batch quotes..." />
      ) : isError ? (
        <ErrorState
          title="Discovery data unavailable"
          message={error?.message || 'Failed to fetch batch quotes.'}
          onRetry={refetch}
        />
      ) : (
        <div className="space-y-8">
          {/* Baskets */}
          {BASKETS.map((basket) => {
            const Icon = basket.icon;
            const basketQuotes: StockQuote[] = basket.symbols
              .map((s) => quoteMap.get(s))
              .filter((q): q is StockQuote => Boolean(q));

            return (
              <section key={basket.id} className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold tracking-tight">{basket.title}</h2>
                      <p className="text-xs text-muted-foreground">{basket.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-medium shrink-0">
                    {basket.symbols.length} Stocks
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {basketQuotes.map((quote) => (
                    <StockCard key={quote.symbol} quote={quote} />
                  ))}
                </div>
              </section>
            );
          })}

          {/* IPO Data Section (Explicitly marked as unavailable from current provider) */}
          <section aria-labelledby="ipo-heading" className="space-y-3 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="ipo-heading" className="text-base sm:text-lg font-bold tracking-tight">
                  Initial Public Offerings (IPO)
                </h2>
                <p className="text-xs text-muted-foreground">
                  Upcoming, open, and recently listed Indian public issues
                </p>
              </div>
              <Badge variant="unavailable">Provider Limitation</Badge>
            </div>

            <UnavailableState
              title="IPO data is not available from the current provider."
              reason="The 0xramm Indian Stock Market API currently only supports quote, search, and symbol endpoints. MarketLens refuses to fabricate fake IPO listings or simulated subscription figures."
            />
          </section>
        </div>
      )}
    </div>
  );
}
