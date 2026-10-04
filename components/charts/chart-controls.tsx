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
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ChartType = 'candlestick' | 'line' | 'area';
export type Timeframe = '1D' | '1W' | '1M' | '6M' | '1Y';

interface ChartControlsProps {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  hasHistoricalData: boolean;
  isPercentageMode: boolean;
  onTogglePercentageMode: () => void;
  showVolume: boolean;
  onToggleVolume: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
}

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '6M', '1Y'];

export function ChartControls({
  chartType,
  onChartTypeChange,
  timeframe,
  onTimeframeChange,
  hasHistoricalData,
  isPercentageMode,
  onTogglePercentageMode,
  showVolume,
  onToggleVolume,
  onResetZoom,
  onToggleFullscreen,
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

        {/* Timeframe Selector (Disabled when historical data is unavailable) */}
        <div
          className="flex items-center rounded-lg border bg-muted/30 p-0.5"
          role="group"
          aria-label="Timeframe selector"
          title={!hasHistoricalData ? 'Timeframes disabled: historical OHLC data is not supported by current provider' : undefined}
        >
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'secondary' : 'ghost'}
              size="sm"
              disabled={!hasHistoricalData}
              onClick={() => onTimeframeChange(tf)}
              className={cn(
                'h-7 px-2 text-xs font-mono font-medium',
                !hasHistoricalData && 'opacity-40 cursor-not-allowed'
              )}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      {/* Right: Tools & Toggles */}
      <div className="flex items-center gap-1">
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
