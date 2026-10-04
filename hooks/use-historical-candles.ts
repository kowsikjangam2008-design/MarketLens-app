'use client';

import { useQuery } from '@tanstack/react-query';
import { HistoricalCandle } from '@/types/market';
import { Timeframe } from '@/components/charts/chart-controls';

interface HistoryApiResponse {
  symbol: string;
  range: string;
  data: HistoricalCandle[];
  count: number;
  source: string;
  error?: string;
  message?: string;
}

export function useHistoricalCandles(symbol: string, timeframe: Timeframe = '1D') {
  const cleanSymbol = symbol ? symbol.trim().toUpperCase() : '';

  return useQuery<HistoricalCandle[], Error>({
    queryKey: ['historical-candles', cleanSymbol, timeframe],
    queryFn: async () => {
      if (!cleanSymbol) return [];

      const res = await fetch(
        `/api/market/history?symbol=${encodeURIComponent(cleanSymbol)}&range=${encodeURIComponent(timeframe)}`
      );
      const json: HistoryApiResponse = await res.json();

      if (!res.ok) {
        throw new Error(json.error || json.message || `Failed to fetch historical data for ${cleanSymbol}`);
      }

      return json.data || [];
    },
    enabled: Boolean(cleanSymbol),
    staleTime: timeframe === '1D' ? 60000 : timeframe === '1W' ? 300000 : 3600000,
    retry: 1,
  });
}
