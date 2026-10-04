'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  CrosshairMode,
  LineStyle,
  ColorType,
  Time,
} from 'lightweight-charts';
import { useTheme } from 'next-themes';
import { HistoricalCandle } from '@/types/market';
import { normalizeChartData } from '@/lib/providers/historical';
import { ChartControls, ChartType, Timeframe } from './chart-controls';
import { ChartPlaceholder } from './chart-placeholder';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface StockChartProps {
  symbol: string;
  candles?: HistoricalCandle[];
  height?: number;
}

export function StockChart({ symbol, candles = [], height = 400 }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [isPercentageMode, setIsPercentageMode] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [hoverData, setHoverData] = useState<{
    time?: string | number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
  } | null>(null);

  const hasHistoricalData = Array.isArray(candles) && candles.length > 0;

  // Initialize and update chart
  useEffect(() => {
    if (!containerRef.current || !hasHistoricalData) return;

    // Clean up previous instance
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = containerRef.current;
    const bgCol = isDark ? '#141824' : '#ffffff';
    const textCol = isDark ? '#94a3b8' : '#475569';
    const gridCol = isDark ? '#1e2436' : '#f1f5f9';
    const borderCol = isDark ? '#27314a' : '#e2e8f0';

    const chart = createChart(container, {
      height,
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: bgCol },
        textColor: textCol,
      },
      grid: {
        vertLines: { color: gridCol },
        horzLines: { color: gridCol },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: isDark ? '#475569' : '#94a3b8',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: isDark ? '#1e293b' : '#f8fafc',
        },
        horzLine: {
          color: isDark ? '#475569' : '#94a3b8',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: isDark ? '#1e293b' : '#f8fafc',
        },
      },
      rightPriceScale: {
        borderColor: borderCol,
        mode: isPercentageMode ? 1 : 0, // 0 = Normal, 1 = Percentage
      },
      timeScale: {
        borderColor: borderCol,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;
    const normalized = normalizeChartData(candles);

    // Create Main Series using v5 unified chart.addSeries(Constructor, options)
    if (chartType === 'candlestick') {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
      });
      candleSeries.setData(normalized.candlesticks as any);
      seriesRef.current = candleSeries;
    } else if (chartType === 'line') {
      const lineSeries = chart.addSeries(LineSeries, {
        color: '#3b82f6',
        lineWidth: 2,
      });
      lineSeries.setData(normalized.line as any);
      seriesRef.current = lineSeries;
    } else if (chartType === 'area') {
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: '#3b82f6',
        topColor: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)',
        bottomColor: 'rgba(59, 130, 246, 0.0)',
        lineWidth: 2,
      });
      areaSeries.setData(normalized.area as any);
      seriesRef.current = areaSeries;
    }

    // Volume Series
    if (showVolume && normalized.volume.length > 0) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: '', // overlay on price scale
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8, // bottom 20%
          bottom: 0,
        },
      });
      volumeSeries.setData(normalized.volume as any);
      volumeSeriesRef.current = volumeSeries;
    }

    // Crosshair hover subscription
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData || !seriesRef.current) {
        setHoverData(null);
        return;
      }

      const pointData = param.seriesData.get(seriesRef.current);
      if (pointData && typeof pointData === 'object') {
        const timeVal = param.time as Time;
        const o = 'open' in pointData ? (pointData.open as number) : undefined;
        const h = 'high' in pointData ? (pointData.high as number) : undefined;
        const l = 'low' in pointData ? (pointData.low as number) : undefined;
        const c = 'close' in pointData ? (pointData.close as number) : ('value' in pointData ? (pointData.value as number) : undefined);

        let vol: number | undefined;
        if (volumeSeriesRef.current) {
          const vData = param.seriesData.get(volumeSeriesRef.current);
          if (vData && typeof vData === 'object' && 'value' in vData) {
            vol = vData.value as number;
          }
        }

        setHoverData({
          time: String(timeVal),
          open: o,
          high: h,
          low: l,
          close: c,
          volume: vol,
        });
      }
    });

    chart.timeScale().fitContent();

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles, chartType, isDark, isPercentageMode, showVolume, height, hasHistoricalData]);

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm flex flex-col">
      {/* Controls Bar */}
      <ChartControls
        chartType={chartType}
        onChartTypeChange={setChartType}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        hasHistoricalData={hasHistoricalData}
        isPercentageMode={isPercentageMode}
        onTogglePercentageMode={() => setIsPercentageMode(!isPercentageMode)}
        showVolume={showVolume}
        onToggleVolume={() => setShowVolume(!showVolume)}
        onResetZoom={handleResetZoom}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Main Chart Body */}
      {hasHistoricalData ? (
        <div className="relative">
          {/* Hover Crosshair Legend Bar */}
          {hoverData && (
            <div className="absolute top-2 left-3 z-10 bg-card/80 backdrop-blur-xs border px-2 py-1 rounded text-[11px] font-mono flex flex-wrap gap-2 text-muted-foreground shadow-xs pointer-events-none">
              {hoverData.open !== undefined && (
                <span>O: <strong className="text-foreground">{hoverData.open.toFixed(2)}</strong></span>
              )}
              {hoverData.high !== undefined && (
                <span>H: <strong className="text-gain">{hoverData.high.toFixed(2)}</strong></span>
              )}
              {hoverData.low !== undefined && (
                <span>L: <strong className="text-loss">{hoverData.low.toFixed(2)}</strong></span>
              )}
              {hoverData.close !== undefined && (
                <span>C: <strong className="text-foreground">{hoverData.close.toFixed(2)}</strong></span>
              )}
              {hoverData.volume !== undefined && (
                <span>Vol: <strong className="text-foreground">{hoverData.volume.toLocaleString('en-IN')}</strong></span>
              )}
            </div>
          )}
          <div ref={containerRef} className="w-full" style={{ height }} />
        </div>
      ) : (
        <ChartPlaceholder symbol={symbol} />
      )}

      {/* Footer Attribution */}
      <div className="px-4 py-2 border-t bg-muted/20 text-[11px] text-muted-foreground flex items-center justify-between">
        <span className="font-mono">{symbol} • Visualizer</span>
        <div className="flex items-center gap-1">
          <span>Charts powered by</span>
          <Link
            href="https://www.tradingview.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-0.5 font-medium"
          >
            TradingView
            <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
