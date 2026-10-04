'use client';

import { useQuery } from '@tanstack/react-query';
import { StockQuote } from '@/types/market';
import { REFRESH_CONFIG } from '@/config/constants';
import { useSettingsStore } from './use-settings';

interface UseBatchQuotesOptions {
  enabled?: boolean;
  autoRefresh?: boolean;
}

export function useBatchQuotes(symbols: string[], options: UseBatchQuotesOptions = {}) {
  const { enabled = true, autoRefresh = true } = options;
  const refreshIntervalMs = useSettingsStore((state) => state.refreshIntervalMs);

  const cleanSymbols = symbols
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0)
    .sort();

  const joined = cleanSymbols.join(',');

  return useQuery<StockQuote[], Error>({
    queryKey: ['batch-quotes', joined],
    queryFn: async () => {
      if (cleanSymbols.length === 0) {
        return [];
      }

      const res = await fetch(`/api/market/batch?symbols=${encodeURIComponent(joined)}`);
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || body.message || 'Failed to fetch batch quotes');
      }

      return (body.data as StockQuote[]) || [];
    },
    enabled: enabled && cleanSymbols.length > 0,
    staleTime: REFRESH_CONFIG.staleTimeQuotesMs,
    refetchInterval: autoRefresh ? refreshIntervalMs : false,
    refetchIntervalInBackground: false,
    retry: 1,
  });
}
