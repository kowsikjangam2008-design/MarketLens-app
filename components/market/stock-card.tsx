'use client';

import Link from 'next/link';
import { StockQuote } from '@/types/market';
import { Card } from '@/components/ui/card';
import { PriceDisplay } from './price-display';
import { Badge } from '@/components/ui/badge';
import { Bookmark } from 'lucide-react';
import { useWatchlistStore } from '@/hooks/use-watchlist';
import { Button } from '@/components/ui/button';

interface StockCardProps {
  quote: StockQuote;
  showWatchlistAction?: boolean;
}

export function StockCard({ quote, showWatchlistAction = true }: StockCardProps) {
  const { isInWatchlist, addSymbol, removeSymbol } = useWatchlistStore();
  const bookmarked = isInWatchlist(quote.symbol);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarked) {
      removeSymbol(quote.symbol);
    } else {
      addSymbol(quote.symbol);
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-colors group relative overflow-hidden bg-card/70">
      <Link href={`/stocks/${encodeURIComponent(quote.symbol)}`} className="block p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors">
                {quote.symbol}
              </span>
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                {quote.exchange || 'NSE'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5" title={quote.name}>
              {quote.name}
            </p>
          </div>

          {showWatchlistAction && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleWatchlist}
              className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0"
              aria-label={bookmarked ? `Remove ${quote.symbol} from watchlist` : `Add ${quote.symbol} to watchlist`}
              title={bookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark
                className={`h-4 w-4 ${bookmarked ? 'fill-primary text-primary' : ''}`}
                aria-hidden="true"
              />
            </Button>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
          <PriceDisplay
            price={quote.price}
            change={quote.change}
            changePercent={quote.changePercent}
            size="sm"
          />

          {quote.volume !== null && quote.volume > 0 && (
            <span className="text-[10px] text-muted-foreground tabular-nums">
              Vol: {quote.volume.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </Link>
    </Card>
  );
}
