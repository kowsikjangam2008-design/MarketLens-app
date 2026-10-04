'use client';

import { useQuery } from '@tanstack/react-query';
import { StockQuote } from '@/types/market';
import { REFRESH_CONFIG } from '@/config/constants';
import { useSettingsStore } from './use-settings';

interface UseStockQuoteOptions {
  enabled?: boolean;
  autoRefresh?: boolean;
}

export function useStockQuote(symbol: string, options: UseStockQuoteOptions = {}) {
  const { enabled = true, autoRefresh = true } = options;
  const refreshIntervalMs = useSettingsStore((state) => state.refreshIntervalMs);

  return useQuery<StockQuote, Error>({
    queryKey: ['stock-quote', symbol.trim().toUpperCase()],
    queryFn: async () => {
      const clean = symbol.trim().toUpperCase();
      if (!clean) {
        throw new Error('Symbol is required');
      }

      const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(clean)}`);
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || body.message || `Failed to fetch quote for ${clean}`);
      }

      return body.data as StockQuote;
    },
    enabled: enabled && !!symbol.trim(),
    staleTime: REFRESH_CONFIG.staleTimeQuotesMs,
    refetchInterval: autoRefresh ? refreshIntervalMs : false,
    refetchIntervalInBackground: false, // Don't poll when tab is backgrounded
    retry: 1,
  });
}
