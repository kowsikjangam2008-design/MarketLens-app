'use client';

import { useState } from 'react';
import { useBatchQuotes } from '@/hooks/use-batch-quotes';
import { TRACKED_SYMBOLS, TRACKED_UNIVERSE } from '@/config/market-universe';
import { StockTable } from '@/components/market/stock-table';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ShieldCheck } from 'lucide-react';

export default function MarketsPage() {
  const { data: quotes, isLoading, isError, error, refetch, dataUpdatedAt } = useBatchQuotes(TRACKED_SYMBOLS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('');

  // Extract unique sectors from universe
  const sectors = Array.from(new Set(TRACKED_UNIVERSE.map((s) => s.sector))).sort();

  const filteredQuotes = (quotes || []).filter((q) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      q.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSector =
      !selectedSector ||
      q.sector?.toLowerCase() === selectedSector.toLowerCase() ||
      TRACKED_UNIVERSE.find((u) => u.symbol === q.symbol)?.sector.toLowerCase() ===
        selectedSector.toLowerCase();

    return matchesSearch && matchesSector;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Indian Markets</h1>
            <Badge variant="outline" className="text-xs font-medium">
              Tracked Universe (50)
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time batch quotes for NIFTY 50 benchmark constituents from 0xramm API
          </p>
        </div>

        {dataUpdatedAt && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            <span>Updated: {new Date(dataUpdatedAt).toLocaleTimeString('en-IN')}</span>
          </div>
        )}
      </div>

      {/* Search & Sector Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-card/40 p-4 rounded-xl border">
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" aria-hidden="true" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter symbols or names..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Sector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1">
          <Button
            variant={selectedSector === '' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedSector('')}
            className="h-7 text-xs shrink-0"
          >
            All Sectors
          </Button>
          {sectors.map((sec) => (
            <Button
              key={sec}
              variant={selectedSector === sec ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedSector(sec)}
              className="h-7 text-xs shrink-0"
            >
              {sec}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Table View */}
      {isLoading ? (
        <LoadingState message="Fetching live batch quotes for tracked Indian stocks..." />
      ) : isError ? (
        <ErrorState
          title="Market quotes unavailable"
          message={error?.message || 'Failed to fetch batch quotes from 0xramm API.'}
          onRetry={refetch}
        />
      ) : (
        <div className="space-y-2">
          <StockTable quotes={filteredQuotes} showWatchlistAction={true} />
          <p className="text-[11px] text-muted-foreground text-right pt-2 tabular-nums">
            Showing {filteredQuotes.length} of {quotes?.length || 0} tracked Indian securities
          </p>
        </div>
      )}
    </div>
  );
}
