'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  AreaSeries,
  ColorType,
  Time,
} from 'lightweight-charts';
import { useTheme } from 'next-themes';
import { LineChart as LineChartIcon, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { PaperPortfolioSnapshot } from '@/types/paper-trading';
import { cn } from '@/lib/utils';

interface PerformanceChartProps {
  snapshots: PaperPortfolioSnapshot[];
  height?: number;
}

type TimeRange = '1D' | '1W' | '1M' | '6M' | '1Y' | 'ALL';

export function PerformanceChart({
  snapshots,
  height = 320,
}: PerformanceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [timeRange, setTimeRange] = useState<TimeRange>('ALL');

  // Filter snapshots based on selected range
  const filteredSnapshots = useMemo(() => {
    if (snapshots.length < 2) return snapshots;

    const now = Date.now();
    const cutoffMap: Record<TimeRange, number> = {
      '1D': now - 24 * 60 * 60 * 1000,
      '1W': now - 7 * 24 * 60 * 60 * 1000,
      '1M': now - 30 * 24 * 60 * 60 * 1000,
      '6M': now - 180 * 24 * 60 * 60 * 1000,
      '1Y': now - 365 * 24 * 60 * 60 * 1000,
      ALL: 0,
    };

    const cutoff = cutoffMap[timeRange];
    const filtered = snapshots.filter(
      (s) => new Date(s.recorded_at).getTime() >= cutoff
    );

    return filtered.length >= 2 ? filtered : snapshots;
  }, [snapshots, timeRange]);

  // Transform snapshots into lightweight-charts format
  const chartData = useMemo(() => {
    if (filteredSnapshots.length < 2) return [];

    // Deduplicate and ensure strictly ascending timestamps
    const sorted = [...filteredSnapshots].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );

    const points: { time: Time; value: number }[] = [];
    let lastTimestampSec = 0;

    for (const snap of sorted) {
      const snapTime = new Date(snap.recorded_at).getTime();
      let sec = Math.floor(snapTime / 1000);
      // Ensure strictly monotonically increasing time for Lightweight Charts
      if (sec <= lastTimestampSec) {
        sec = lastTimestampSec + 1;
      }
      lastTimestampSec = sec;

      points.push({
        time: sec as Time,
        value: snap.total_value,
      });
    }

    return points;
  }, [filteredSnapshots]);

  useEffect(() => {
    if (!containerRef.current || chartData.length < 2) return;

    // Cleanup previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = containerRef.current;
    const bg = isDark ? '#090d16' : '#ffffff';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: bg },
        textColor,
        fontFamily: 'Inter, -apple-system, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      timeScale: {
        borderColor: gridColor,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: gridColor,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
    });

    const lastVal = chartData[chartData.length - 1]?.value ?? 0;
    const firstVal = chartData[0]?.value ?? 0;
    const isPositiveTrajectory = lastVal >= firstVal;
    const lineColor = isPositiveTrajectory ? '#10b981' : '#f43f5e';
    const topColor = isPositiveTrajectory
      ? 'rgba(16, 185, 129, 0.28)'
      : 'rgba(244, 63, 94, 0.28)';
    const bottomColor = isPositiveTrajectory
      ? 'rgba(16, 185, 129, 0.00)'
      : 'rgba(244, 63, 94, 0.00)';

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor,
      topColor,
      bottomColor,
      lineWidth: 2,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => `₹${price.toLocaleString('en-IN')}`,
      },
    });

    areaSeries.setData(chartData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartData, height, isDark]);

  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="py-3 px-4 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
          <LineChartIcon className="h-4 w-4 text-primary" />
          Portfolio Performance
        </CardTitle>

        {/* Range selectors */}
        <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-md border text-[11px]">
          {(['1D', '1W', '1M', '6M', '1Y', 'ALL'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTimeRange(r)}
              className={cn(
                'px-2 py-0.5 rounded font-medium transition-colors',
                timeRange === r
                  ? 'bg-card text-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {chartData.length < 2 ? (
          <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 bg-muted/20 rounded-lg border border-dashed border-border/60">
            <Clock className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <h5 className="text-xs font-semibold text-foreground">
              Not enough portfolio history yet.
            </h5>
            <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
              Snapshots are recorded automatically as simulated trades are placed. Complete trades to chart portfolio trajectory over time.
            </p>
          </div>
        ) : (
          <div ref={containerRef} className="w-full relative" />
        )}
      </CardContent>
    </Card>
  );
}
