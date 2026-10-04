'use client';

import { useState } from 'react';
import { useWatchlistStore } from '@/hooks/use-watchlist';
import { useBatchQuotes } from '@/hooks/use-batch-quotes';
import { StockTable } from '@/components/market/stock-table';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TRACKED_UNIVERSE } from '@/config/market-universe';
import { Bookmark, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function WatchlistManager() {
  const { symbols, addSymbol, removeSymbol, reorderSymbols } = useWatchlistStore();
  const [newSymbolInput, setNewSymbolInput] = useState('');
  const [isEditingOrder, setIsEditingOrder] = useState(false);

  const { data: quotes, isLoading, isError, error, refetch } = useBatchQuotes(symbols);

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSymbolInput.trim().toUpperCase();
    if (!clean) return;

    // Auto append .NS if user typed just the symbol without exchange
    const finalSymbol = clean.includes('.') ? clean : `${clean}.NS`;
    addSymbol(finalSymbol);
    setNewSymbolInput('');
  };

  const moveSymbol = (index: number, direction: 'up' | 'down') => {
    const newSymbols = [...symbols];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSymbols.length) return;

    const [removed] = newSymbols.splice(index, 1);
    if (removed) {
      newSymbols.splice(targetIndex, 0, removed);
      reorderSymbols(newSymbols);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls & Add stock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 p-4 rounded-xl border">
        <form onSubmit={handleAddSymbol} className="flex items-center gap-2 max-w-sm w-full">
          <Input
            value={newSymbolInput}
            onChange={(e) => setNewSymbolInput(e.target.value)}
            placeholder="Add symbol, e.g. TATASTEEL..."
            className="h-9 text-xs"
          />
          <Button type="submit" size="sm" className="h-9 gap-1 text-xs shrink-0">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add
          </Button>
        </form>

        <div className="flex items-center gap-2">
          {symbols.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingOrder(!isEditingOrder)}
              className="text-xs h-9"
            >
              {isEditingOrder ? 'Done Reordering' : 'Reorder Watchlist'}
            </Button>
          )}
          <Badge variant="outline" className="text-xs h-7 px-2.5 font-medium">
            {symbols.length} Stocks Saved
          </Badge>
        </div>
      </div>

      {/* Reordering Mode Panel */}
      {isEditingOrder && (
        <div className="rounded-xl border bg-muted/30 p-4 space-y-2 animate-fade-in">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Reorder Symbols
          </h4>
          <div className="space-y-1.5">
            {symbols.map((sym, index) => (
              <div
                key={sym}
                className="flex items-center justify-between p-2 rounded-lg bg-card border text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="tabular-nums font-bold text-xs">{index + 1}.</span>
                  <span className="font-semibold text-foreground">{sym}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={index === 0}
                    onClick={() => moveSymbol(index, 'up')}
                    className="h-7 w-7"
                    aria-label={`Move ${sym} up`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={index === symbols.length - 1}
                    onClick={() => moveSymbol(index, 'down')}
                    className="h-7 w-7"
                    aria-label={`Move ${sym} down`}
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSymbol(sym)}
                    className="h-7 w-7 text-loss hover:text-loss"
                    aria-label={`Remove ${sym} from watchlist`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Watchlist Table / Content */}
      {symbols.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 sm:p-12 text-center space-y-4 bg-card/20">
          <Bookmark className="h-10 w-10 text-muted-foreground/40 mx-auto" aria-hidden="true" />
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-semibold text-base">Your Watchlist is Empty</h3>
            <p className="text-xs text-muted-foreground">
              Add stocks you want to track from the suggested list below or search using the bar above.
            </p>
          </div>

          <div className="pt-4 max-w-md mx-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Suggested Stocks to Add
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {TRACKED_UNIVERSE.slice(0, 6).map((item) => (
                <Button
                  key={item.symbol}
                  variant="outline"
                  size="sm"
                  onClick={() => addSymbol(item.symbol)}
                  className="text-xs h-7 gap-1"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  {item.symbol}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : isLoading ? (
        <LoadingState message="Fetching live batch quotes for your watchlist..." />
      ) : isError ? (
        <ErrorState
          title="Watchlist quotes unavailable"
          message={error?.message || 'Failed to fetch batch quotes from 0xramm API.'}
          onRetry={refetch}
        />
      ) : (
        <div className="space-y-2">
          <StockTable quotes={quotes || []} showWatchlistAction={true} />
        </div>
      )}
    </div>
  );
}
