'use client';

import { Button } from '@/components/ui/button';
import {
  CandlestickChart,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Maximize2,
  RotateCcw,
  Percent,
  Layers,
  Activity,
  Loader2,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type ChartType = 'candlestick' | 'line' | 'area';
export type Timeframe = '1D' | '1W' | '1M' | '6M' | '1Y';

export const AVAILABLE_INDICATORS = [
  { id: 'sma20', label: 'SMA (20)', color: '#f59e0b' },
  { id: 'sma50', label: 'SMA (50)', color: '#8b5cf6' },
  { id: 'sma200', label: 'SMA (200)', color: '#06b6d4' },
  { id: 'ema20', label: 'EMA (20)', color: '#ec4899' },
  { id: 'bollinger', label: 'Bollinger Bands (20, 2)', color: '#3b82f6' },
] as const;

interface ChartControlsProps {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  hasHistoricalData: boolean;
  isLoading?: boolean;
  isPercentageMode: boolean;
  onTogglePercentageMode: () => void;
  showVolume: boolean;
  onToggleVolume: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
  activeIndicators: string[];
  onToggleIndicator: (id: string) => void;
}

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '6M', '1Y'];

export function ChartControls({
  chartType,
  onChartTypeChange,
  timeframe,
  onTimeframeChange,
  hasHistoricalData,
  isLoading = false,
  isPercentageMode,
  onTogglePercentageMode,
  showVolume,
  onToggleVolume,
  onResetZoom,
  onToggleFullscreen,
  activeIndicators,
  onToggleIndicator,
}: ChartControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b bg-card/60 rounded-t-xl text-xs">
      {/* Left: Chart Type & Timeframe */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type Switcher */}
        <div className="flex items-center rounded-lg border bg-muted/30 p-0.5" role="group" aria-label="Chart style selector">
          <Button
            variant={chartType === 'candlestick' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onChartTypeChange('candlestick')}
            className="h-7 w-7 p-0"
            title="Candlestick Chart"
            aria-label="Candlestick Chart"
          >
            <CandlestickChart className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <Button
            variant={chartType === 'line' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onChartTypeChange('line')}
            className="h-7 w-7 p-0"
            title="Line Chart"
            aria-label="Line Chart"
          >
            <LineChartIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <Button
            variant={chartType === 'area' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onChartTypeChange('area')}
            className="h-7 w-7 p-0"
            title="Area Chart"
            aria-label="Area Chart"
          >
            <AreaChartIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>

        {/* Timeframe Selector (Always enabled for interactive timeframe switching) */}
        <div
          className="flex items-center rounded-lg border bg-muted/30 p-0.5"
          role="group"
          aria-label="Timeframe selector"
        >
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'secondary' : 'ghost'}
              size="sm"
              disabled={isLoading}
              onClick={() => onTimeframeChange(tf)}
              className={cn(
                'h-7 px-2.5 text-xs font-medium transition-colors',
                timeframe === tf && 'bg-primary text-primary-foreground font-semibold shadow-xs'
              )}
            >
              {tf}
            </Button>
          ))}
          {isLoading && (
            <div className="px-1.5 flex items-center text-muted-foreground animate-spin">
              <Loader2 className="h-3 w-3" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      {/* Right: Tools & Indicators & Toggles */}
      <div className="flex items-center gap-1">
        {/* Technical Indicators Dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={activeIndicators.length > 0 ? 'secondary' : 'ghost'}
              size="sm"
              disabled={!hasHistoricalData}
              className="h-7 px-2 text-xs gap-1"
              title="Technical Indicators Overlay"
              aria-label="Technical Indicators"
            >
              <Activity className="h-3 w-3" aria-hidden="true" />
              <span className="hidden sm:inline">Indicators</span>
              {activeIndicators.length > 0 && (
                <span className="ml-0.5 rounded-full bg-primary/20 text-primary text-[10px] px-1 tabular-nums font-semibold">
                  {activeIndicators.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-2 space-y-1">
            <div className="font-semibold text-xs px-2 py-1 text-muted-foreground">Overlay Indicators</div>
            <div className="h-px bg-border my-1" />
            {AVAILABLE_INDICATORS.map((ind) => {
              const active = activeIndicators.includes(ind.id);
              return (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => onToggleIndicator(ind.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors text-left hover:bg-muted',
                    active && 'bg-muted/70 font-medium'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: ind.color }}
                      aria-hidden="true"
                    />
                    <span>{ind.label}</span>
                  </span>
                  {active && <span className="text-primary text-[11px] font-bold">✓</span>}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>

        <Button
          variant={isPercentageMode ? 'secondary' : 'ghost'}
          size="sm"
          disabled={!hasHistoricalData}
          onClick={onTogglePercentageMode}
          className="h-7 px-2 text-xs gap-1"
          title="Toggle Percentage / Currency Mode"
          aria-label="Toggle Percentage Mode"
        >
          <Percent className="h-3 w-3" aria-hidden="true" />
          <span className="hidden sm:inline">Percent</span>
        </Button>

        <Button
          variant={showVolume ? 'secondary' : 'ghost'}
          size="sm"
          disabled={!hasHistoricalData}
          onClick={onToggleVolume}
          className="h-7 px-2 text-xs gap-1"
          title="Toggle Volume Overlay"
          aria-label="Toggle Volume"
        >
          <Layers className="h-3 w-3" aria-hidden="true" />
          <span className="hidden sm:inline">Volume</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={!hasHistoricalData}
          onClick={onResetZoom}
          className="h-7 w-7 p-0"
          title="Reset Zoom"
          aria-label="Reset Zoom"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFullscreen}
          className="h-7 w-7 p-0"
          title="Toggle Fullscreen"
          aria-label="Toggle Fullscreen"
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
