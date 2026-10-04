'use client';

import { useBatchQuotes } from '@/hooks/use-batch-quotes';
import { DEFAULT_HOMEPAGE_SYMBOLS, TRACKED_SYMBOLS } from '@/config/market-universe';
import { MarketOverview } from '@/components/market/market-overview';
import { StockCard } from '@/components/market/stock-card';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import { FINANCIAL_TERMS } from '@/lib/finance/terms';
import { FinanceTermDialog } from '@/components/finance/finance-term-dialog';
import { useState } from 'react';
import { FinancialTermDefinition } from '@/lib/finance/terms';

export default function HomePage() {
  // Fetch quotes for the tracked universe (50 symbols) in one batch
  const { data: allQuotes, isLoading, isError, error, refetch, dataUpdatedAt } = useBatchQuotes(
    TRACKED_SYMBOLS.slice(0, 30) // Request 30 major stocks for the overview batch
  );

  const [selectedTerm, setSelectedTerm] = useState<FinancialTermDefinition | null>(null);

  const featuredQuotes = (allQuotes || []).filter((q) =>
    DEFAULT_HOMEPAGE_SYMBOLS.includes(q.symbol)
  );

  const sampleTerms = [
    FINANCIAL_TERMS.market_cap,
    FINANCIAL_TERMS.pe,
    FINANCIAL_TERMS.volume,
    FINANCIAL_TERMS.rsi,
  ].filter(Boolean) as FinancialTermDefinition[];

  return (
    <div className="space-y-8">
      {/* Hero Intro */}
      <section className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Real-time Indian Market Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          What is happening in the Indian market?
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
          Clean, objective market intelligence for NSE & BSE stocks. Powered by validated live provider data with zero synthetic ticks or fabricated candles.
        </p>
      </section>

      {/* Main Content States */}
      {isLoading ? (
        <LoadingState message="Connecting to 0xramm Indian Stock Market API and loading market overview..." />
      ) : isError ? (
        <ErrorState
          title="Market data temporarily unavailable"
          message={error?.message || 'Failed to fetch quotes from upstream provider.'}
          onRetry={refetch}
        />
      ) : (
        <>
          {/* Market Overview & Breadth */}
          <section aria-labelledby="market-overview-heading">
            <h2 id="market-overview-heading" className="sr-only">Market Overview</h2>
            <MarketOverview
              quotes={allQuotes || []}
              lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN') : null}
            />
          </section>

          {/* Major Indian Stocks Grid */}
          <section aria-labelledby="major-stocks-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="major-stocks-heading" className="text-lg font-bold tracking-tight">
                  Major Indian Stocks
                </h2>
                <p className="text-xs text-muted-foreground">
                  Key benchmark constituents from the NIFTY 50 tracked universe
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
                <Link href="/markets">
                  View All Markets <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {featuredQuotes.map((quote) => (
                <StockCard key={quote.symbol} quote={quote} />
              ))}
            </div>
          </section>

          {/* Market Learning & Terminology Cards */}
          <section aria-labelledby="learning-heading" className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="learning-heading" className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
                  Financial Literacy & Market Concepts
                </h2>
                <p className="text-xs text-muted-foreground">
                  Understand core metrics to interpret stock movements with confidence
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
                <Link href="/learn">
                  Explore Full Glossary <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {sampleTerms.map((term) => (
                <Card
                  key={term.id}
                  className="bg-card/50 hover:bg-card hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedTerm(term)}
                >
                  <CardHeader className="p-4 pb-2">
                    <span className="text-[10px] uppercase font-mono text-primary font-semibold">
                      {term.category}
                    </span>
                    <CardTitle className="text-sm font-bold text-foreground">
                      {term.term}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {term.shortDefinition}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Term Dialog when clicked */}
      {selectedTerm && (
        <FinanceTermDialog
          term={selectedTerm}
          isOpen={!!selectedTerm}
          onOpenChange={(open) => !open && setSelectedTerm(null)}
        />
      )}
    </div>
  );
}
