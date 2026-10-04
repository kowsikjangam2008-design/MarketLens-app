'use client';

import { useState } from 'react';
import { StockQuote } from '@/types/market';
import { StockCard } from './stock-card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Activity, Info } from 'lucide-react';

interface TopMoversProps {
  quotes: StockQuote[];
}

export function TopMovers({ quotes }: TopMoversProps) {
  const [tab, setTab] = useState<'gainers' | 'losers' | 'volume'>('gainers');

  // Filter only quotes that have real changePercent
  const validQuotes = quotes.filter(
    (q) => q.changePercent !== null && typeof q.changePercent === 'number'
  );

  const gainers = [...validQuotes]
    .filter((q) => (q.changePercent ?? 0) > 0)
    .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))
    .slice(0, 4);

  const losers = [...validQuotes]
    .filter((q) => (q.changePercent ?? 0) < 0)
    .sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0))
    .slice(0, 4);

  const mostActive = [...quotes]
    .filter((q) => q.volume !== null && (q.volume ?? 0) > 0)
    .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))
    .slice(0, 4);

  const activeList = tab === 'gainers' ? gainers : tab === 'losers' ? losers : mostActive;

  return (
    <div className="space-y-4">
      {/* Tab Switcher & Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg">
          <Button
            variant={tab === 'gainers' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTab('gainers')}
            className="text-xs h-7 gap-1.5"
          >
            <TrendingUp className="h-3.5 w-3.5 text-gain" aria-hidden="true" />
            Top Gainers
          </Button>
          <Button
            variant={tab === 'losers' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTab('losers')}
            className="text-xs h-7 gap-1.5"
          >
            <TrendingDown className="h-3.5 w-3.5 text-loss" aria-hidden="true" />
            Top Losers
          </Button>
          <Button
            variant={tab === 'volume' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTab('volume')}
            className="text-xs h-7 gap-1.5"
          >
            <Activity className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Market Activity (Volume)
          </Button>
        </div>

        {/* Mandatory Transparency Label */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>Calculated from MarketLens tracked universe (50 NIFTY stocks)</span>
        </div>
      </div>

      {/* Grid of Cards */}
      {activeList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeList.map((quote) => (
            <StockCard key={quote.symbol} quote={quote} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-muted-foreground border rounded-xl bg-card/40">
          No mover data currently available in this category.
        </div>
      )}
    </div>
  );
}
