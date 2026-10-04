'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export interface ScreenerFilterState {
  minPrice: string;
  maxPrice: string;
  minChangePercent: string;
  maxChangePercent: string;
  minVolume: string;
  maxPe: string;
  sector: string;
}

interface ScreenerFiltersProps {
  filters: ScreenerFilterState;
  onFilterChange: (key: keyof ScreenerFilterState, value: string) => void;
  onReset: () => void;
  availableSectors: string[];
}

export function ScreenerFilters({
  filters,
  onFilterChange,
  onReset,
  availableSectors,
}: ScreenerFiltersProps) {
  return (
    <div className="bg-card/70 border rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Screener Filters</h3>
          <p className="text-xs text-muted-foreground">
            Filters only use verified fields reported by the provider.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-7 text-xs gap-1">
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Price Range */}
        <div className="space-y-1.5">
          <label className="font-medium text-muted-foreground">Price Range (₹)</label>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => onFilterChange('minPrice', e.target.value)}
              className="h-8 text-xs tabular-nums"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange('maxPrice', e.target.value)}
              className="h-8 text-xs tabular-nums"
            />
          </div>
        </div>

        {/* Change % */}
        <div className="space-y-1.5">
          <label className="font-medium text-muted-foreground">Change % Range</label>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              placeholder="Min %"
              value={filters.minChangePercent}
              onChange={(e) => onFilterChange('minChangePercent', e.target.value)}
              className="h-8 text-xs tabular-nums"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max %"
              value={filters.maxChangePercent}
              onChange={(e) => onFilterChange('maxChangePercent', e.target.value)}
              className="h-8 text-xs tabular-nums"
            />
          </div>
        </div>

        {/* Min Volume */}
        <div className="space-y-1.5">
          <label className="font-medium text-muted-foreground">Minimum Volume</label>
          <Input
            type="number"
            placeholder="e.g. 100000"
            value={filters.minVolume}
            onChange={(e) => onFilterChange('minVolume', e.target.value)}
            className="h-8 text-xs tabular-nums"
          />
        </div>

        {/* Max P/E */}
        <div className="space-y-1.5">
          <label className="font-medium text-muted-foreground">Max P/E Ratio</label>
          <Input
            type="number"
            placeholder="e.g. 30"
            value={filters.maxPe}
            onChange={(e) => onFilterChange('maxPe', e.target.value)}
            className="h-8 text-xs tabular-nums"
          />
        </div>

        {/* Sector Filter */}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
          <label className="font-medium text-muted-foreground">Sector</label>
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              variant={filters.sector === '' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('sector', '')}
              className="h-7 text-xs"
            >
              All Sectors
            </Button>
            {availableSectors.map((sec) => (
              <Button
                key={sec}
                type="button"
                variant={filters.sector === sec ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => onFilterChange('sector', sec)}
                className="h-7 text-xs"
              >
                {sec}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
