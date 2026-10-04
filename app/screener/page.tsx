'use client';

import { useState } from 'react';
import { useBatchQuotes } from '@/hooks/use-batch-quotes';
import { TRACKED_SYMBOLS, TRACKED_UNIVERSE } from '@/config/market-universe';
import { ScreenerFilters, ScreenerFilterState } from '@/components/screener/screener-filters';
import { StockTable } from '@/components/market/stock-table';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const INITIAL_FILTERS: ScreenerFilterState = {
  minPrice: '',
  maxPrice: '',
  minChangePercent: '',
  maxChangePercent: '',
  minVolume: '',
  maxPe: '',
  sector: '',
};

export default function ScreenerPage() {
  const { data: quotes, isLoading, isError, error, refetch } = useBatchQuotes(TRACKED_SYMBOLS);
  const [filters, setFilters] = useState<ScreenerFilterState>(INITIAL_FILTERS);

  const availableSectors = Array.from(new Set(TRACKED_UNIVERSE.map((s) => s.sector))).sort();

  const handleFilterChange = (key: keyof ScreenerFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Filter quotes strictly against available fields
  const filteredQuotes = (quotes || []).filter((q) => {
    // Price filter
    if (filters.minPrice !== '' && q.price !== null) {
      if (q.price < parseFloat(filters.minPrice)) return false;
    }
    if (filters.maxPrice !== '' && q.price !== null) {
      if (q.price > parseFloat(filters.maxPrice)) return false;
    }

    // Change % filter
    if (filters.minChangePercent !== '' && q.changePercent !== null) {
      if (q.changePercent < parseFloat(filters.minChangePercent)) return false;
    }
    if (filters.maxChangePercent !== '' && q.changePercent !== null) {
      if (q.changePercent > parseFloat(filters.maxChangePercent)) return false;
    }

    // Volume filter
    if (filters.minVolume !== '' && q.volume !== null) {
      if (q.volume < parseFloat(filters.minVolume)) return false;
    }

    // P/E filter
    if (filters.maxPe !== '' && q.pe !== null) {
      if (q.pe > parseFloat(filters.maxPe)) return false;
    }

    // Sector filter
    if (filters.sector !== '') {
      const qSector = q.sector || TRACKED_UNIVERSE.find((u) => u.symbol === q.symbol)?.sector;
      if (!qSector || qSector.toLowerCase() !== filters.sector.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 space-y-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Stock Screener</h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Filter the Indian tracked universe using actual live market data, valuation multiples, and volume metrics.
        </p>
      </div>

      {/* Filter Component */}
      <ScreenerFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        availableSectors={availableSectors}
      />

      {/* Results Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight">Screening Results</h2>
          <Badge variant="outline" className="font-mono text-xs">
            {filteredQuotes.length} Matches Found
          </Badge>
        </div>

        {isLoading ? (
          <LoadingState message="Evaluating screener filters against live batch quotes..." />
        ) : isError ? (
          <ErrorState
            title="Screener data unavailable"
            message={error?.message || 'Failed to fetch batch quotes for screening.'}
            onRetry={refetch}
          />
        ) : filteredQuotes.length === 0 ? (
          <div className="p-8 text-center border rounded-xl bg-card/30 text-sm text-muted-foreground">
            No stocks matched your active filter criteria. Try broadening your price or P/E bounds.
          </div>
        ) : (
          <StockTable quotes={filteredQuotes} showWatchlistAction={true} />
        )}
      </div>
    </div>
  );
}
