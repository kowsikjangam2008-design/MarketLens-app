'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useStockSearch } from '@/hooks/use-stock-search';
import { TRACKED_UNIVERSE } from '@/config/market-universe';
import { Search, Loader2, ArrowRight, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchCommandProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ isOpen, onOpenChange }: SearchCommandProps) {
  const router = useRouter();
  const { query, setQuery, debouncedQuery, data: results, isLoading, isError } = useStockSearch('', 250);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!isOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onOpenChange]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results, query]);

  const handleSelectSymbol = (symbol: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(`/stocks/${encodeURIComponent(symbol)}`);
  };

  const displayedItems = query.trim().length >= 2
    ? (results || [])
    : TRACKED_UNIVERSE.slice(0, 8);

  const isShowingTracked = query.trim().length < 2;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden border-border bg-card">
        <DialogHeader className="p-3 border-b">
          <DialogTitle className="sr-only">Search Stocks</DialogTitle>
          <div className="flex items-center gap-2 px-1">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company name or ticker (e.g. RELIANCE, TCS)..."
              className="border-0 shadow-none focus-visible:ring-0 text-sm px-1 h-9 bg-transparent"
              autoFocus
            />
            {isLoading && <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />}
          </div>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {isShowingTracked && (
            <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
              Suggested Stocks (Tracked Universe)
            </div>
          )}

          {query.trim().length >= 2 && !isLoading && displayedItems.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {isError ? 'Search request failed. Please check connection.' : `No stocks found matching "${debouncedQuery}".`}
            </div>
          )}

          {displayedItems.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.symbol}
                type="button"
                onClick={() => handleSelectSymbol(item.symbol)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors cursor-pointer',
                  isSelected ? 'bg-muted text-foreground' : 'text-foreground/90 hover:bg-muted/60'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-7 w-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-xs sm:text-sm truncate">{item.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
                      <span>{item.symbol}</span>
                      <span>•</span>
                      <span>{item.exchange}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {'sector' in item && (
                    <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                      {item.sector}
                    </Badge>
                  )}
                  {'price' in item && item.price !== null && typeof item.price === 'number' && (
                    <span className="font-mono text-xs font-semibold">
                      ₹{item.price.toFixed(2)}
                    </span>
                  )}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-4 py-2 border-t bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Search backed by 0xramm Indian Stock Market API</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
