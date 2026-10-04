'use client';

import { StockQuote, HistoricalCandle } from '@/types/market';
import { PriceDisplay } from './price-display';
import { DataField } from '@/components/ui/data-field';
import { StockChartWrapper } from '@/components/charts/chart-wrapper';
import { SignalPanel } from './signal-panel';
import { analyzeStockSignals } from '@/lib/signals/analyzer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, Clock, Share2, Building2 } from 'lucide-react';
import { useWatchlistStore } from '@/hooks/use-watchlist';
import { StaleState } from '@/components/ui/stale-state';
import { useState } from 'react';

interface StockDetailProps {
  quote: StockQuote;
}

export function StockDetail({ quote }: StockDetailProps) {
  const { isInWatchlist, addSymbol, removeSymbol } = useWatchlistStore();
  const bookmarked = isInWatchlist(quote.symbol);
  const [copied, setCopied] = useState(false);
  const [historicalCandles, setHistoricalCandles] = useState<HistoricalCandle[] | null>(null);

  const signals = analyzeStockSignals(quote, historicalCandles);

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedMarketCap = quote.marketCap !== null && quote.marketCap > 0
    ? `₹${(quote.marketCap / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`
    : null;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 p-5 rounded-2xl border">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {quote.symbol}
            </h1>
            <Badge variant="outline" className="text-xs font-medium">
              {quote.exchange || 'NSE'}
            </Badge>
            {quote.sector && (
              <Badge variant="secondary" className="text-xs">
                {quote.sector}
              </Badge>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
            <span>{quote.name}</span>
          </p>
        </div>

        {/* Price & Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-left md:text-right">
            <PriceDisplay
              price={quote.price}
              change={quote.change}
              changePercent={quote.changePercent}
              size="xl"
            />
            <div className="mt-1">
              <StaleState lastUpdated={quote.lastUpdated} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={bookmarked ? 'default' : 'outline'}
              size="sm"
              onClick={() => (bookmarked ? removeSymbol(quote.symbol) : addSymbol(quote.symbol))}
              className="gap-1.5 text-xs h-9"
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} aria-hidden="true" />
              {bookmarked ? 'Saved' : 'Watchlist'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="h-9 w-9"
              aria-label="Copy stock page link"
              title="Copy stock page link"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
            </Button>
            {copied && <span className="text-xs text-gain animate-fade-in">Link copied!</span>}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <section aria-labelledby="chart-heading">
        <h2 id="chart-heading" className="sr-only">Price Chart</h2>
        <StockChartWrapper symbol={quote.symbol} onCandlesLoaded={setHistoricalCandles} height={420} />
      </section>

      {/* Market Statistics & Key Fields Grid */}
      <section aria-labelledby="stats-heading">
        <Card>
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle id="stats-heading" className="text-base sm:text-lg">Key Stock Data & Metrics</CardTitle>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                0xramm Verified Data
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-5 gap-x-4">
              <DataField
                label="Last Traded Price"
                termKey="ltp"
                value={quote.price !== null ? `₹${quote.price.toFixed(2)}` : null}
              />
              <DataField
                label="Day Range"
                termKey="ohlc"
                value={
                  quote.low !== null && quote.high !== null
                    ? `₹${quote.low.toFixed(2)} - ₹${quote.high.toFixed(2)}`
                    : null
                }
              />
              <DataField
                label="Open Price"
                termKey="ohlc"
                value={quote.open !== null ? `₹${quote.open.toFixed(2)}` : null}
              />
              <DataField
                label="Previous Close"
                termKey="price_change"
                value={quote.previousClose !== null ? `₹${quote.previousClose.toFixed(2)}` : null}
              />
              <DataField
                label="Session Volume"
                termKey="volume"
                value={quote.volume !== null ? quote.volume.toLocaleString('en-IN') : null}
              />
              <DataField
                label="Market Cap"
                termKey="market_cap"
                value={formattedMarketCap}
              />
              <DataField
                label="Price / Earnings (P/E)"
                termKey="pe"
                value={quote.pe !== null ? quote.pe.toFixed(2) : null}
              />
              <DataField
                label="Earnings Per Share (EPS)"
                termKey="eps"
                value={quote.eps !== null ? `₹${quote.eps.toFixed(2)}` : null}
              />
              <DataField
                label="Dividend Yield"
                termKey="dividend_yield"
                value={quote.dividendYield !== null ? `${(quote.dividendYield * 100).toFixed(2)}%` : null}
              />
              <DataField
                label="52-Week High"
                termKey="fifty_two_week_high"
                value={quote.fiftyTwoWeekHigh !== null ? `₹${quote.fiftyTwoWeekHigh.toFixed(2)}` : null}
              />
              <DataField
                label="52-Week Low"
                termKey="fifty_two_week_low"
                value={quote.fiftyTwoWeekLow !== null ? `₹${quote.fiftyTwoWeekLow.toFixed(2)}` : null}
              />
              <DataField
                label="Sector"
                termKey="sector"
                value={quote.sector}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Signals Analysis Section */}
      <section aria-labelledby="signals-heading">
        <h2 id="signals-heading" className="sr-only">Signals Analysis</h2>
        <SignalPanel signals={signals} />
      </section>
    </div>
  );
}
