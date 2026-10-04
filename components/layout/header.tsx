'use client';

import { Search, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useMarketRefresh } from '@/hooks/use-market-refresh';
import Link from 'next/link';

interface HeaderProps {
  onOpenSearch: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const { refreshAll, isRefreshing, formattedLastUpdated, hasData } = useMarketRefresh();

  return (
    <header className="h-16 border-b bg-card/40 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Brand & Search Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Link href="/" className="md:hidden flex items-center gap-2 mr-1">
          <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="font-bold text-sm tracking-tight">MarketLens</span>
        </Link>

        {/* Global Search Button / Trigger */}
        <Button
          variant="outline"
          onClick={onOpenSearch}
          className="h-9 w-full max-w-xs justify-between text-muted-foreground text-xs font-normal border-input bg-background/50 hover:bg-muted/50 px-3"
          aria-label="Search Indian stocks (Ctrl+K or Cmd+K)"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="truncate">Search stocks, e.g. RELIANCE...</span>
          </span>
          <kbd className="hidden sm:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Refresh button & status */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground font-mono">
          {hasData && formattedLastUpdated ? (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span>Provider data • Updated {formattedLastUpdated}</span>
            </>
          ) : (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500/80" aria-hidden="true" />
              <span>Data unavailable</span>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => refreshAll()}
          disabled={isRefreshing}
          aria-label="Refresh market data"
          title={hasData && formattedLastUpdated ? `Refresh live data (Last updated: ${formattedLastUpdated})` : 'Refresh market data (Data unavailable)'}
          className="h-8 w-8 sm:h-9 sm:w-9"
        >
          <RefreshCw
            className={`h-4 w-4 text-muted-foreground ${isRefreshing ? 'animate-spin text-primary' : ''}`}
            aria-hidden="true"
          />
        </Button>

        {/* Mode Toggle */}
        <div className="hidden sm:block">
          <ModeToggle />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
