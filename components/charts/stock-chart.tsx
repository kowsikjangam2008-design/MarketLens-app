'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
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
import { normalizeChartData } from '@/lib/market/chart-normalizer';
import { ChartControls, ChartType, Timeframe, AVAILABLE_INDICATORS } from './chart-controls';
import { ChartPlaceholder } from './chart-placeholder';
import { useHistoricalCandles } from '@/hooks/use-historical-candles';
import {
  calculateSMA,
  calculateEMA,
  calculateBollingerBands,
  calculateRSI,
  calculateMACD,
  calculateATR,
  calculateVWAP,
} from '@/lib/technical-analysis';
import { ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface StockChartProps {
  symbol: string;
  initialTimeframe?: Timeframe;
  height?: number;
  onCandlesLoaded?: (candles: HistoricalCandle[]) => void;
}

export function StockChart({
  symbol,
  initialTimeframe = '1D',
  height = 420,
  onCandlesLoaded,
}: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const indicatorSeriesRefs = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [timeframe, setTimeframe] = useState<Timeframe>(initialTimeframe);
  const [isPercentageMode, setIsPercentageMode] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);
  const [hoverData, setHoverData] = useState<{
    time?: string | number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
  } | null>(null);

  // Fetch real historical candles using TanStack Query hook
  const {
    data: candles = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useHistoricalCandles(symbol, timeframe);

  // Notify parent component when candles update (for signal analysis)
  useEffect(() => {
    if (candles && candles.length > 0 && onCandlesLoaded) {
      onCandlesLoaded(candles);
    }
  }, [candles, onCandlesLoaded]);

  const hasHistoricalData = Array.isArray(candles) && candles.length > 0;

  // Calculate technical indicators
  const indicatorsData = useMemo(() => {
    if (!hasHistoricalData) return null;
    return {
      sma20: calculateSMA(candles, 20),
      sma50: calculateSMA(candles, 50),
      sma200: calculateSMA(candles, 200),
      ema20: calculateEMA(candles, 20),
      bollinger: calculateBollingerBands(candles, 20, 2),
      rsi14: calculateRSI(candles, 14),
      macd: calculateMACD(candles),
      atr: calculateATR(candles, 14),
      vwap: calculateVWAP(candles),
    };
  }, [candles, hasHistoricalData]);

  const handleToggleIndicator = (id: string) => {
    setActiveIndicators((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Initialize and update Lightweight Charts instance
  useEffect(() => {
    if (!containerRef.current || !hasHistoricalData) return;

    // Clean up previous instance
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
      indicatorSeriesRefs.current.clear();
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
        timeVisible: timeframe === '1D' || timeframe === '1W',
        secondsVisible: false,
      },
    });

    chartRef.current = chart;
    const normalized = normalizeChartData(candles);

    // 1. Create Main Series using v5 unified API
    if (chartType === 'candlestick') {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
      });
      candleSeries.setData(normalized.candlesticks as any);
      mainSeriesRef.current = candleSeries;
    } else if (chartType === 'line') {
      const lineSeries = chart.addSeries(LineSeries, {
        color: '#3b82f6',
        lineWidth: 2,
      });
      lineSeries.setData(normalized.line as any);
      mainSeriesRef.current = lineSeries;
    } else if (chartType === 'area') {
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: '#3b82f6',
        topColor: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)',
        bottomColor: 'rgba(59, 130, 246, 0.0)',
        lineWidth: 2,
      });
      areaSeries.setData(normalized.area as any);
      mainSeriesRef.current = areaSeries;
    }

    // 2. Volume Series
    if (showVolume && normalized.volume.length > 0) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: '', // overlay
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

    // 3. Technical Indicator Overlays
    const indMap = new Map<string, ISeriesApi<'Line'>>();

    if (indicatorsData) {
      // SMA 20
      if (activeIndicators.includes('sma20') && indicatorsData.sma20?.values.length) {
        const s = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, title: 'SMA 20' });
        s.setData(indicatorsData.sma20.values as any);
        indMap.set('sma20', s);
      }
      // SMA 50
      if (activeIndicators.includes('sma50') && indicatorsData.sma50?.values.length) {
        const s = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 1, title: 'SMA 50' });
        s.setData(indicatorsData.sma50.values as any);
        indMap.set('sma50', s);
      }
      // SMA 200
      if (activeIndicators.includes('sma200') && indicatorsData.sma200?.values.length) {
        const s = chart.addSeries(LineSeries, { color: '#06b6d4', lineWidth: 1, title: 'SMA 200' });
        s.setData(indicatorsData.sma200.values as any);
        indMap.set('sma200', s);
      }
      // EMA 20
      if (activeIndicators.includes('ema20') && indicatorsData.ema20?.values.length) {
        const s = chart.addSeries(LineSeries, { color: '#ec4899', lineWidth: 1, title: 'EMA 20' });
        s.setData(indicatorsData.ema20.values as any);
        indMap.set('ema20', s);
      }
      // Bollinger Bands (Upper, Lower, Middle)
      if (activeIndicators.includes('bollinger') && indicatorsData.bollinger?.values.length) {
        const upper = chart.addSeries(LineSeries, { color: '#60a5fa', lineWidth: 1, lineStyle: LineStyle.Dotted, title: 'BB Upper' });
        const lower = chart.addSeries(LineSeries, { color: '#60a5fa', lineWidth: 1, lineStyle: LineStyle.Dotted, title: 'BB Lower' });
        const middle = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, title: 'BB Mid' });

        upper.setData(indicatorsData.bollinger.values.map((v) => ({ time: v.time, value: v.value.upper })) as any);
        lower.setData(indicatorsData.bollinger.values.map((v) => ({ time: v.time, value: v.value.lower })) as any);
        middle.setData(indicatorsData.bollinger.values.map((v) => ({ time: v.time, value: v.value.middle })) as any);

        indMap.set('bb_upper', upper);
        indMap.set('bb_lower', lower);
        indMap.set('bb_middle', middle);
      }
    }
    indicatorSeriesRefs.current = indMap;

    // 4. Crosshair hover subscription
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData || !mainSeriesRef.current) {
        setHoverData(null);
        return;
      }

      const pointData = param.seriesData.get(mainSeriesRef.current);
      if (pointData && typeof pointData === 'object') {
        const timeVal = param.time as Time;
        const o = 'open' in pointData ? (pointData.open as number) : undefined;
        const h = 'high' in pointData ? (pointData.high as number) : undefined;
        const l = 'low' in pointData ? (pointData.low as number) : undefined;
        const c = 'close' in pointData
          ? (pointData.close as number)
          : 'value' in pointData
            ? (pointData.value as number)
            : undefined;

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
        mainSeriesRef.current = null;
        volumeSeriesRef.current = null;
        indicatorSeriesRefs.current.clear();
      }
    };
  }, [
    candles,
    chartType,
    timeframe,
    isDark,
    isPercentageMode,
    showVolume,
    activeIndicators,
    height,
    hasHistoricalData,
    indicatorsData,
  ]);

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
        isLoading={isLoading}
        isPercentageMode={isPercentageMode}
        onTogglePercentageMode={() => setIsPercentageMode(!isPercentageMode)}
        showVolume={showVolume}
        onToggleVolume={() => setShowVolume(!showVolume)}
        onResetZoom={handleResetZoom}
        onToggleFullscreen={handleToggleFullscreen}
        activeIndicators={activeIndicators}
        onToggleIndicator={handleToggleIndicator}
      />

      {/* Insufficient Indicator Warning Bar */}
      {activeIndicators.includes('sma200') && (!indicatorsData?.sma200 || indicatorsData.sma200.values.length === 0) && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1.5 text-xs text-amber-500 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>SMA (200) requires at least 200 daily candles. Current range ({timeframe}) contains {candles.length} candles. Switch to 1Y to view SMA 200.</span>
        </div>
      )}

      {/* Main Chart Body */}
      {isLoading && !hasHistoricalData ? (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[360px] space-y-3">
          <Skeleton className="w-full h-8 max-w-md" />
          <Skeleton className="w-full h-64 max-w-xl" />
          <p className="text-xs text-muted-foreground animate-pulse">
            Loading {timeframe} historical chart data from Yahoo Finance for {symbol}...
          </p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[360px] space-y-3">
          <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <h4 className="text-sm font-semibold">Unable to load historical chart data</h4>
          <p className="text-xs text-muted-foreground max-w-md">
            {error?.message || 'Historical data could not be retrieved from Yahoo Finance.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : hasHistoricalData ? (
        <div className="relative">
          {/* Hover Crosshair Legend Bar */}
          {hoverData && (
            <div className="absolute top-2 left-3 z-10 bg-card/85 backdrop-blur-xs border px-2 py-1 rounded text-[11px] tabular-nums flex flex-wrap gap-2 text-muted-foreground shadow-xs pointer-events-none">
              {hoverData.open !== undefined && (
                <span>O: <strong className="text-foreground">₹{hoverData.open.toFixed(2)}</strong></span>
              )}
              {hoverData.high !== undefined && (
                <span>H: <strong className="text-gain">₹{hoverData.high.toFixed(2)}</strong></span>
              )}
              {hoverData.low !== undefined && (
                <span>L: <strong className="text-loss">₹{hoverData.low.toFixed(2)}</strong></span>
              )}
              {hoverData.close !== undefined && (
                <span>C: <strong className="text-foreground">₹{hoverData.close.toFixed(2)}</strong></span>
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

      {/* Technical Summary Bar (When real candles exist) */}
      {indicatorsData && (
        <div className="px-4 py-2 border-t bg-muted/10 text-[11px] tabular-nums flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
          {indicatorsData.rsi14?.latest !== null && (
            <span>
              RSI (14): <strong className="text-foreground">{indicatorsData.rsi14?.latest}</strong>
            </span>
          )}
          {indicatorsData.sma20?.latest !== null && (
            <span>
              SMA (20): <strong className="text-foreground">₹{indicatorsData.sma20?.latest}</strong>
            </span>
          )}
          {indicatorsData.ema20?.latest !== null && (
            <span>
              EMA (20): <strong className="text-foreground">₹{indicatorsData.ema20?.latest}</strong>
            </span>
          )}
          {indicatorsData.bollinger?.latest && (
            <span>
              BB Mid: <strong className="text-foreground">₹{indicatorsData.bollinger.latest.middle}</strong>
            </span>
          )}
          {indicatorsData.atr?.latest !== null && (
            <span>
              ATR (14): <strong className="text-foreground">₹{indicatorsData.atr?.latest}</strong>
            </span>
          )}
        </div>
      )}

      {/* Footer Attribution */}
      <div className="px-4 py-2 border-t bg-muted/20 text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-2">
        <span>
          <strong className="text-foreground font-semibold">{symbol}</strong> • Historical data: <strong className="text-foreground">Yahoo Finance</strong> • Live quote: <strong className="text-foreground">0xramm</strong>
        </span>
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
